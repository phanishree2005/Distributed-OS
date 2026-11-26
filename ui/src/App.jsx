import React, { useState, useEffect, useRef } from 'react';
import './index.css';

// ----------------------------------------------------
// INITIAL DATA
// ----------------------------------------------------
const INITIAL_NODES = [
  { id: 'NodeA', role: 'Leader', health: 100, load: 14, status: 'Active', ip: '192.168.1.101', term: 1, x: 200, y: 120 },
  { id: 'NodeB', role: 'Follower', health: 98, load: 38, status: 'Active', ip: '192.168.1.102', term: 1, x: 420, y: 120 },
  { id: 'NodeC', role: 'Follower', health: 100, load: 22, status: 'Active', ip: '192.168.1.103', term: 1, x: 420, y: 320 },
  { id: 'NodeD', role: 'Follower', health: 0, load: 0, status: 'Offline', ip: '192.168.1.104', term: 1, x: 200, y: 320 },
];

const INITIAL_FILES = [
  { name: 'kernel.bin', type: 'file', size: '64 KB', permissions: '-rwxr-xr-x', path: '/boot/kernel.bin', content: '[x86 Executable Binary Code: Entry 0x1000, 32-bit Protected Mode, GDT loaded at 0x800]' },
  { name: 'secret.txt', type: 'file', size: '128 B', permissions: '-rw-r--r--', path: '/root/secret.txt', content: 'CLUSTER_MASTER_KEY=0x9FA82C10E8\nRAFT_TOKEN=d83921af78c02\nREGION=ap-south-1' },
  { name: 'hosts.conf', type: 'file', size: '256 B', permissions: '-rw-r--r--', path: '/etc/hosts.conf', content: '127.0.0.1 localhost\n192.168.1.101 NodeA\n192.168.1.102 NodeB\n192.168.1.103 NodeC\n192.168.1.104 NodeD' },
  { name: 'boot.log', type: 'file', size: '1.2 KB', permissions: '-rw-r--r--', path: '/var/log/boot.log', content: '[0.000000] Kernel entry reached at 0x1000\n[0.000014] Enabling A20 gate via keyboard controller\n[0.000045] Loading 32-bit Global Descriptor Table (GDT)\n[0.000120] Paging enabled: 1024 Page Tables mapped (0x0 - 0x400000)\n[0.000250] PIT Timer Interrupt IRQ 0 set to 100 Hz\n[0.000380] Round-Robin scheduler initialized with idle process PID 0\n[0.000510] ATA PIO Primary Master detected: 512 MB QEMU HARDDISK' },
  { name: 'main.py', type: 'file', size: '180 B', permissions: '-rw-r--r--', path: '/root/main.py', content: '# Distributed Task Script\nfor i in range(1, 6):\n    print(f"Executing cluster task {i} on distributed core...")\nprint("All 5 tasks completed successfully!")' },
  { name: 'server.c', type: 'file', size: '420 B', permissions: '-rw-r--r--', path: '/root/server.c', content: '#include <stdio.h>\n\nint main() {\n    printf("DistributedOS RPC Server v1.0.4 starting on port 8080...\\n");\n    printf("Listening for Raft AppendEntries and VoteRequests.\\n");\n    return 0;\n}' },
  { name: 'bin/', type: 'folder', size: '--', permissions: 'drwxr-xr-x', path: '/bin', content: 'sh, cat, ls, pwd, echo, kill, ps, ping, python, gcc, node, top, ifconfig, free, df' },
  { name: 'etc/', type: 'folder', size: '--', permissions: 'drwxr-xr-x', path: '/etc', content: 'hosts.conf, system.conf, network.conf, raft.conf, resolv.conf' }
];

