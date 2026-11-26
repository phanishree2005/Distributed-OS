// ==============================================================================
// DistributedOS - Linux Command Execution Engine & Shell Interpreter
// Supports full tokenization, quotes, pipes, redirection, env vars, and POSIX commands.
// ==============================================================================

import { globalVFS } from './virtualFs.js';

export class ShellEngine {
  constructor(vfs = globalVFS) {
    this.vfs = vfs;
    this.cwd = '/root';
    this.oldPwd = '/';
    this.env = {
      USER: 'root',
      HOME: '/root',
      SHELL: '/bin/bash',
      PATH: '/bin:/usr/bin:/sbin:/usr/sbin',
      TERM: 'xterm-256color',
      OS: 'DistributedOS',
      KERNEL_VERSION: '1.0.4-x86_32',
      LANG: 'en_US.UTF-8'
    };
    this.history = [];
    this.clusterCallbacks = {};
  }

  setClusterCallbacks(callbacks) {
    this.clusterCallbacks = callbacks || {};
  }

  // --- Lexer & Parser ---

  tokenize(cmdLine) {
    const tokens = [];
    let current = '';
    let inDouble = false;
    let inSingle = false;

    for (let i = 0; i < cmdLine.length; i++) {
      const char = cmdLine[i];

      if (char === '\\' && !inSingle && i + 1 < cmdLine.length) {
        current += cmdLine[++i];
        continue;
      }

      if (char === '"' && !inSingle) {
        inDouble = !inDouble;
        continue;
      }

      if (char === "'" && !inDouble) {
        inSingle = !inSingle;
        continue;
      }

      if (!inDouble && !inSingle) {
        if (char === '|' || char === '>') {
          if (current) {
            tokens.push(current);
            current = '';
          }
          if (char === '>' && cmdLine[i + 1] === '>') {
            tokens.push('>>');
            i++;
          } else {
            tokens.push(char);
          }
          continue;
        }

        if (/\s/.test(char)) {
          if (current) {
            tokens.push(current);
            current = '';
          }
          continue;
        }
      }

      current += char;
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  // Expand environment variables (e.g., $USER, $HOME, $PWD)
  expandVariables(token) {
    return token.replace(/\$([A-Za-z0-9_]+|\?)/g, (match, varName) => {
      if (varName === 'PWD') return this.cwd;
      if (varName === 'OLDPWD') return this.oldPwd;
      if (varName === '?') return '0';
      return this.env[varName] !== undefined ? this.env[varName] : '';
    });
  }

  // Parse a command line into a pipeline of stages with optional redirections
  parsePipeline(cmdLine) {
    const rawTokens = this.tokenize(cmdLine);
    const stages = [];
    let currentStage = { args: [], redirect: null };

    for (let i = 0; i < rawTokens.length; i++) {
      const tok = rawTokens[i];

      if (tok === '|') {
        stages.push(currentStage);
        currentStage = { args: [], redirect: null };
      } else if (tok === '>' || tok === '>>') {
        const target = rawTokens[++i];
        if (!target) {
          throw new Error(`syntax error near unexpected token 'newline'`);
        }
        currentStage.redirect = {
          type: tok === '>>' ? 'append' : 'write',
          file: this.expandVariables(target)
        };
      } else {
        currentStage.args.push(this.expandVariables(tok));
      }
    }

    if (currentStage.args.length > 0 || currentStage.redirect) {
      stages.push(currentStage);
    }

    return stages;
  }

  // --- Main Execution Entrypoint ---

  execute(cmdLine) {
    const trimmed = cmdLine.trim();
    if (!trimmed) return { output: [], cwd: this.cwd };

    this.history.push(trimmed);

    let stages;
    try {
      stages = this.parsePipeline(trimmed);
    } catch (e) {
      return {
        output: [{ type: 'error', text: `bash: ${e.message}` }],
        cwd: this.cwd
      };
    }

    if (stages.length === 0) return { output: [], cwd: this.cwd };

    let currentInput = '';
    let lastResult = null;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      if (stage.args.length === 0) continue;

      const cmd = stage.args[0];
      const args = stage.args.slice(1);

      try {
        lastResult = this.runCommand(cmd, args, currentInput);
      } catch (err) {
        return {
          output: [{ type: 'error', text: `${cmd}: ${err.message}` }],
          cwd: this.cwd
        };
      }

      if (lastResult.clear) {
        return { clear: true, cwd: this.cwd, output: [] };
      }

      let stageStdout = lastResult.stdout || '';

      // Handle output redirection (e.g., > or >>)
      if (stage.redirect) {
        const targetPath = this.vfs.normalizePath(this.cwd, stage.redirect.file);
        try {
          this.vfs.writeFile(targetPath, stageStdout, stage.redirect.type === 'append');
          stageStdout = ''; // standard shell redirection produces no terminal output
        } catch (err) {
          return {
            output: [{ type: 'error', text: `bash: ${stage.redirect.file}: ${err.message}` }],
            cwd: this.cwd
          };
        }
      }

      currentInput = stageStdout;
    }

    const outputLines = [];
    if (lastResult && lastResult.stderr) {
      outputLines.push({ type: 'error', text: lastResult.stderr });
    }
    if (currentInput) {
      const lines = currentInput.split('\n');
      for (const line of lines) {
        if (line !== '' || lines.length === 1) {
          outputLines.push({ type: 'info', text: line });
        }
      }
    }

    return {
      output: outputLines,
      cwd: this.cwd
    };
  }

  // --- Dispatcher ---

  runCommand(cmd, args, stdin = '') {
    switch (cmd) {
      // 1. Navigation
      case 'pwd':
        return { stdout: this.cwd + '\n' };
      case 'cd':
        return this.cmdCd(args);
      case 'ls':
        return this.cmdLs(args);
      case 'tree':
        return this.cmdTree(args);

      // 2. Filesystem Mutation
      case 'mkdir':
        return this.cmdMkdir(args);
      case 'rmdir':
        return this.cmdRmdir(args);
      case 'touch':
        return this.cmdTouch(args);
      case 'rm':
        return this.cmdRm(args);
      case 'cp':
        return this.cmdCp(args);
      case 'mv':
        return this.cmdMv(args);
      case 'chmod':
        return this.cmdChmod(args);
      case 'chown':
        return this.cmdChown(args);

      // 3. File Operations
      case 'cat':
        return this.cmdCat(args, stdin);
      case 'echo':
        return this.cmdEcho(args);
      case 'head':
        return this.cmdHead(args, stdin);
      case 'tail':
        return this.cmdTail(args, stdin);
      case 'wc':
        return this.cmdWc(args, stdin);
      case 'grep':
        return this.cmdGrep(args, stdin);
      case 'find':
        return this.cmdFind(args);

      // 4. System & Hardware
      case 'uname':
        return this.cmdUname(args);
      case 'whoami':
        return { stdout: this.env.USER + '\n' };
      case 'date':
        return { stdout: new Date().toUTCString() + '\n' };
      case 'uptime':
        return { stdout: ' 16:30:00 up 4:45, 1 user, load average: 0.08, 0.12, 0.15\n' };
      case 'ps':
        return this.cmdPs(args);
      case 'df':
        return this.cmdDf(args);
      case 'du':
        return this.cmdDu(args);
      case 'free':
        return this.cmdFree(args);

      // 5. Utilities & Shell
      case 'which':
        return this.cmdWhich(args);
      case 'clear':
        return { clear: true };
      case 'history':
        return this.cmdHistory();
      case 'export':
        return this.cmdExport(args);
      case 'env':
        return this.cmdEnv();
      case 'help':
        return this.cmdHelp();

      // 6. Cluster & DistributedOS specific
      case 'status':
        return this.cmdClusterStatus();
      case 'ping':
        return this.cmdPing(args);
      case 'meminfo':
        return this.cmdMeminfo();
      case 'failover':
        if (this.clusterCallbacks.onFailover) this.clusterCallbacks.onFailover();
        return { stdout: '[RAFT] Triggered leader stepdown. Election in progress...\n' };
      case 'recover':
        if (this.clusterCallbacks.onRecover) this.clusterCallbacks.onRecover();
        return { stdout: '[CLUSTER] Heartbeat sweep initiated. Restoring offline nodes.\n' };
      case 'task':
        if (this.clusterCallbacks.onTask) this.clusterCallbacks.onTask();
        return { stdout: `[SCHEDULER] Dispatched distributed task to cluster quorum.\n` };

      default:
        return {
          stderr: `bash: ${cmd}: command not found. Type "help" for a list of supported Linux commands.\n`
        };
    }
  }

  // --- Command Implementations ---

  cmdCd(args) {
    let target = args[0];
    if (!target || target === '~') target = '/root';
    else if (target === '-') target = this.oldPwd;

    const resolved = this.vfs.normalizePath(this.cwd, target);
    const node = this.vfs.getNode(resolved);

    if (!node) {
      return { stderr: `bash: cd: ${target}: No such file or directory\n` };
    }
    if (node.type !== 'dir') {
      return { stderr: `bash: cd: ${target}: Not a directory\n` };
    }

    this.oldPwd = this.cwd;
    this.cwd = resolved;
    return { stdout: '' };
  }

  cmdLs(args) {
    let showAll = false;
    let showLong = false;
    let targetPaths = [];

    for (const arg of args) {
      if (arg.startsWith('-') && arg.length > 1) {
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) showLong = true;
      } else {
        targetPaths.push(arg);
      }
    }

    if (targetPaths.length === 0) targetPaths.push('.');

    let output = '';
    for (const target of targetPaths) {
      const resolved = this.vfs.normalizePath(this.cwd, target);
      const node = this.vfs.getNode(resolved);

      if (!node) {
        output += `ls: cannot access '${target}': No such file or directory\n`;
        continue;
      }

      if (node.type === 'file') {
        if (showLong) {
          output += `${node.permissions} 1 ${node.owner} ${node.group} ${String((node.content || '').length).padStart(6)} Nov 26 16:00 ${node.name}\n`;
        } else {
          output += node.name + '\n';
        }
        continue;
      }

      // Directory listing
      const entries = Object.values(node.children || {});
      const allEntries = [];

      if (showAll) {
        allEntries.push({
          name: '.',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: node.owner || 'root',
          group: node.group || 'root',
          size: 4096
        });
        allEntries.push({
          name: '..',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096
        });
      }

      for (const entry of entries) {
        if (!showAll && entry.name.startsWith('.')) continue;
        allEntries.push({
          ...entry,
          size: entry.type === 'dir' ? 4096 : (entry.content ? entry.content.length : 0)
        });
      }

      allEntries.sort((a, b) => a.name.localeCompare(b.name));

      if (targetPaths.length > 1) {
        output += `${target}:\n`;
      }

      if (showLong) {
        const totalBlocks = Math.ceil(allEntries.length * 4);
        output += `total ${totalBlocks}\n`;
        for (const item of allEntries) {
          const sizeStr = String(item.size).padStart(6);
          output += `${item.permissions} 1 ${item.owner} ${item.group} ${sizeStr} Nov 26 16:00 ${item.name}\n`;
        }
      } else {
        output += allEntries.map((e) => (e.type === 'dir' ? e.name + '/' : e.name)).join('  ') + '\n';
      }

      if (targetPaths.length > 1) output += '\n';
    }

    return { stdout: output };
  }

