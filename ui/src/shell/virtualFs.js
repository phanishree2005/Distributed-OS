// ==============================================================================
// DistributedOS - High-Fidelity In-Memory & Persistent Virtual Filesystem (VFS)
// Fully conforms to POSIX-like hierarchical inode structure with localStorage sync.
// ==============================================================================

const STORAGE_KEY = 'distributed_os_vfs_v2';

export class VirtualFS {
  constructor() {
    this.root = null;
    this.init();
  }

  init() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.root = JSON.parse(saved);
          return;
        }
      }
    } catch (e) {
      console.warn('VFS localStorage load error, falling back to default:', e);
    }
    this.resetToDefaults();
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined' && this.root) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.root));
      }
    } catch (e) {
      console.warn('VFS localStorage save error:', e);
    }
  }

  resetToDefaults() {
    const now = new Date().toISOString();
    this.root = {
      name: '',
      type: 'dir',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      mtime: now,
      children: {
        root: {
          name: 'root',
          type: 'dir',
          permissions: 'drwx------',
          owner: 'root',
          group: 'root',
          mtime: now,
          children: {
            'secret.txt': {
              name: 'secret.txt',
              type: 'file',
              permissions: '-rw-------',
              owner: 'root',
              group: 'root',
              mtime: now,
              content: 'CLUSTER_MASTER_KEY=0x9FA82C10E8\nRAFT_TOKEN=d83921af78c02\nREGION=ap-south-1\n'
            },
            '.bashrc': {
              name: '.bashrc',
              type: 'file',
              permissions: '-rw-r--r--',
              owner: 'root',
              group: 'root',
              mtime: now,
              content: '# ~/.bashrc: executed by bash for non-login shells.\nexport PS1="root@distributed-os:\\w# "\nalias ll="ls -la"\nalias l="ls -CF"\n'
            }
          }
        },
        boot: {
          name: 'boot',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          mtime: now,
          children: {
            'kernel.bin': {
              name: 'kernel.bin',
              type: 'file',
              permissions: '-rwxr-xr-x',
              owner: 'root',
              group: 'root',
              mtime: now,
              content: '[x86 Executable Binary: 32-bit Protected Mode kernel ELF image, entry 0x1000, GDT at 0x800]'
            }
          }
        },
        etc: {
          name: 'etc',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          mtime: now,
          children: {
            'hosts.conf': {
              name: 'hosts.conf',
              type: 'file',
              permissions: '-rw-r--r--',
              owner: 'root',
              group: 'root',
              mtime: now,
              content: '127.0.0.1   localhost\n192.168.1.101 NodeA\n192.168.1.102 NodeB\n192.168.1.103 NodeC\n192.168.1.104 NodeD\n'
            },
            'os-release': {
              name: 'os-release',
              type: 'file',
              permissions: '-rw-r--r--',
              owner: 'root',
              group: 'root',
              mtime: now,
              content: 'NAME="DistributedOS"\nVERSION="1.0.4-LTS"\nID="distributed-os"\nID_LIKE="gnu-linux"\nPRETTY_NAME="DistributedOS 1.0.4 (x86_32 Protected Mode + Raft Cluster)"\n'
            },
            'system.conf': {
              name: 'system.conf',
              type: 'file',
              permissions: '-rw-r--r--',
              owner: 'root',
              group: 'root',
              mtime: now,
              content: 'SCHEDULER=round-robin\nQUANTUM_MS=10\nPAGING=4MB_PAGES\nINTERRUPTS=APIC_ENABLED\n'
            }
          }
        },
        bin: {
          name: 'bin',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          mtime: now,
          children: {
            bash: { name: 'bash', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', mtime: now, content: '[GNU Bash 5.2.37 ELF binary]' },
            sh: { name: 'sh', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', mtime: now, content: '[POSIX SH ELF binary]' },
            cat: { name: 'cat', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', mtime: now, content: '[Coreutils cat ELF binary]' },
            ls: { name: 'ls', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', mtime: now, content: '[Coreutils ls ELF binary]' },
            pwd: { name: 'pwd', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', mtime: now, content: '[Coreutils pwd ELF binary]' },
            mkdir: { name: 'mkdir', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', mtime: now, content: '[Coreutils mkdir ELF binary]' },
            echo: { name: 'echo', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', mtime: now, content: '[Coreutils echo ELF binary]' },
            grep: { name: 'grep', type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', mtime: now, content: '[GNU grep ELF binary]' }
          }
        },
        var: {
          name: 'var',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          mtime: now,
          children: {
            log: {
              name: 'log',
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'root',
              group: 'root',
              mtime: now,
              children: {
                'boot.log': {
                  name: 'boot.log',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  owner: 'root',
                  group: 'root',
                  mtime: now,
                  content: '[0.000000] Kernel entry reached at 0x1000\n[0.000014] Enabling A20 gate via keyboard controller\n[0.000045] Loading 32-bit Global Descriptor Table (GDT)\n[0.000120] Paging enabled: 1024 Page Tables mapped (0x0 - 0x400000)\n[0.000250] PIT Timer Interrupt IRQ 0 set to 100 Hz\n[0.000380] Round-Robin scheduler initialized with idle process PID 0\n'
                }
              }
            }
          }
        },
        tmp: {
          name: 'tmp',
          type: 'dir',
          permissions: 'drwxrwxrwt',
          owner: 'root',
          group: 'root',
          mtime: now,
          children: {}
        },
        proc: {
          name: 'proc',
          type: 'dir',
          permissions: 'dr-xr-xr-x',
          owner: 'root',
          group: 'root',
          mtime: now,
          children: {
            cpuinfo: {
              name: 'cpuinfo',
              type: 'file',
              permissions: '-r--r--r--',
              owner: 'root',
              group: 'root',
              mtime: now,
              content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel name\t: QEMU Virtual CPU version 2.5+\nstepping\t: 3\ncpu MHz\t\t: 2800.000\ncache size\t: 16384 KB\n'
            },
            version: {
              name: 'version',
              type: 'file',
              permissions: '-r--r--r--',
              owner: 'root',
              group: 'root',
              mtime: now,
              content: 'Linux version 1.0.4-distributed-os (root@build-worker) (gcc version 16.1.0) #1 SMP Mon Nov 26 15:45:00 UTC 2026\n'
            }
          }
        }
      }
    };
    this.save();
  }

  // --- Path resolution helpers ---

  normalizePath(cwd, inputPath) {
    if (!inputPath || inputPath.trim() === '') return cwd || '/';
    let pathStr = inputPath.trim();

    // Handle home tilde expansion
    if (pathStr === '~') pathStr = '/root';
    else if (pathStr.startsWith('~/')) pathStr = '/root/' + pathStr.substring(2);

    let parts;
    if (pathStr.startsWith('/')) {
      parts = pathStr.split('/');
    } else {
      const base = (cwd && cwd.startsWith('/')) ? cwd : '/';
      parts = (base + '/' + pathStr).split('/');
    }

    const resolved = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  // Traverse the directory tree to find an inode
  getNode(absPath) {
    if (absPath === '/' || absPath === '') return this.root;
    const parts = absPath.split('/').filter(Boolean);
    let curr = this.root;

    for (const part of parts) {
      if (!curr || curr.type !== 'dir' || !curr.children) return null;
      curr = curr.children[part];
      if (!curr) return null;
    }
    return curr;
  }

  // Returns { parentNode, name, parentPath }
  getParentInfo(absPath) {
    if (absPath === '/') return { parentNode: null, name: '', parentPath: '/' };
    const parts = absPath.split('/').filter(Boolean);
    const name = parts.pop();
    const parentPath = '/' + parts.join('/');
    const parentNode = this.getNode(parentPath);
    return { parentNode, name, parentPath };
  }

  // --- Core Filesystem Operations ---

  mkdir(absPath, recursive = false) {
    if (absPath === '/') throw new Error("cannot create directory '/': File exists");
    if (this.getNode(absPath)) throw new Error(`cannot create directory '${absPath}': File exists`);

    const parts = absPath.split('/').filter(Boolean);
    let curr = this.root;
    let accumulated = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      accumulated += '/' + part;
      const isLast = i === parts.length - 1;

      if (!curr.children) curr.children = {};

      if (!curr.children[part]) {
        if (!isLast && !recursive) {
          throw new Error(`cannot create directory '${absPath}': No such file or directory`);
        }
        curr.children[part] = {
          name: part,
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          group: 'root',
          mtime: new Date().toISOString(),
          children: {}
        };
      } else if (curr.children[part].type !== 'dir') {
        throw new Error(`cannot create directory '${accumulated}': Not a directory`);
      }
      curr = curr.children[part];
    }
    this.save();
    return true;
  }

  rmdir(absPath) {
    if (absPath === '/') throw new Error("cannot remove '/': Device or resource busy");
    const node = this.getNode(absPath);
    if (!node) throw new Error(`failed to remove '${absPath}': No such file or directory`);
    if (node.type !== 'dir') throw new Error(`failed to remove '${absPath}': Not a directory`);

    const entries = Object.keys(node.children || {});
    if (entries.length > 0) throw new Error(`failed to remove '${absPath}': Directory not empty`);

    const { parentNode, name } = this.getParentInfo(absPath);
    delete parentNode.children[name];
    this.save();
    return true;
  }

  touch(absPath) {
    const node = this.getNode(absPath);
    const now = new Date().toISOString();
    if (node) {
      node.mtime = now;
      this.save();
      return true;
    }

    const { parentNode, name } = this.getParentInfo(absPath);
    if (!parentNode || parentNode.type !== 'dir') {
      throw new Error(`cannot touch '${absPath}': No such file or directory`);
    }

    parentNode.children[name] = {
      name,
      type: 'file',
      permissions: '-rw-r--r--',
      owner: 'root',
      group: 'root',
      mtime: now,
      content: ''
    };
    this.save();
    return true;
  }

  writeFile(absPath, content, append = false) {
    const node = this.getNode(absPath);
    const now = new Date().toISOString();
    if (node) {
      if (node.type === 'dir') throw new Error(`cannot write to '${absPath}': Is a directory`);
      node.content = append ? (node.content + content) : content;
      node.mtime = now;
      this.save();
      return true;
    }

    const { parentNode, name } = this.getParentInfo(absPath);
    if (!parentNode || parentNode.type !== 'dir') {
      throw new Error(`cannot create '${absPath}': No such file or directory`);
    }

    parentNode.children[name] = {
      name,
      type: 'file',
      permissions: '-rw-r--r--',
      owner: 'root',
      group: 'root',
      mtime: now,
      content: content || ''
    };
    this.save();
    return true;
  }

  readFile(absPath) {
    const node = this.getNode(absPath);
    if (!node) throw new Error(`'${absPath}': No such file or directory`);
    if (node.type === 'dir') throw new Error(`'${absPath}': Is a directory`);
    return node.content || '';
  }

  rm(absPath, recursive = false, force = false) {
    if (absPath === '/') throw new Error("it is dangerous to operate recursively on '/'");
    const node = this.getNode(absPath);
    if (!node) {
      if (force) return true;
      throw new Error(`cannot remove '${absPath}': No such file or directory`);
    }

    if (node.type === 'dir' && !recursive) {
      throw new Error(`cannot remove '${absPath}': Is a directory`);
    }

    const { parentNode, name } = this.getParentInfo(absPath);
    if (parentNode && parentNode.children) {
      delete parentNode.children[name];
      this.save();
      return true;
    }
    return false;
  }

  cp(srcPath, destPath, recursive = false) {
    const srcNode = this.getNode(srcPath);
    if (!srcNode) throw new Error(`cannot stat '${srcPath}': No such file or directory`);

    if (srcNode.type === 'dir' && !recursive) {
      throw new Error(`-r not specified; omitting directory '${srcPath}'`);
    }

    let targetAbs = destPath;
    const destNode = this.getNode(destPath);
    if (destNode && destNode.type === 'dir') {
      const srcName = srcPath.split('/').filter(Boolean).pop();
      targetAbs = (destPath === '/' ? '' : destPath) + '/' + srcName;
    }

    const deepClone = JSON.parse(JSON.stringify(srcNode));
    const { parentNode, name } = this.getParentInfo(targetAbs);
    if (!parentNode || parentNode.type !== 'dir') {
      throw new Error(`cannot create regular file '${targetAbs}': No such file or directory`);
    }

    deepClone.name = name;
    deepClone.mtime = new Date().toISOString();
    parentNode.children[name] = deepClone;
    this.save();
    return true;
  }

  mv(srcPath, destPath) {
    if (srcPath === destPath) return true;
    this.cp(srcPath, destPath, true);
    this.rm(srcPath, true, true);
    return true;
  }

  chmod(absPath, modeStr) {
    const node = this.getNode(absPath);
    if (!node) throw new Error(`cannot access '${absPath}': No such file or directory`);

    // Handle octal (e.g. 755, 644)
    if (/^[0-7]{3,4}$/.test(modeStr)) {
      const octal = modeStr.slice(-3);
      const permMap = {
        '0': '---', '1': '--x', '2': '-w-', '3': '-wx',
        '4': 'r--', '5': 'r-x', '6': 'rw-', '7': 'rwx'
      };
      const prefix = node.type === 'dir' ? 'd' : '-';
      node.permissions = prefix + permMap[octal[0]] + permMap[octal[1]] + permMap[octal[2]];
      this.save();
      return true;
    }

    // Handle symbolic (+x, -w)
    if (modeStr.includes('+x')) {
      node.permissions = node.permissions.replace(/-([rwx-]{2})$/, 'x$1').replace(/^-r([w-][r-][w-][r-][w-])-/, '-r$1x');
    }
    this.save();
    return true;
  }

  chown(absPath, ownerGroup) {
    const node = this.getNode(absPath);
    if (!node) throw new Error(`cannot access '${absPath}': No such file or directory`);
    const [owner, group] = ownerGroup.split(':');
    if (owner) node.owner = owner;
    if (group) node.group = group;
    this.save();
    return true;
  }

  readDir(absPath) {
    const node = this.getNode(absPath);
    if (!node) throw new Error(`cannot access '${absPath}': No such file or directory`);
    if (node.type !== 'dir') throw new Error(`'${absPath}': Not a directory`);
    return Object.values(node.children || {});
  }

  // Generate flat list for VFS explorer component
  exportFlatList(startNode = this.root, currentPath = '') {
    let result = [];
    if (!startNode || !startNode.children) return result;

    for (const [key, item] of Object.entries(startNode.children)) {
      const fullPath = (currentPath === '/' ? '' : currentPath) + '/' + key;
      if (item.type === 'dir') {
        result.push({
          name: key + '/',
          type: 'folder',
          size: '--',
          permissions: item.permissions || 'drwxr-xr-x',
          path: fullPath,
          content: Object.keys(item.children || {}).join(', ')
        });
        result = result.concat(this.exportFlatList(item, fullPath));
      } else {
        const sizeBytes = item.content ? item.content.length : 0;
        let sizeStr = `${sizeBytes} B`;
        if (sizeBytes >= 1024) sizeStr = `${(sizeBytes / 1024).toFixed(1)} KB`;

        result.push({
          name: key,
          type: 'file',
          size: sizeStr,
          permissions: item.permissions || '-rw-r--r--',
          path: fullPath,
          content: item.content || ''
        });
      }
    }
    return result;
  }
}

export const globalVFS = new VirtualFS();