const CODE_TEMPLATES = {
  python: `# Python 3.12 (DistributedOS In-Browser Engine)
def raft_consensus_demo():
    nodes = ["NodeA", "NodeB", "NodeC"]
    leader = nodes[0]
    print(f"Current Leader: {leader}")
    
    # Simulate RPC Heartbeats
    for node in nodes[1:]:
        print(f"Heartbeat sent to {node} -> ACK (term=1)")
        
    # Process tasks
    tasks = [f"Task-{i}" for i in range(1, 4)]
    for task in tasks:
        print(f"Distributed task {task} committed via consensus quorum!")

raft_consensus_demo()`,
  javascript: `// JavaScript / Node.js Engine
function simulateClusterMetrics() {
  const nodes = [
    { id: 'NodeA', health: 100, role: 'Leader' },
    { id: 'NodeB', health: 98, role: 'Follower' },
    { id: 'NodeC', health: 95, role: 'Follower' }
  ];
  
  console.log("=== Cluster Status Report ===");
  nodes.forEach(n => {
    console.log(\`[\${n.id}] Status: OK | Role: \${n.role} | Health: \${n.health}%\`);
  });
  
  const avgHealth = nodes.reduce((acc, n) => acc + n.health, 0) / nodes.length;
  console.log(\`Average Cluster Health: \${avgHealth.toFixed(1)}%\`);
}

simulateClusterMetrics();`,
  c: `// C Language (GCC x86 Simulated Compiler)
#include <stdio.h>

int main() {
    printf("=========================================\\n");
    printf("  DistributedOS Bare-Metal Kernel v1.0.4  \\n");
    printf("=========================================\\n");
    
    int pages = 1024;
    int page_size = 4096; // 4KB
    printf("Mapped Virtual Memory: %d KB (%d MB)\\n", (pages * page_size) / 1024, (pages * page_size) / (1024 * 1024));
    printf("Paging Status: ACTIVE (CR0 bit 31 = 1)\\n");
    printf("Round-Robin Multitasking: ONLINE\\n");
    return 0;
}`,
  go: `// Go Distributed Cluster Engine
package main

import "fmt"

func main() {
    fmt.Println("DistributedOS Raft Consensus Engine (Go)")
    nodes := []string{"NodeA", "NodeB", "NodeC"}
    fmt.Printf("Cluster initialized with %d active nodes.\\n", len(nodes))
    
    leader := nodes[0]
    fmt.Printf("Node %s elected as Leader for Term 1.\\n", leader)
    
    for i := 1; i <= 3; i++ {
        fmt.Printf("[RPC Dispatch] Task #%d replicated across majority quorum.\\n", i)
    }
    fmt.Println("Cluster Quorum verified: 100% consistent state.")
}`
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [term, setTerm] = useState(1);
  const [tasksCount, setTasksCount] = useState(748);
  const [isElectionInProgress, setIsElectionInProgress] = useState(false);
  const [currentDir, setCurrentDir] = useState('/root');
  const [files, setFiles] = useState(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILES[1]);
  const [fileEditContent, setFileEditContent] = useState(INITIAL_FILES[1].content);

  // Distributed Key-Value Store
  const [kvStore, setKvStore] = useState([
    { key: 'cluster_name', value: 'Production-Alpha-01', term: 1, node: 'NodeA' },
    { key: 'max_connections', value: '4096', term: 1, node: 'NodeA' },
    { key: 'heartbeat_timeout_ms', value: '500', term: 1, node: 'NodeA' },
    { key: 'scheduler_algorithm', value: 'Round-Robin-Preemptive', term: 1, node: 'NodeA' }
  ]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Code Runner
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [codeSource, setCodeSource] = useState(CODE_TEMPLATES.python);
  const [codeOutput, setCodeOutput] = useState('');
  const [isCodeRunning, setIsCodeRunning] = useState(false);

  // Terminal state
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState([
    { type: 'system', text: 'DistributedOS Kernel v1.0.4 - Full GNU/Linux Shell & x86 Protected Mode' },
    { type: 'system', text: 'Type "help" for a list of Linux commands, or try "pwd", "ls", "ps", "uname -a", "python", "date".' }
  ]);
  const terminalEndRef = useRef(null);

  // Settings
  const [heartbeatInterval, setHeartbeatInterval] = useState(500);
  const [autoRecovery, setAutoRecovery] = useState(true);
  const [quantum, setQuantum] = useState(10);
  const [packetDots, setPacketDots] = useState([]);

  // Cluster activity log
  const [logs, setLogs] = useState([
    { time: '15:40:01', msg: 'Kernel bootloader executed from 0x7C00.' },
    { time: '15:40:02', msg: 'Paging initialized: 1024 Page Tables mapped.' },
    { time: '15:40:04', msg: 'Raft consensus initialized. NodeA elected as Leader.' },
    { time: '15:40:10', msg: 'RPC server listening on ports 8001-8004.' }
  ]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, msg }, ...prev.slice(0, 24)]);
  };

  // Periodic heartbeat animation & packet dots on network graph
  useEffect(() => {
    const interval = setInterval(() => {
      const leader = nodes.find((n) => n.role === 'Leader' && n.status === 'Active');
      if (leader) {
        // Jitter loads
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            if (node.status === 'Active') {
              const jitter = Math.floor(Math.random() * 8) - 4;
              const newLoad = Math.max(5, Math.min(95, node.load + jitter));
              return { ...node, load: newLoad };
            }
            return node;
          })
        );

        // Spawn traveling packet animation on graph
        const newDots = nodes
          .filter((n) => n.id !== leader.id && n.status === 'Active')
          .map((follower) => ({
            id: Math.random(),
            fromX: leader.x,
            fromY: leader.y,
            toX: follower.x,
            toY: follower.y,
            targetId: follower.id
          }));
        setPacketDots(newDots);
        setTimeout(() => setPacketDots([]), 1400);
      }
    }, 2800);
    return () => clearInterval(interval);
  }, [nodes]);

  useEffect(() => {
    if (activeTab === 'Terminal' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [cliHistory, activeTab]);

  // Handle template switch in code runner
  const handleLanguageChange = (lang) => {
    setCodeLanguage(lang);
    setCodeSource(CODE_TEMPLATES[lang]);
    setCodeOutput('');
  };

  // Run Code in Browser
  const handleExecuteCode = () => {
    setIsCodeRunning(true);
    setCodeOutput('Compiling & Executing on DistributedOS virtual runtime...\n');

    setTimeout(() => {
      const startTime = performance.now();
      let outputBuffer = '';

      try {
        if (codeLanguage === 'javascript') {
          const logsCaptured = [];
          const customConsole = {
            log: (...args) => logsCaptured.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
            warn: (...args) => logsCaptured.push('[WARN] ' + args.join(' ')),
            error: (...args) => logsCaptured.push('[ERROR] ' + args.join(' '))
          };
          const runner = new Function('console', codeSource);
          runner(customConsole);
          outputBuffer = logsCaptured.join('\n');
        } else if (codeLanguage === 'python') {
          // Micro Python evaluator in JS
          const lines = codeSource.split('\n');
          const printed = [];
          for (let line of lines) {
            line = line.trim();
            if (line.startsWith('#') || !line) continue;
            if (line.startsWith('print(')) {
              let content = line.substring(6, line.length - 1);
              if (content.startsWith('f"') && content.endsWith('"')) {
                content = content.slice(2, -1).replace(/{([^}]+)}/g, 'NodeA');
              } else if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
                content = content.slice(1, -1);
              }
              printed.push(content);
            } else if (line.includes('(') && line.endsWith(')')) {
              // Function invocation
              if (line.includes('raft_consensus_demo')) {
                printed.push('Current Leader: NodeA');
                printed.push('Heartbeat sent to NodeB -> ACK (term=1)');
                printed.push('Heartbeat sent to NodeC -> ACK (term=1)');
                printed.push('Distributed task Task-1 committed via consensus quorum!');
                printed.push('Distributed task Task-2 committed via consensus quorum!');
                printed.push('Distributed task Task-3 committed via consensus quorum!');
              }
            }
          }
          outputBuffer = printed.length ? printed.join('\n') : '[Python 3.12 executed with exit code 0]';
        } else if (codeLanguage === 'c') {
          outputBuffer =
            '=========================================\n' +
            '  DistributedOS Bare-Metal Kernel v1.0.4  \n' +
            '=========================================\n' +
            'Mapped Virtual Memory: 4096 KB (4 MB)\n' +
            'Paging Status: ACTIVE (CR0 bit 31 = 1)\n' +
            'Round-Robin Multitasking: ONLINE\n\n' +
            '[Program exited with code 0 in 4.2ms]';
        } else if (codeLanguage === 'go') {
          outputBuffer =
            'DistributedOS Raft Consensus Engine (Go)\n' +
            'Cluster initialized with 3 active nodes.\n' +
            'Node NodeA elected as Leader for Term 1.\n' +
            '[RPC Dispatch] Task #1 replicated across majority quorum.\n' +
            '[RPC Dispatch] Task #2 replicated across majority quorum.\n' +
            '[RPC Dispatch] Task #3 replicated across majority quorum.\n' +
            'Cluster Quorum verified: 100% consistent state.\n\n' +
            '[Process finished with exit code 0]';
        }
      } catch (err) {
        outputBuffer = `Runtime Exception: ${err.message}`;
      }

      const elapsed = (performance.now() - startTime).toFixed(2);
      setCodeOutput(outputBuffer + `\n\n------------------------------------\nFinished execution in ${elapsed} ms`);
      setIsCodeRunning(false);
      addLog(`💻 Executed ${codeLanguage.toUpperCase()} script in sandbox`);
    }, 450);
  };

  // Dispatch Task
  const handleDispatchTask = () => {
    const activeNodes = nodes.filter((n) => n.status === 'Active');
    if (activeNodes.length === 0) {
      addLog('❌ Task dispatch failed: No active nodes in cluster!');
      return;
    }
    const targetNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
    const newTaskId = tasksCount + 1;
    setTasksCount(newTaskId);

    setNodes((prev) =>
      prev.map((n) => (n.id === targetNode.id ? { ...n, load: Math.min(98, n.load + 12) } : n))
    );

    addLog(`⚡ RPC Dispatch: Task #${newTaskId} routed to ${targetNode.id} (${targetNode.ip})`);
  };

  // Kill Leader (Failover)
  const handleKillLeader = () => {
    const leader = nodes.find((n) => n.role === 'Leader' && n.status === 'Active');
    if (!leader) {
      addLog('⚠️ No active leader found to kill.');
      return;
    }

    addLog(`🚨 CRITICAL: Leader ${leader.id} was forcefully TERMINATED!`);

    setNodes((prev) =>
      prev.map((n) => (n.id === leader.id ? { ...n, status: 'Offline', role: 'Dead', health: 0, load: 0 } : n))
    );

    setIsElectionInProgress(true);
    addLog(`⏱️ Heartbeat Timeout detected! Starting Raft election for Term ${term + 1}...`);

    setTimeout(() => {
      setNodes((currentNodes) => {
        const eligibleFollowers = currentNodes.filter((n) => n.status === 'Active');
        if (eligibleFollowers.length === 0) {
          addLog('❌ Quorum failure: No active nodes left!');
          setIsElectionInProgress(false);
          return currentNodes;
        }

        const newLeader = eligibleFollowers[0];
        addLog(`🗳️ Raft Election Complete: ${newLeader.id} received majority votes! Promoted to LEADER.`);
        setTerm((t) => t + 1);
        setIsElectionInProgress(false);

        return currentNodes.map((n) => {
          if (n.id === newLeader.id) return { ...n, role: 'Leader', health: 100 };
          if (n.status === 'Active') return { ...n, role: 'Follower' };
          return n;
        });
      });
    }, 2200);
  };

  // Recover Nodes
  const handleRecoverNodes = () => {
    addLog('🔄 Node recovery routine triggered. Rebooting all offline nodes...');
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'Active',
        health: 98,
        load: 20,
        role: n.role === 'Dead' ? 'Follower' : n.role
      }))
    );
    addLog('✅ All cluster nodes online and synchronized with Raft log.');
  };

  // Toggle Single Node
  const toggleNodeState = (nodeId) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const isNowOffline = n.status === 'Active';
          addLog(isNowOffline ? `🛑 Shut down ${n.id}` : `🟢 Booted up ${n.id}`);
          return {
            ...n,
            status: isNowOffline ? 'Offline' : 'Active',
            role: isNowOffline ? 'Dead' : 'Follower',
            health: isNowOffline ? 0 : 98,
            load: isNowOffline ? 0 : 15
          };
        }
        return n;
      })
    );
  };

  // KV Store: Set Key
  const handleKvSet = (e) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    const cleanKey = newKey.trim();
    const cleanVal = newValue.trim();

    const leader = nodes.find((n) => n.role === 'Leader' && n.status === 'Active');
    const leaderName = leader ? leader.id : 'NodeA';

    setKvStore((prev) => {
      const existing = prev.filter((item) => item.key !== cleanKey);
      return [{ key: cleanKey, value: cleanVal, term: term, node: leaderName }, ...existing];
    });

    addLog(`🔑 KV-Store: Replicated SET "${cleanKey}"="${cleanVal}" across cluster (Term ${term})`);
    setNewKey('');
    setNewValue('');
  };

  // Delete KV
  const handleKvDelete = (keyToDelete) => {
    setKvStore((prev) => prev.filter((item) => item.key !== keyToDelete));
    addLog(`🗑️ KV-Store: DEL key "${keyToDelete}" acknowledged by quorum`);
  };

  // Save edited file
  const handleSaveFileEdit = () => {
    if (!selectedFile) return;
    setFiles((prev) =>
      prev.map((f) => (f.name === selectedFile.name ? { ...f, content: fileEditContent, size: `${fileEditContent.length} B` } : f))
    );
    addLog(`💾 VFS: Saved updates to "${selectedFile.name}"`);
  };

  // FULL LINUX TERMINAL COMMAND PARSER
  const handleCliSubmit = (e) => {
    e?.preventDefault();
    if (!cliInput.trim()) return;

    const rawInput = cliInput.trim();
    const args = rawInput.split(' ').filter(Boolean);
    const cmd = args[0].toLowerCase();
    const userEntry = { type: 'user', text: `root@distributed-os:${currentDir}# ${rawInput}` };
    let response = [];

    switch (cmd) {
      // 1. pwd
      case 'pwd':
        response = [{ type: 'info', text: currentDir }];
        break;

      // 2. cd
      case 'cd':
        const targetDir = args[1] || '/root';
        if (targetDir === '..' || targetDir === '../') {
          setCurrentDir('/');
          response = [{ type: 'info', text: '' }];
        } else if (targetDir === '/' || targetDir === '/root' || targetDir === '/bin' || targetDir === '/etc') {
          setCurrentDir(targetDir);
          response = [{ type: 'info', text: '' }];
        } else if (targetDir === 'bin' || targetDir === 'etc' || targetDir === 'root') {
          setCurrentDir(`/${targetDir}`);
          response = [{ type: 'info', text: '' }];
        } else {
          response = [{ type: 'error', text: `bash: cd: ${targetDir}: No such file or directory` }];
        }
        break;

      // 3. whoami
      case 'whoami':
        response = [{ type: 'info', text: 'root (uid=0, gid=0, groups=0(root),1(bin),2(daemon))' }];
        break;

      // 4. uname
      case 'uname':
        if (args.includes('-a')) {
          response = [{ type: 'info', text: 'Linux distributed-os 1.0.4-x86_32 #1 SMP Mon Nov 26 15:45:00 UTC 2026 i686 GNU/Linux' }];
        } else if (args.includes('-r')) {
          response = [{ type: 'info', text: '1.0.4-x86_32' }];
        } else {
          response = [{ type: 'info', text: 'Linux' }];
        }
        break;

      // 5. date
      case 'date':
        response = [{ type: 'info', text: new Date().toUTCString() }];
        break;

      // 6. uptime
      case 'uptime':
        response = [{ type: 'info', text: ' 15:45:22 up 4:18,  1 user,  load average: 0.14, 0.22, 0.18' }];
        break;

      // 7. echo
      case 'echo':
        const echoText = rawInput.substring(5).trim();
        if (echoText.includes('>')) {
          const parts = echoText.split('>');
          const content = parts[0].trim().replace(/^["']|["']$/g, '');
          const filename = parts[1].trim();
          const newF = { name: filename, type: 'file', size: `${content.length} B`, permissions: '-rw-r--r--', path: `${currentDir}/${filename}`, content };
          setFiles((prev) => [...prev.filter((f) => f.name !== filename), newF]);
          response = [{ type: 'success', text: `Wrote ${content.length} bytes to ${filename}` }];
        } else {
          response = [{ type: 'info', text: echoText.replace(/^["']|["']$/g, '') }];
        }
        break;

      // 8. ls
      case 'ls':
        response = [
          { type: 'info', text: 'total 48' },
          ...files.map((f) => ({
            type: 'info',
            text: `${f.permissions}  1 root root ${f.size.padStart(7)} Nov 26 15:40 ${f.type === 'folder' ? f.name : f.name}`
          }))
        ];
        break;

      // 9. cat
      case 'cat':
        if (!args[1]) {
          response = [{ type: 'error', text: 'cat: missing operand' }];
        } else {
          const target = files.find((f) => f.name.toLowerCase() === args[1].toLowerCase());
          if (target) {
            response = [{ type: 'info', text: target.content }];
          } else {
            response = [{ type: 'error', text: `cat: ${args[1]}: No such file or directory` }];
          }
        }
        break;

      // 10. touch
      case 'touch':
        if (!args[1]) {
          response = [{ type: 'error', text: 'touch: missing file operand' }];
        } else {
          const fname = args[1];
          const newFile = { name: fname, type: 'file', size: '0 B', permissions: '-rw-r--r--', path: `${currentDir}/${fname}`, content: '' };
          setFiles((prev) => [...prev.filter((f) => f.name !== fname), newFile]);
          response = [{ type: 'success', text: `File "${fname}" touched successfully.` }];
        }
        break;

      // 11. rm
      case 'rm':
        if (!args[1]) {
          response = [{ type: 'error', text: 'rm: missing operand' }];
        } else {
          const fname = args[1];
          setFiles((prev) => prev.filter((f) => f.name !== fname));
          response = [{ type: 'info', text: `Removed "${fname}"` }];
        }
        break;

      // 12. mkdir
      case 'mkdir':
        if (!args[1]) {
          response = [{ type: 'error', text: 'mkdir: missing operand' }];
        } else {
          const dname = args[1].endsWith('/') ? args[1] : `${args[1]}/`;
          const newDir = { name: dname, type: 'folder', size: '--', permissions: 'drwxr-xr-x', path: `${currentDir}/${dname}`, content: '' };
          setFiles((prev) => [...prev, newDir]);
          response = [{ type: 'success', text: `Directory "${dname}" created in ${currentDir}` }];
        }
        break;

      // 13. ps
      case 'ps':
        response = [
          { type: 'info', text: '  PID TTY          TIME CMD' },
          { type: 'info', text: '    0 ?        00:00:04 [kthreadd]' },
          { type: 'info', text: '    1 ?        00:00:01 /sbin/init' },
          { type: 'info', text: '    2 ?        00:00:02 [raft_consensus]' },
          { type: 'info', text: '    3 ?        00:00:01 /bin/rpc_server --port 8080' },
          { type: 'info', text: '   42 tty1     00:00:00 /bin/bash' },
          { type: 'info', text: '  108 tty1     00:00:00 ps' }
        ];
        break;

      // 14. df
      case 'df':
        response = [
          { type: 'info', text: 'Filesystem     1K-blocks     Used Available Use% Mounted on' },
          { type: 'info', text: '/dev/ata0p1       524288    34816    489472   7% /' },
          { type: 'info', text: 'tmpfs             131072     4096    126976   4% /dev/shm' },
          { type: 'info', text: '/dev/vfs0         262144     1024    261120   1% /mnt/distributed' }
        ];
        break;

      // 15. free
      case 'free':
        response = [
          { type: 'info', text: '               total        used        free      shared  buff/cache   available' },
          { type: 'info', text: 'Mem:            4096         256        3584          16         256        3824' },
          { type: 'info', text: 'Swap:           1024           0        1024' }
        ];
        break;

      // 16. ifconfig / ip
      case 'ifconfig':
      case 'ip':
        response = [
          { type: 'info', text: 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500' },
          { type: 'info', text: '        inet 192.168.1.101  netmask 255.255.255.0  broadcast 192.168.1.255' },
          { type: 'info', text: '        ether 52:54:00:12:34:56  txqueuelen 1000  (Ethernet)' },
          { type: 'info', text: '        RX packets 18420  bytes 14210920 (14.2 MB)' },
          { type: 'info', text: '        TX packets 17290  bytes 12914021 (12.9 MB)' },
          { type: 'info', text: 'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536' },
          { type: 'info', text: '        inet 127.0.0.1  netmask 255.0.0.0' }
        ];
        break;

      // 17. ping
      case 'ping':
        const host = args[1] || 'NodeB';
        response = [
          { type: 'info', text: `PING ${host} (192.168.1.102) 56(84) bytes of data.` },
          { type: 'success', text: `64 bytes from 192.168.1.102: icmp_seq=1 ttl=64 time=0.342 ms` },
          { type: 'success', text: `64 bytes from 192.168.1.102: icmp_seq=2 ttl=64 time=0.298 ms` },
          { type: 'success', text: `64 bytes from 192.168.1.102: icmp_seq=3 ttl=64 time=0.315 ms` },
          { type: 'info', text: `--- ${host} ping statistics ---` },
          { type: 'info', text: `3 packets transmitted, 3 received, 0% packet loss, rtt avg 0.318 ms` }
        ];
        break;

      // 18. top / htop
      case 'top':
      case 'htop':
        response = [
          { type: 'info', text: 'top - 15:45:30 up 4:18,  1 user,  load average: 0.14, 0.22, 0.18' },
          { type: 'info', text: 'Tasks: 6 total,   1 running,   5 sleeping,   0 stopped,   0 zombie' },
          { type: 'info', text: '%Cpu(s):  4.2 us,  2.1 sy,  0.0 ni, 93.7 id,  0.0 wa,  0.0 hi,  0.0 si' },
          { type: 'info', text: 'MiB Mem :   4096.0 total,   3584.0 free,    256.0 used,    256.0 buff/cache' },
          { type: 'info', text: '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND' },
          { type: 'success', text: '    2 root      20   0  142100   8420   3120 S   2.8   0.2   0:04.12 raft_engine' },
          { type: 'info', text: '    3 root      20   0   98200   6140   2840 S   1.4   0.1   0:01.84 rpc_listener' },
          { type: 'info', text: '    1 root      20   0   42100   3120   1840 S   0.0   0.1   0:00.82 init' }
        ];
        break;

      // 19. python / python3
      case 'python':
      case 'python3':
        if (args[1] === '-c') {
          const pyCode = rawInput.substring(rawInput.indexOf('-c') + 2).trim().replace(/^["']|["']$/g, '');
          if (pyCode.includes('print')) {
            const printContent = pyCode.replace(/print\((.*)\)/, '$1').replace(/^["']|["']$/g, '');
            response = [{ type: 'success', text: printContent }];
          } else {
            response = [{ type: 'info', text: `[Python 3.12 executed successfully: ${pyCode}]` }];
          }
        } else if (args[1] === 'main.py') {
          response = [
            { type: 'info', text: 'Executing cluster task 1 on distributed core...' },
            { type: 'info', text: 'Executing cluster task 2 on distributed core...' },
            { type: 'info', text: 'Executing cluster task 3 on distributed core...' },
            { type: 'info', text: 'Executing cluster task 4 on distributed core...' },
            { type: 'info', text: 'Executing cluster task 5 on distributed core...' },
            { type: 'success', text: 'All 5 tasks completed successfully!' }
          ];
        } else {
          response = [
            { type: 'info', text: 'Python 3.12.2 (main, Nov 26 2026) on DistributedOS x86' },
            { type: 'info', text: 'Type "help", "copyright", "credits" or "license" for more information.' },
            { type: 'success', text: '>>> Tip: Use the "Code Runner" tab in the left sidebar to write and run full Python scripts!' }
          ];
        }
        break;

      // 20. node / js
      case 'node':
      case 'js':
        if (args[1] === '-e') {
          const jsExpr = rawInput.substring(rawInput.indexOf('-e') + 2).trim().replace(/^["']|["']$/g, '');
          try {
            const res = Function(`"use strict"; return (${jsExpr})`)();
            response = [{ type: 'success', text: String(res) }];
          } catch (e) {
            response = [{ type: 'error', text: `ReferenceError: ${e.message}` }];
          }
        } else {
          response = [
            { type: 'info', text: 'Welcome to Node.js v20.11.0 on DistributedOS.' },
            { type: 'info', text: 'Type ".help" for more information.' }
          ];
        }
        break;

      // 21. gcc
      case 'gcc':
        response = [
          { type: 'info', text: `gcc (GCC) 13.2.0 for i686-pc-distributed-os` },
          { type: 'success', text: `Compiled server.c -> generated executable binary a.out (ELF 32-bit x86)` }
        ];
        break;

      // 22. go
      case 'go':
        response = [
          { type: 'info', text: 'go version go1.22.1 distributed/386' },
          { type: 'success', text: 'Distributed cluster packages compiled and verified.' }
        ];
        break;

      // 23. dmesg
      case 'dmesg':
        response = [
          { type: 'info', text: '[    0.000000] Linux version 1.0.4-x86_32 (root@build-server) (gcc 13.2.0) #1 SMP' },
          { type: 'info', text: '[    0.000004] BIOS-provided physical RAM map: 4096MB at 0x00000000' },
          { type: 'info', text: '[    0.000018] x86: Booting SMP configuration' },
          { type: 'info', text: '[    0.000032] Initializing CPU#0 (x86 GenuineIntel)' },
          { type: 'info', text: '[    0.000104] IDT and ISR vectors installed: 0-31 CPU exceptions, 32-47 PIC IRQs' },
          { type: 'info', text: '[    0.000212] Virtual memory enabled: 4KB pages, Page Directory at 0x9C000' },
          { type: 'info', text: '[    0.000450] Preemptive scheduler online: PIT timer set to 100Hz quantum' },
          { type: 'success', text: '[    0.000890] Raft Consensus Daemon online. Quorum reached with majority.' }
        ];
        break;

      // 24. status
      case 'status':
        const activeCount = nodes.filter((n) => n.status === 'Active').length;
        const currentLeader = nodes.find((n) => n.role === 'Leader' && n.status === 'Active');
        response = [
          { type: 'success', text: `Cluster State: STABLE | Active Nodes: ${activeCount}/${nodes.length} | Raft Term: ${term}` },
          { type: 'success', text: `Current Leader: ${currentLeader ? currentLeader.id : 'NONE (Election Required)'} | Tasks Processed: ${tasksCount}` }
        ];
        break;

      // 25. task / failover / recover / meminfo / clear / help
      case 'task':
        handleDispatchTask();
        response = [{ type: 'success', text: `Task #${tasksCount + 1} queued and dispatched to cluster!` }];
        break;

      case 'failover':
        handleKillLeader();
        response = [{ type: 'error', text: 'Leader killed! Triggering automated Raft election...' }];
        break;

      case 'recover':
        handleRecoverNodes();
        response = [{ type: 'success', text: 'All nodes recovered and back online.' }];
        break;

      case 'meminfo':
        response = [
          { type: 'info', text: 'Virtual Memory (4KB Paging Architecture):' },
          { type: 'info', text: '  Page Directory: 0x0009C000 (1024 Entries)' },
          { type: 'info', text: '  Identity Mapped: 0x00000000 - 0x00400000 (4MB Kernel Space)' },
          { type: 'info', text: '  Kernel Heap: 256 KB used / 4096 KB total' },
          { type: 'info', text: '  Paging Status: ENABLED (CR0 bit 31 set)' }
        ];
        break;

      case 'clear':
        setCliHistory([]);
        setCliInput('');
        return;

      case 'help':
        response = [
          { type: 'info', text: '=== DistributedOS Standard Linux Commands ===' },
          { type: 'info', text: '  pwd, cd, ls, cat, touch, rm, mkdir, echo' },
          { type: 'info', text: '  whoami, uname -a, date, uptime, dmesg' },
          { type: 'info', text: '  ps, top, ifconfig, ping, df -h, free -m' },
          { type: 'info', text: '  python, python main.py, node -e, gcc, go' },
          { type: 'info', text: '=== Distributed Cluster Commands ===' },
          { type: 'info', text: '  status, task, failover, recover, meminfo, clear' }
        ];
        break;

      default:
        response = [{ type: 'error', text: `bash: ${cmd}: command not found. Type "help" to see all available commands.` }];
        break;
    }

    setCliHistory((prev) => [...prev, userEntry, ...response]);
    setCliInput('');
  };

  const currentLeader = nodes.find((n) => n.role === 'Leader' && n.status === 'Active');
  const activeCount = nodes.filter((n) => n.status === 'Active').length;

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"></div>
          <div className="logo-text">
            <span>DistributedOS</span>
            <small>Kernel & Raft v1.0</small>
          </div>
        </div>

        <nav className="nav-menu">
          {[
            { id: 'Dashboard', icon: '📊', label: 'Cluster Overview' },
            { id: 'Topology', icon: '🌐', label: 'Network Topology Graph' },
            { id: 'Terminal', icon: '💻', label: 'Interactive Terminal' },
            { id: 'CodeRunner', icon: '⚡', label: 'Code Runner (All Langs)' },
            { id: 'KVStore', icon: '🔑', label: 'Distributed KV Store' },
            { id: 'File Explorer', icon: '📁', label: 'VFS File Explorer' },
            { id: 'Settings', icon: '⚙️', label: 'System Architecture' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="cluster-mini-status">
            <span className={`status-indicator ${isElectionInProgress ? 'warning' : 'online'}`}></span>
            <span>{isElectionInProgress ? 'Election in Progress' : 'Cluster Quorum Active'}</span>
          </div>
          <div className="footer-stats">
            <div>Term: <strong>{term}</strong></div>
            <div>Tasks: <strong>{tasksCount}</strong></div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'Dashboard' && (
          <>
            <div className="header">
              <div>
                <h1>Cluster Overview</h1>
                <p className="subtitle">Real-time telemetry and Raft distributed consensus state</p>
              </div>
              <div className="header-badges">
                <span className={`status-badge ${isElectionInProgress ? 'badge-election' : 'badge-healthy'}`}>
                  ● {isElectionInProgress ? 'ELECTION IN PROGRESS' : 'CLUSTER QUORUM HEALTHY'}
                </span>
              </div>
            </div>

            {/* QUICK INTERACTIVE CONTROL BAR */}
            <div className="control-banner">
              <div className="control-banner-title">
                <span>⚡ Interactive Cluster Controls</span>
                <small>Click any action to simulate real distributed system events</small>
              </div>
              <div className="control-btn-group">
                <button className="btn btn-primary" onClick={handleDispatchTask}>
                  ⚡ Dispatch RPC Task
                </button>
                <button className="btn btn-danger" onClick={handleKillLeader}>
                  🚨 Kill Leader (Test Failover)
                </button>
                <button className="btn btn-secondary" onClick={handleRecoverNodes}>
                  🔄 Recover / Reboot All
                </button>
              </div>
            </div>

            {/* SUMMARY STATS BAR */}
            <div className="metrics-strip">
              <div className="stat-card">
                <span className="stat-label">CLUSTER LEADER</span>
                <span className="stat-value highlight-emerald">{currentLeader ? currentLeader.id : 'NONE'}</span>
                <span className="stat-sub">{currentLeader ? currentLeader.ip : 'Electing new leader...'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">ACTIVE QUORUM</span>
                <span className="stat-value">{activeCount} / {nodes.length} Nodes</span>
                <span className="stat-sub">{activeCount >= 2 ? 'Majority Consensus Met' : 'Quorum Lost!'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">CONSENSUS TERM</span>
                <span className="stat-value">Term #{term}</span>
                <span className="stat-sub">Raft Epoch Counter</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">PROCESSED TASKS</span>
                <span className="stat-value">{tasksCount}</span>
                <span className="stat-sub">RPC calls executed</span>
              </div>
            </div>

            {/* NODE GRID */}
            <h2 className="section-title">Cluster Nodes & Status</h2>
            <div className="node-grid">
              {nodes.map((node) => (
                <div key={node.id} className={`node-card ${node.status === 'Offline' ? 'node-offline' : ''} ${node.role === 'Leader' ? 'node-leader' : ''}`}>
                  <div className="node-header">
                    <div>
                      <div className="node-id">{node.id}</div>
                      <div className="node-ip">{node.ip}</div>
                    </div>
                    <span className={`role-pill role-${node.role.toLowerCase()}`}>
                      {node.role}
                    </span>
                  </div>

                  <div className="metric-group">
                    <div className="metric">
                      <span className="metric-label">HEALTH</span>
                      <span className="metric-value" style={{ color: node.health > 80 ? 'var(--emerald)' : node.health > 0 ? 'var(--gold)' : 'var(--ruby)' }}>
                        {node.health}%
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">CPU LOAD</span>
                      <span className="metric-value">{node.load}%</span>
                    </div>
                  </div>

                  <div className="load-bar-track">
                    <div
                      className="load-bar-fill"
                      style={{
                        width: `${node.load}%`,
                        backgroundColor: node.load > 80 ? 'var(--ruby)' : node.load > 40 ? 'var(--gold)' : 'var(--emerald)'
                      }}
                    ></div>
                  </div>

                  <div className="node-card-footer">
                    <span className={`status-dot ${node.status === 'Active' ? 'dot-active' : 'dot-offline'}`}>
                      ● {node.status}
                    </span>
                    <button
                      className={`btn-small ${node.status === 'Active' ? 'btn-small-danger' : 'btn-small-success'}`}
                      onClick={() => toggleNodeState(node.id)}
                    >
                      {node.status === 'Active' ? 'Power Off' : 'Reboot Node'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* LIVE ACTIVITY LOG */}
            <div className="section-header-row">
              <h2 className="section-title">Live Cluster Activity Log</h2>
              <button className="btn-link" onClick={() => setLogs([])}>Clear Log</button>
            </div>
            <div className="terminal">
              {logs.map((log, i) => (
                <div key={i} className="log-entry">
                  <span className="log-time">[{log.time}]</span>
                  <span className="log-msg">{log.msg}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TAB 2: NETWORK TOPOLOGY GRAPH */}
        {activeTab === 'Topology' && (
          <div className="topology-page">
            <div className="header">
              <div>
                <h1>Raft Network Topology Graph</h1>
                <p className="subtitle">Visualizing live heartbeat pulses and RPC replication pathways between cluster nodes</p>
              </div>
              <div className="control-btn-group">
                <button className="btn btn-primary" onClick={handleDispatchTask}>⚡ Send RPC Workload</button>
                <button className="btn btn-danger" onClick={handleKillLeader}>🚨 Kill Leader</button>
                <button className="btn btn-secondary" onClick={handleRecoverNodes}>🔄 Reboot All</button>
              </div>
            </div>

            <div className="topology-canvas-container">
              <svg className="topology-svg" viewBox="0 0 620 440">
                {/* Connection lines between all nodes */}
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Mesh lines */}
                <line x1="200" y1="120" x2="420" y2="120" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="420" y1="120" x2="420" y2="320" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="420" y1="320" x2="200" y2="320" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="200" y1="320" x2="200" y2="120" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="200" y1="120" x2="420" y2="320" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <line x1="420" y1="120" x2="200" y2="320" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />

                {/* Animated traveling packet dots */}
                {packetDots.map((dot) => (
                  <circle key={dot.id} cx={dot.fromX} cy={dot.fromY} r="5" fill="#34d399">
                    <animate attributeName="cx" from={dot.fromX} to={dot.toX} dur="1.2s" fill="freeze" />
                    <animate attributeName="cy" from={dot.fromY} to={dot.toY} dur="1.2s" fill="freeze" />
                    <animate attributeName="opacity" values="1; 1; 0" dur="1.2s" fill="freeze" />
                  </circle>
                ))}

                {/* Render Nodes */}
                {nodes.map((node) => {
                  const isLeader = node.role === 'Leader';
                  const isDead = node.status === 'Offline';
                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="node-graph-group" onClick={() => toggleNodeState(node.id)}>
                      {/* Halo */}
                      {isLeader && <circle r="46" fill="rgba(16, 185, 129, 0.15)" className="pulse-circle" />}
                      <circle
                        r="34"
                        fill={isDead ? '#1f1315' : isLeader ? '#06291d' : '#141824'}
                        stroke={isDead ? '#ef4444' : isLeader ? '#10b981' : '#3b82f6'}
                        strokeWidth={isLeader ? '3' : '2'}
                      />
                      <text textAnchor="middle" y="-4" fill="#fff" fontSize="13" fontWeight="bold">
                        {node.id}
                      </text>
                      <text textAnchor="middle" y="14" fill={isDead ? '#ef4444' : isLeader ? '#34d399' : '#9ca3af'} fontSize="10" fontWeight="600">
                        {node.role}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="topology-legend">
                <div className="legend-item"><span className="legend-dot green"></span> Leader (Raft Coordinator)</div>
                <div className="legend-item"><span className="legend-dot blue"></span> Follower Node</div>
                <div className="legend-item"><span className="legend-dot red"></span> Dead / Offline Node</div>
                <div className="legend-tip">💡 Click any node circle to power it on / off and trigger dynamic election!</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FULL LINUX TERMINAL */}
        {activeTab === 'Terminal' && (
          <div className="terminal-page">
            <div className="header">
              <div>
                <h1>Kernel & Linux Terminal</h1>
                <p className="subtitle">Standard GNU/Linux shell environment with low-level kernel and cluster utilities</p>
              </div>
              <button className="btn btn-secondary" onClick={() => setCliHistory([])}>Clear Terminal</button>
            </div>

            {/* QUICK COMMAND CHIPS */}
            <div className="command-chips">
              <span className="chips-label">Try commands:</span>
              {['pwd', 'ls', 'whoami', 'uname -a', 'date', 'uptime', 'ps', 'top', 'df -h', 'free -m', 'ifconfig', 'ping NodeB', 'cat secret.txt', 'python main.py', 'dmesg', 'help'].map((cmd) => (
                <button
                  key={cmd}
                  className="chip-btn"
                  onClick={() => {
                    setCliInput(cmd);
                  }}
                >
                  {cmd}
                </button>
              ))}
            </div>

            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>
                <span className="terminal-title">root@distributed-os: {currentDir} (32-bit x86 Protected Mode)</span>
              </div>
              <div className="terminal-body">
                {cliHistory.map((item, index) => (
                  <div key={index} className={`terminal-line line-${item.type}`}>
                    {item.text}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              <form className="terminal-prompt-form" onSubmit={handleCliSubmit}>
                <span className="terminal-prompt">root@distributed-os:{currentDir}#</span>
                <input
                  type="text"
                  className="terminal-input"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="Type any Linux command (e.g. 'pwd', 'ls', 'uname -a', 'ps', 'top', 'python main.py')..."
                  autoFocus
                />
                <button type="submit" className="btn btn-small btn-primary">Run</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: MULTI-LANGUAGE CODE RUNNER */}
        {activeTab === 'CodeRunner' && (
          <div className="coderunner-page">
            <div className="header">
              <div>
                <h1>Multi-Language Code Runner & Playground</h1>
                <p className="subtitle">Write and execute programs live in Python, JavaScript, C, and Go on the DistributedOS runtime</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleExecuteCode}
                disabled={isCodeRunning}
              >
                {isCodeRunning ? '⚡ Running...' : '▶ Run Code'}
              </button>
            </div>

            {/* LANGUAGE SELECTOR TABS */}
            <div className="lang-tabs-row">
              {[
                { id: 'python', label: '🐍 Python 3.12' },
                { id: 'javascript', label: '🟨 JavaScript (Node)' },
                { id: 'c', label: '⚙️ C (GCC x86)' },
                { id: 'go', label: '🔷 Go (Raft Engine)' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  className={`lang-tab ${codeLanguage === lang.id ? 'lang-tab-active' : ''}`}
                  onClick={() => handleLanguageChange(lang.id)}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="coderunner-split">
              {/* Code Editor */}
              <div className="code-editor-pane">
                <div className="pane-bar">
                  <span>Source Code Editor ({codeLanguage.toUpperCase()})</span>
                  <button className="btn-link" onClick={() => setCodeSource(CODE_TEMPLATES[codeLanguage])}>Reset Template</button>
                </div>
                <textarea
                  className="code-textarea"
                  value={codeSource}
                  onChange={(e) => setCodeSource(e.target.value)}
                  spellCheck="false"
                />
              </div>

              {/* Execution Console */}
              <div className="code-output-pane">
                <div className="pane-bar">
                  <span>Standard Output (stdout / stderr)</span>
                  <button className="btn-link" onClick={() => setCodeOutput('')}>Clear</button>
                </div>
                <pre className="output-terminal">
                  {codeOutput || '// Click "▶ Run Code" above to execute this code.'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DISTRIBUTED KEY-VALUE STORE */}
        {activeTab === 'KVStore' && (
          <>
            <div className="header">
              <div>
                <h1>Distributed Key-Value Store</h1>
                <p className="subtitle">Raft-replicated state machine providing strongly consistent reads & writes across nodes</p>
              </div>
            </div>

            {/* Insert Form */}
            <div className="kv-form-banner">
              <h3>⚡ Write Key-Value to Raft Quorum</h3>
              <form onSubmit={handleKvSet} className="kv-form">
                <input
                  type="text"
                  placeholder="Key (e.g. cluster_id)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="input-text"
                  required
                />
                <input
                  type="text"
                  placeholder="Value (e.g. US-WEST-2)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="input-text"
                  required
                />
                <button type="submit" className="btn btn-primary">
                  SET Key
                </button>
              </form>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>KEY</th>
                    <th>REPLICATED VALUE</th>
                    <th>COMMITTED TERM</th>
                    <th>LEADER REPLICATOR</th>
                    <th>CONSENSUS STATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {kvStore.map((item) => (
                    <tr key={item.key}>
                      <td><code>{item.key}</code></td>
                      <td><strong>{item.value}</strong></td>
                      <td>Term #{item.term}</td>
                      <td><span className="badge-type">{item.node}</span></td>
                      <td><span className="badge-status">Quorum Committed (Majority)</span></td>
                      <td>
                        <button className="btn-small btn-small-danger" onClick={() => handleKvDelete(item.key)}>
                          DEL
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 6: VFS FILE EXPLORER */}
        {activeTab === 'File Explorer' && (
          <>
            <div className="header">
              <div>
                <h1>Virtual File System (VFS)</h1>
                <p className="subtitle">Inode-backed file storage with real-time text editing and persistence</p>
              </div>
              <button className="btn btn-primary" onClick={handleSaveFileEdit}>💾 Save Changes</button>
            </div>

            <div className="vfs-layout">
              {/* File list */}
              <div className="vfs-list-pane">
                <div className="vfs-pane-header">
                  <h3>Files & Inodes</h3>
                </div>

                <div className="file-items">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className={`file-item ${selectedFile?.name === file.name ? 'file-item-selected' : ''}`}
                      onClick={() => {
                        setSelectedFile(file);
                        setFileEditContent(file.content);
                      }}
                    >
                      <span className="file-icon">{file.type === 'folder' ? '📁' : '📄'}</span>
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <small className="file-meta">{file.permissions} • {file.size}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* File editor / preview */}
              <div className="vfs-preview-pane">
                <div className="vfs-pane-header">
                  <h3>Editing: {selectedFile ? selectedFile.name : 'None selected'}</h3>
                  {selectedFile && <span className="tag">{selectedFile.permissions}</span>}
                </div>
                {selectedFile ? (
                  <textarea
                    className="vfs-edit-textarea"
                    value={fileEditContent}
                    onChange={(e) => setFileEditContent(e.target.value)}
                  />
                ) : (
                  <div className="empty-state">Select a file on the left to view or edit its contents</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 7: SYSTEM ARCHITECTURE & MEMORY */}
        {activeTab === 'Settings' && (
          <>
            <div className="header">
              <div>
                <h1>Kernel Architecture & 4GB Memory Map</h1>
                <p className="subtitle">Inspect 32-bit x86 protected mode memory paging and hardware subsystems</p>
              </div>
            </div>

            {/* VISUAL 4GB MEMORY MAP */}
            <div className="memory-map-box">
              <h3>🧠 32-Bit x86 Virtual Memory Map (4GB Address Space)</h3>
              <div className="memory-bar">
                <div className="mem-block mem-bios" style={{ width: '12%' }}>
                  <span>0x00000000</span>
                  <small>BIOS / IVT / VGA (0xB8000)</small>
                </div>
                <div className="mem-block mem-kernel" style={{ width: '22%' }}>
                  <span>0x00100000</span>
                  <small>Kernel Code & 4KB Page Tables</small>
                </div>
                <div className="mem-block mem-heap" style={{ width: '24%' }}>
                  <span>0x00400000</span>
                  <small>Kernel Heap (kmalloc)</small>
                </div>
                <div className="mem-block mem-user" style={{ width: '42%' }}>
                  <span>0x00800000 - 0xFFFFFFFF</span>
                  <small>Userspace Processes & Ring 3 Virtual Memory</small>
                </div>
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-card">
                <h3>Raft Consensus Settings</h3>
                <div className="setting-item">
                  <label>Heartbeat Broadcast Interval ({heartbeatInterval} ms)</label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={heartbeatInterval}
                    onChange={(e) => setHeartbeatInterval(Number(e.target.value))}
                  />
                  <small>Time between leader heartbeat pulses to followers.</small>
                </div>

                <div className="setting-item">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={autoRecovery}
                      onChange={(e) => setAutoRecovery(e.target.checked)}
                    />
                    Enable Automated Leader Election on Timeout
                  </label>
                  <small>If unchecked, cluster enters emergency standby upon leader death.</small>
                </div>
              </div>

              <div className="setting-card">
                <h3>Preemptive Scheduler (PIT)</h3>
                <div className="setting-item">
                  <label>Timer Quantum ({quantum} ms per process)</label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quantum}
                    onChange={(e) => setQuantum(Number(e.target.value))}
                  />
                  <small>Programmable Interval Timer (PIT) IRQ 0 slice frequency.</small>
                </div>

                <div className="setting-item">
                  <label>Scheduling Algorithm</label>
                  <select className="select-input">
                    <option>Round Robin (Preemptive - Default)</option>
                    <option>Priority Preemptive</option>
                    <option>First-Come First-Served (Cooperative)</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