  cmdTree(args) {
    const target = args[0] || '.';
    const resolved = this.vfs.normalizePath(this.cwd, target);
    const rootNode = this.vfs.getNode(resolved);

    if (!rootNode) return { stderr: `tree: ${target}: No such file or directory\n` };
    if (rootNode.type !== 'dir') return { stdout: `${target}\n\n0 directories, 1 file\n` };

    let totalDirs = 0;
    let totalFiles = 0;
    let lines = [target];

    function walk(node, prefix = '') {
      const keys = Object.keys(node.children || {}).sort();
      keys.forEach((key, idx) => {
        const isLast = idx === keys.length - 1;
        const child = node.children[key];
        const branch = isLast ? '└── ' : '├── ';
        lines.push(`${prefix}${branch}${child.name}${child.type === 'dir' ? '/' : ''}`);

        if (child.type === 'dir') {
          totalDirs++;
          walk(child, prefix + (isLast ? '    ' : '│   '));
        } else {
          totalFiles++;
        }
      });
    }

    walk(rootNode);
    lines.push(`\n${totalDirs} directories, ${totalFiles} files\n`);
    return { stdout: lines.join('\n') };
  }

  cmdMkdir(args) {
    let recursive = false;
    const paths = [];

    for (const arg of args) {
      if (arg === '-p' || arg === '--parents') recursive = true;
      else if (!arg.startsWith('-')) paths.push(arg);
    }

    if (paths.length === 0) {
      return { stderr: 'mkdir: missing operand\n' };
    }

    for (const p of paths) {
      const resolved = this.vfs.normalizePath(this.cwd, p);
      try {
        this.vfs.mkdir(resolved, recursive);
      } catch (err) {
        return { stderr: `mkdir: ${err.message}\n` };
      }
    }
    return { stdout: '' };
  }

  cmdRmdir(args) {
    if (args.length === 0) return { stderr: 'rmdir: missing operand\n' };
    for (const p of args) {
      const resolved = this.vfs.normalizePath(this.cwd, p);
      try {
        this.vfs.rmdir(resolved);
      } catch (err) {
        return { stderr: `rmdir: ${err.message}\n` };
      }
    }
    return { stdout: '' };
  }

  cmdTouch(args) {
    if (args.length === 0) return { stderr: 'touch: missing file operand\n' };
    for (const p of args) {
      if (p.startsWith('-')) continue;
      const resolved = this.vfs.normalizePath(this.cwd, p);
      try {
        this.vfs.touch(resolved);
      } catch (err) {
        return { stderr: `touch: ${err.message}\n` };
      }
    }
    return { stdout: '' };
  }

  cmdRm(args) {
    let recursive = false;
    let force = false;
    const targets = [];

    for (const arg of args) {
      if (arg.startsWith('-') && arg.length > 1) {
        if (arg.includes('r') || arg.includes('R')) recursive = true;
        if (arg.includes('f')) force = true;
      } else {
        targets.push(arg);
      }
    }

    if (targets.length === 0 && !force) {
      return { stderr: 'rm: missing operand\n' };
    }

    for (const t of targets) {
      const resolved = this.vfs.normalizePath(this.cwd, t);
      try {
        this.vfs.rm(resolved, recursive, force);
      } catch (err) {
        if (!force) return { stderr: `rm: ${err.message}\n` };
      }
    }
    return { stdout: '' };
  }

  cmdCp(args) {
    let recursive = false;
    const targets = [];

    for (const arg of args) {
      if (arg === '-r' || arg === '-R' || arg === '--recursive') recursive = true;
      else if (!arg.startsWith('-')) targets.push(arg);
    }

    if (targets.length < 2) {
      return { stderr: "cp: missing destination file operand\n" };
    }

    const src = this.vfs.normalizePath(this.cwd, targets[0]);
    const dest = this.vfs.normalizePath(this.cwd, targets[1]);

    try {
      this.vfs.cp(src, dest, recursive);
      return { stdout: '' };
    } catch (err) {
      return { stderr: `cp: ${err.message}\n` };
    }
  }

  cmdMv(args) {
    const targets = args.filter((a) => !a.startsWith('-'));
    if (targets.length < 2) {
      return { stderr: 'mv: missing file operand\n' };
    }

    const src = this.vfs.normalizePath(this.cwd, targets[0]);
    const dest = this.vfs.normalizePath(this.cwd, targets[1]);

    try {
      this.vfs.mv(src, dest);
      return { stdout: '' };
    } catch (err) {
      return { stderr: `mv: ${err.message}\n` };
    }
  }

  cmdChmod(args) {
    if (args.length < 2) return { stderr: 'chmod: missing operand\n' };
    const mode = args[0];
    const targets = args.slice(1);

    for (const t of targets) {
      const resolved = this.vfs.normalizePath(this.cwd, t);
      try {
        this.vfs.chmod(resolved, mode);
      } catch (err) {
        return { stderr: `chmod: ${err.message}\n` };
      }
    }
    return { stdout: '' };
  }

  cmdChown(args) {
    if (args.length < 2) return { stderr: 'chown: missing operand\n' };
    const owner = args[0];
    const targets = args.slice(1);

    for (const t of targets) {
      const resolved = this.vfs.normalizePath(this.cwd, t);
      try {
        this.vfs.chown(resolved, owner);
      } catch (err) {
        return { stderr: `chown: ${err.message}\n` };
      }
    }
    return { stdout: '' };
  }

  cmdCat(args, stdin = '') {
    if (args.length === 0) {
      return { stdout: stdin };
    }

    let out = '';
    for (const arg of args) {
      if (arg === '-') {
        out += stdin;
        continue;
      }
      const resolved = this.vfs.normalizePath(this.cwd, arg);
      try {
        out += this.vfs.readFile(resolved);
      } catch (err) {
        return { stderr: `cat: ${arg}: ${err.message}\n` };
      }
    }
    if (!out.endsWith('\n') && out.length > 0) out += '\n';
    return { stdout: out };
  }

  cmdEcho(args) {
    return { stdout: args.join(' ') + '\n' };
  }

  cmdHead(args, stdin = '') {
    let count = 10;
    const files = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        count = parseInt(args[++i], 10) || 10;
      } else if (args[i].startsWith('-') && /^\d+$/.test(args[i].slice(1))) {
        count = parseInt(args[i].slice(1), 10);
      } else {
        files.push(args[i]);
      }
    }

    let text = stdin;
    if (files.length > 0) {
      const resolved = this.vfs.normalizePath(this.cwd, files[0]);
      try {
        text = this.vfs.readFile(resolved);
      } catch (err) {
        return { stderr: `head: ${err.message}\n` };
      }
    }

    const lines = text.split('\n').slice(0, count);
    return { stdout: lines.join('\n') + '\n' };
  }

  cmdTail(args, stdin = '') {
    let count = 10;
    const files = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        count = parseInt(args[++i], 10) || 10;
      } else {
        files.push(args[i]);
      }
    }

    let text = stdin;
    if (files.length > 0) {
      const resolved = this.vfs.normalizePath(this.cwd, files[0]);
      try {
        text = this.vfs.readFile(resolved);
      } catch (err) {
        return { stderr: `tail: ${err.message}\n` };
      }
    }

    const allLines = text.split('\n');
    if (allLines[allLines.length - 1] === '') allLines.pop();
    const lines = allLines.slice(-count);
    return { stdout: lines.join('\n') + '\n' };
  }

  cmdWc(args, stdin = '') {
    let countLines = false;
    let countWords = false;
    let countBytes = false;
    const files = [];

    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('l')) countLines = true;
        if (a.includes('w')) countWords = true;
        if (a.includes('c')) countBytes = true;
      } else {
        files.push(a);
      }
    }

    if (!countLines && !countWords && !countBytes) {
      countLines = true;
      countWords = true;
      countBytes = true;
    }

    let text = stdin;
    let name = '';
    if (files.length > 0) {
      name = files[0];
      const resolved = this.vfs.normalizePath(this.cwd, files[0]);
      try {
        text = this.vfs.readFile(resolved);
      } catch (err) {
        return { stderr: `wc: ${err.message}\n` };
      }
    }

    const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const bytes = text.length;

    let parts = [];
    if (countLines) parts.push(String(lines).padStart(4));
    if (countWords) parts.push(String(words).padStart(4));
    if (countBytes) parts.push(String(bytes).padStart(6));
    if (name) parts.push(name);

    return { stdout: parts.join(' ') + '\n' };
  }

  cmdGrep(args, stdin = '') {
    let ignoreCase = false;
    let invert = false;
    let showLineNumbers = false;
    const positional = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith('-')) {
        if (a.includes('i')) ignoreCase = true;
        if (a.includes('v')) invert = true;
        if (a.includes('n')) showLineNumbers = true;
      } else {
        positional.push(a);
      }
    }

    if (positional.length === 0) return { stderr: 'grep: missing pattern\n' };

    const patternStr = positional[0];
    const regex = new RegExp(patternStr, ignoreCase ? 'i' : '');
    let text = stdin;

    if (positional.length > 1) {
      const resolved = this.vfs.normalizePath(this.cwd, positional[1]);
      try {
        text = this.vfs.readFile(resolved);
      } catch (err) {
        return { stderr: `grep: ${err.message}\n` };
      }
    }

    const matched = [];
    const lines = text.split('\n');
    lines.forEach((line, idx) => {
      if (!line && idx === lines.length - 1) return;
      const isMatch = regex.test(line);
      if ((isMatch && !invert) || (!isMatch && invert)) {
        matched.push(showLineNumbers ? `${idx + 1}:${line}` : line);
      }
    });

    return { stdout: matched.join('\n') + (matched.length > 0 ? '\n' : '') };
  }

  cmdFind(args) {
    const dir = args[0] && !args[0].startsWith('-') ? args[0] : '.';
    let namePattern = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && args[i + 1]) {
        namePattern = args[++i].replace(/\*/g, '.*');
      }
    }

    const resolved = this.vfs.normalizePath(this.cwd, dir);
    const startNode = this.vfs.getNode(resolved);
    if (!startNode) return { stderr: `find: '${dir}': No such file or directory\n` };

    const results = [];
    const regex = namePattern ? new RegExp(`^${namePattern}$`) : null;

    function walk(node, curPath) {
      if (!regex || regex.test(node.name)) {
        results.push(curPath);
      }
      if (node.type === 'dir' && node.children) {
        for (const [key, child] of Object.entries(node.children)) {
          const next = curPath === '/' ? `/${key}` : `${curPath}/${key}`;
          walk(child, next);
        }
      }
    }

    walk(startNode, dir);
    return { stdout: results.join('\n') + '\n' };
  }

  cmdUname(args) {
    if (args.includes('-a')) {
      return { stdout: 'Linux distributed-os 1.0.4-x86_32 #1 SMP Mon Nov 26 15:45:00 UTC 2026 i686 GNU/Linux\n' };
    }
    if (args.includes('-r')) return { stdout: '1.0.4-x86_32\n' };
    if (args.includes('-m')) return { stdout: 'i686\n' };
    return { stdout: 'Linux\n' };
  }

  cmdPs(args) {
    return {
      stdout:
        '  PID TTY          TIME CMD\n' +
        '    0 ?        00:00:04 [kthreadd]\n' +
        '    1 ?        00:00:01 /sbin/init\n' +
        '    2 ?        00:00:03 [raft_consensus_daemon]\n' +
        '    3 ?        00:00:01 /bin/rpc_cluster_server --port 8080\n' +
        '   42 tty1     00:00:00 /bin/bash\n'
    };
  }

  cmdDf(args) {
    return {
      stdout:
        'Filesystem     1K-blocks     Used Available Use% Mounted on\n' +
        '/dev/ata0p1       524288    34816    489472   7% /\n' +
        'tmpfs             131072       64    131008   1% /tmp\n'
    };
  }

  cmdDu(args) {
    const target = args[0] || '.';
    const resolved = this.vfs.normalizePath(this.cwd, target);
    const node = this.vfs.getNode(resolved);
    if (!node) return { stderr: `du: cannot access '${target}': No such file or directory\n` };

    let totalBytes = 0;
    function calc(n) {
      if (n.type === 'file') totalBytes += (n.content ? n.content.length : 0);
      else if (n.children) {
        totalBytes += 4096;
        Object.values(n.children).forEach(calc);
      }
    }
    calc(node);

    const kb = Math.ceil(totalBytes / 1024) || 4;
    return { stdout: `${kb}K\t${target}\n` };
  }

  cmdFree(args) {
    return {
      stdout:
        '               total        used        free      shared  buff/cache   available\n' +
        'Mem:            4096         284        3556          16         256        3796\n' +
        'Swap:           1024           0        1024\n'
    };
  }

  cmdWhich(args) {
    if (args.length === 0) return { stdout: '' };
    const binary = args[0];
    const binNode = this.vfs.getNode(`/bin/${binary}`);
    if (binNode) return { stdout: `/bin/${binary}\n` };
    return { stderr: `which: no ${binary} in (${this.env.PATH})\n` };
  }

  cmdHistory() {
    let out = '';
    this.history.forEach((cmd, idx) => {
      out += `${String(idx + 1).padStart(5)}  ${cmd}\n`;
    });
    return { stdout: out };
  }

  cmdExport(args) {
    if (args.length === 0) return this.cmdEnv();
    for (const a of args) {
      const idx = a.indexOf('=');
      if (idx !== -1) {
        const key = a.substring(0, idx);
        const val = a.substring(idx + 1);
        this.env[key] = val;
      }
    }
    return { stdout: '' };
  }

  cmdEnv() {
    let out = '';
    for (const [k, v] of Object.entries(this.env)) {
      out += `${k}=${v}\n`;
    }
    return { stdout: out };
  }

  cmdHelp() {
    return {
      stdout:
        '======================================================================\n' +
        ' DistributedOS Linux Shell Environment (POSIX-Compliant VFS v2.0)     \n' +
        '======================================================================\n\n' +
        'FILE & DIRECTORY NAVIGATION:\n' +
        '  pwd                 Print working directory\n' +
        '  cd <path>           Change directory (supports ~, .., ., -, spaces)\n' +
        '  ls [-la] [path]     List directory contents with permissions & sizes\n' +
        '  tree [path]         Display directory hierarchy as visual tree\n\n' +
        'FILESYSTEM OPERATIONS:\n' +
        '  mkdir [-p] <dir>    Create directories (supports recursive -p)\n' +
        '  rmdir <dir>         Remove empty directory\n' +
        '  touch <file>        Create empty file or update timestamp\n' +
        '  rm [-rf] <target>   Remove file or directory recursively\n' +
        '  cp [-r] <src> <dst> Copy file or directory\n' +
        '  mv <src> <dst>      Move or rename file/directory\n' +
        '  chmod <mode> <file> Change permissions (e.g. 755, +x)\n' +
        '  chown <usr:grp> <f> Change file ownership\n\n' +
        'TEXT & STREAM PROCESSING (Supports Pipes | and Redirection > >>):\n' +
        '  cat [file...]       Concatenate and display files\n' +
        '  echo <text>         Display line of text\n' +
        '  head [-n N] [file]  Output first N lines\n' +
        '  tail [-n N] [file]  Output last N lines\n' +
        '  wc [-l|-w|-c]       Count lines, words, and characters\n' +
        '  grep [-i|-v|-n]     Search pattern in text or streams\n' +
        '  find [dir] [-name]  Search for files by name\n\n' +
        'SYSTEM & STORAGE TELEMETRY:\n' +
        '  uname [-a]          Print system and kernel architecture\n' +
        '  whoami, date        Display current user and system date\n' +
        '  uptime, ps          Process table and cluster load\n' +
        '  df [-h], free [-m]  Storage and physical memory metrics\n' +
        '  clear, history      Screen and command history\n\n' +
        'DISTRIBUTED CLUSTER CONTROLS:\n' +
        '  status, failover, recover, ping <node>, task, meminfo\n'
    };
  }

  cmdClusterStatus() {
    return {
      stdout:
        '[CLUSTER TOPOLOGY]\n' +
        '  NodeA: 192.168.1.101  Role: LEADER    Health: 100%  Load: 12%\n' +
        '  NodeB: 192.168.1.102  Role: FOLLOWER  Health:  98%  Load: 45%\n' +
        '  NodeC: 192.168.1.103  Role: FOLLOWER  Health: 100%  Load:  8%\n' +
        '  NodeD: 192.168.1.104  Role: FOLLOWER  Health:   0%  (Offline/Recoverable)\n' +
        'Consensus Term: 3 | Quorum Active: 3/4 Nodes\n'
    };
  }

  cmdPing(args) {
    const host = args[0] || 'NodeB';
    return {
      stdout:
        `PING ${host} (192.168.1.102) 56(84) bytes of data.\n` +
        `64 bytes from 192.168.1.102: icmp_seq=1 ttl=64 time=0.298 ms\n` +
        `64 bytes from 192.168.1.102: icmp_seq=2 ttl=64 time=0.312 ms\n` +
        `--- ${host} ping statistics ---\n` +
        `2 packets transmitted, 2 received, 0% packet loss, time 1001ms\n`
    };
  }

  cmdMeminfo() {
    return {
      stdout:
        '[x86 Paging Subsystem]\n' +
        'CR0.PG = 1 (Paging Active) | CR3 = 0x0009C000 (Page Directory Base)\n' +
        'Page Size: 4 KB / 4 MB PSE Enabled\n' +
        'Mapped Memory: 0x00000000 - 0x00400000 (Identity Mapped Kernel Space)\n'
    };
  }
}

export const globalShell = new ShellEngine();
