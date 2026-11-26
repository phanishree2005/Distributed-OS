import React, { useState, useEffect, useRef } from 'react';
import './index.css';

// ----------------------------------------------------
// CLUSTER & SYSTEM INITIAL STATE
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
  { name: 'boot.log', type: 'file', size: '1.2 KB', permissions: '-rw-r--r--', path: '/var/log/boot.log', content: '[0.000000] Kernel entry reached at 0x1000\n[0.000014] Enabling A20 gate via keyboard controller\n[0.000045] Loading 32-bit Global Descriptor Table (GDT)\n[0.000120] Paging enabled: 1024 Page Tables mapped (0x0 - 0x400000)\n[0.000250] PIT Timer Interrupt IRQ 0 set to 100 Hz\n[0.000380] Round-Robin scheduler initialized with idle process PID 0' },
  { name: 'bin/', type: 'folder', size: '--', permissions: 'drwxr-xr-x', path: '/bin', content: 'sh, cat, ls, pwd, echo, kill, ps, ping, python, gcc, node, top, ifconfig, free, df' },
  { name: 'etc/', type: 'folder', size: '--', permissions: 'drwxr-xr-x', path: '/etc', content: 'hosts.conf, system.conf, network.conf, raft.conf, resolv.conf' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [term, setTerm] = useState(1);
  const [tasksCount, setTasksCount] = useState(754);
  const [isElectionInProgress, setIsElectionInProgress] = useState(false);
  const [currentDir, setCurrentDir] = useState('/root');
  const [files, setFiles] = useState(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILES[1]);
  const [fileEditContent, setFileEditContent] = useState(INITIAL_FILES[1].content);

  // ----------------------------------------------------
  // UNIVERSAL CODE RUNNER & DYNAMIC REGISTRY STATE
  // ----------------------------------------------------
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isRegistryLoading, setIsRegistryLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [langCategoryFilter, setLangCategoryFilter] = useState('All');
  const [langSearchQuery, setLangSearchQuery] = useState('');
  
  // Multi-file editor state
  const [editorFiles, setEditorFiles] = useState([{ name: 'main.py', content: '' }]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [stdinInput, setStdinInput] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [resultTab, setResultTab] = useState('stdout'); // 'stdout', 'compile', 'preview'
  const fileInputRef = useRef(null);

  // Distributed Key-Value Store
  const [kvStore, setKvStore] = useState([
    { key: 'cluster_name', value: 'Production-Alpha-01', term: 1, node: 'NodeA' },
    { key: 'max_connections', value: '4096', term: 1, node: 'NodeA' },
    { key: 'heartbeat_timeout_ms', value: '500', term: 1, node: 'NodeA' }
  ]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Terminal state
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState([
    { type: 'system', text: 'DistributedOS Kernel v1.0.4 - Full GNU/Linux Shell & Universal Runtime API' },
    { type: 'system', text: 'Type "help" for Linux commands, or try "pwd", "ls", "ps", "uname -a", "date", "df -h".' }
  ]);
  const terminalEndRef = useRef(null);

  // Settings
  const [heartbeatInterval, setHeartbeatInterval] = useState(500);
  const [autoRecovery, setAutoRecovery] = useState(true);
  const [quantum, setQuantum] = useState(10);
  const [packetDots, setPacketDots] = useState([]);

  // Cluster activity log
  const [logs, setLogs] = useState([
    { time: '16:00:01', msg: 'Kernel bootloader executed from 0x7C00.' },
    { time: '16:00:02', msg: 'Universal Multi-Language Execution Server connected on port 5050.' },
    { time: '16:00:04', msg: 'Raft consensus initialized. NodeA elected as Leader.' }
  ]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, msg }, ...prev.slice(0, 24)]);
  };

  // ----------------------------------------------------
  // FETCH DYNAMIC LANGUAGE REGISTRY FROM BACKEND API
  // ----------------------------------------------------
  useEffect(() => {
    async function loadLanguages() {
      setIsRegistryLoading(true);
      try {
        const res = await fetch('/api/languages');
        const data = await res.json();
        if (data.success && Array.isArray(data.languages)) {
          setAvailableLanguages(data.languages);
          // Pick default installed language (Python or Rust or JS)
          const defaultLang = data.languages.find((l) => l.id === 'python') || data.languages[0];
          selectLanguage(defaultLang);
        }
      } catch (err) {
        console.error('Failed to load dynamic languages from /api/languages:', err);
      } finally {
        setIsRegistryLoading(false);
      }
    }
    loadLanguages();
  }, []);

  const selectLanguage = (lang) => {
    if (!lang) return;
    setSelectedLanguage(lang);
    const primaryExt = lang.extensions ? lang.extensions[0] : '.txt';
    const mainName = lang.id === 'java' ? 'Main.java' : `main${primaryExt}`;
    setEditorFiles([{ name: mainName, content: lang.starterCode || '' }]);
    setActiveFileIndex(0);
    setExecutionResult(null);
  };

  // ----------------------------------------------------
  // EXECUTE CODE VIA POST /api/execute
  // ----------------------------------------------------
  const handleExecute = async () => {
    if (!selectedLanguage) return;

    if (!selectedLanguage.installed) {
      setExecutionResult({
        success: false,
        stdout: '',
        stderr: `Runtime not installed: The compiler or interpreter for '${selectedLanguage.name}' is not installed on the host system.\nExecution disabled until '${selectedLanguage.binary}' is installed on PATH.`,
        exitCode: 127,
        executionTimeMs: 0
      });
      setResultTab('stdout');
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    const activeFile = editorFiles[activeFileIndex] || editorFiles[0];

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage.id,
          code: activeFile.content,
          stdin: stdinInput,
          files: editorFiles.slice(1) // send auxiliary files
        })
      });

      const result = await response.json();
      setExecutionResult(result);

      if (result.previewPayload) {
        setResultTab('preview');
      } else if (result.compileOutput && !result.success) {
        setResultTab('compile');
      } else {
        setResultTab('stdout');
      }

      addLog(`⚡ Universal Runner: Executed ${selectedLanguage.name} (${result.executionTimeMs?.toFixed(1)} ms, exit: ${result.exitCode})`);
    } catch (err) {
      setExecutionResult({
        success: false,
        stdout: '',
        stderr: `Network/API Error: ${err.message}. Ensure the backend execution server is active.`,
        exitCode: -1,
        executionTimeMs: 0
      });
      setResultTab('stdout');
    } finally {
      setIsExecuting(false);
    }
  };

  // Download Code File
  const handleDownloadCode = () => {
    const activeFile = editorFiles[activeFileIndex];
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload Code File
  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setEditorFiles((prev) => [...prev, { name: file.name, content }]);
      setActiveFileIndex(editorFiles.length);
    };
    reader.readAsText(file);
  };

  // Periodic heartbeat animation & packet dots on network graph
  useEffect(() => {
    const interval = setInterval(() => {
      const leader = nodes.find((n) => n.role === 'Leader' && n.status === 'Active');
      if (leader) {
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

  // Cluster Actions
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

  // KV Store
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

  const handleKvDelete = (keyToDelete) => {
    setKvStore((prev) => prev.filter((item) => item.key !== keyToDelete));
    addLog(`🗑️ KV-Store: DEL key "${keyToDelete}" acknowledged by quorum`);
  };

  // Terminal commands
  const handleCliSubmit = (e) => {
    e?.preventDefault();
    if (!cliInput.trim()) return;
    const rawInput = cliInput.trim();
    const args = rawInput.split(' ').filter(Boolean);
    const cmd = args[0].toLowerCase();
    const userEntry = { type: 'user', text: `root@distributed-os:${currentDir}# ${rawInput}` };
    let response = [];

    switch (cmd) {
      case 'pwd':
        response = [{ type: 'info', text: currentDir }];
        break;
      case 'cd':
        const targetDir = args[1] || '/root';
        if (targetDir === '..' || targetDir === '../') {
          setCurrentDir('/');
        } else if (targetDir === '/' || targetDir === '/root' || targetDir === '/bin' || targetDir === '/etc') {
          setCurrentDir(targetDir);
        } else {
          setCurrentDir(`/${targetDir.replace(/^\//, '')}`);
        }
        response = [{ type: 'info', text: '' }];
        break;
      case 'whoami':
        response = [{ type: 'info', text: 'root (uid=0, gid=0, groups=0(root),1(bin),2(daemon))' }];
        break;
      case 'uname':
        response = [{ type: 'info', text: 'Linux distributed-os 1.0.4-x86_32 #1 SMP Mon Nov 26 15:45:00 UTC 2026 i686 GNU/Linux' }];
        break;
      case 'date':
        response = [{ type: 'info', text: new Date().toUTCString() }];
        break;
      case 'uptime':
        response = [{ type: 'info', text: ' 16:05:12 up 4:22,  1 user,  load average: 0.14, 0.22, 0.18' }];
        break;
      case 'echo':
        response = [{ type: 'info', text: rawInput.substring(5).trim().replace(/^["']|["']$/g, '') }];
        break;
      case 'ls':
        response = [
          { type: 'info', text: 'total 48' },
          ...files.map((f) => ({
            type: 'info',
            text: `${f.permissions}  1 root root ${f.size.padStart(7)} Nov 26 16:00 ${f.name}`
          }))
        ];
        break;
      case 'cat':
        if (!args[1]) {
          response = [{ type: 'error', text: 'cat: missing operand' }];
        } else {
          const target = files.find((f) => f.name.toLowerCase() === args[1].toLowerCase());
          response = target ? [{ type: 'info', text: target.content }] : [{ type: 'error', text: `cat: ${args[1]}: No such file or directory` }];
        }
        break;
      case 'ps':
        response = [
          { type: 'info', text: '  PID TTY          TIME CMD' },
          { type: 'info', text: '    0 ?        00:00:04 [kthreadd]' },
          { type: 'info', text: '    1 ?        00:00:01 /sbin/init' },
          { type: 'info', text: '    2 ?        00:00:02 [raft_consensus]' },
          { type: 'info', text: '    3 ?        00:00:01 /bin/rpc_server --port 8080' },
          { type: 'info', text: '   42 tty1     00:00:00 /bin/bash' }
        ];
        break;
      case 'df':
        response = [
          { type: 'info', text: 'Filesystem     1K-blocks     Used Available Use% Mounted on' },
          { type: 'info', text: '/dev/ata0p1       524288    34816    489472   7% /' }
        ];
        break;
      case 'free':
        response = [
          { type: 'info', text: '               total        used        free      shared  buff/cache   available' },
          { type: 'info', text: 'Mem:            4096         256        3584          16         256        3824' }
        ];
        break;
      case 'ping':
        const host = args[1] || 'NodeB';
        response = [
          { type: 'info', text: `PING ${host} (192.168.1.102) 56(84) bytes of data.` },
          { type: 'success', text: `64 bytes from 192.168.1.102: icmp_seq=1 ttl=64 time=0.298 ms` },
          { type: 'info', text: `3 packets transmitted, 3 received, 0% packet loss` }
        ];
        break;
      case 'clear':
        setCliHistory([]);
        setCliInput('');
        return;
      case 'help':
        response = [
          { type: 'info', text: '=== DistributedOS Standard Linux Commands ===' },
          { type: 'info', text: '  pwd, cd, ls, cat, echo, whoami, uname -a, date, uptime' },
          { type: 'info', text: '  ps, df -h, free -m, ping, clear' },
          { type: 'success', text: '💡 Universal Code Runner: Open the "Universal Code Runner" tab to write and run 30+ real programming languages!' }
        ];
        break;
      default:
        response = [{ type: 'error', text: `bash: ${cmd}: command not found. Type "help" for a list of commands.` }];
        break;
    }

    setCliHistory((prev) => [...prev, userEntry, ...response]);
    setCliInput('');
  };

  const currentLeader = nodes.find((n) => n.role === 'Leader' && n.status === 'Active');
  const activeCount = nodes.filter((n) => n.status === 'Active').length;

  // Filter languages for dropdown/modal
  const filteredLanguages = availableLanguages.filter((l) => {
    const matchesCat = langCategoryFilter === 'All' || l.category === langCategoryFilter;
    const matchesSearch =
      !langSearchQuery ||
      l.name.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
      (l.extensions && l.extensions.some((ext) => ext.toLowerCase().includes(langSearchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const categories = [
    'All',
    'General-purpose',
    'Web development',
    'Shell and scripting',
    'Database and query languages',
    'Scientific and numerical computing',
    'Hardware and low-level languages',
    'Configuration and data formats'
  ];

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"></div>
          <div className="logo-text">
            <span>DistributedOS</span>
            <small>Universal Runtime Platform</small>
          </div>
        </div>

        <nav className="nav-menu">
          {[
            { id: 'Dashboard', icon: '📊', label: 'Cluster Overview' },
            { id: 'UniversalRunner', icon: '⚡', label: 'Universal Code Runner' },
            { id: 'Topology', icon: '🌐', label: 'Network Topology Graph' },
            { id: 'Terminal', icon: '💻', label: 'Interactive Terminal' },
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
            <div>Runtimes: <strong>{availableLanguages.filter((l) => l.installed).length} Active</strong></div>
            <div>Term: <strong>{term}</strong></div>
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

            {/* QUICK CONTROL BAR */}
            <div className="control-banner">
              <div className="control-banner-title">
                <span>⚡ Interactive Cluster Controls</span>
                <small>Simulate real distributed cluster operations</small>
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

            {/* METRICS STRIP */}
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
                <span className="stat-label">ACTIVE RUNTIMES</span>
                <span className="stat-value">{availableLanguages.filter((l) => l.installed).length} Compilers</span>
                <span className="stat-sub">From 33 Dynamic Specs</span>
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

            {/* LOG */}
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

        {/* TAB 2: UNIVERSAL MULTI-LANGUAGE CODE RUNNER */}
        {activeTab === 'UniversalRunner' && (
          <div className="universal-runner-container">
            {/* TOP BAR: DYNAMIC LANGUAGE SELECTOR & ACTIONS */}
            <div className="runner-header-bar">
              <div className="runner-title-group">
                <h1>Universal Code Runner</h1>
                <p className="subtitle">Real multi-language execution engine powered by host compilers and interpreters</p>
              </div>

              <div className="runner-action-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowStdin(!showStdin)}
                >
                  {showStdin ? 'Hide Stdin' : '📥 Stdin Input'}
                </button>
                <button className="btn btn-secondary" onClick={handleDownloadCode}>
                  💾 Download
                </button>
                <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                  📂 Upload File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleUploadFile}
                />
                <button
                  className="btn btn-primary btn-run-pulse"
                  onClick={handleExecute}
                  disabled={isExecuting}
                >
                  {isExecuting ? '⚡ Running...' : '▶ Run Code'}
                </button>
              </div>
            </div>

            {/* DYNAMIC REGISTRY SELECTOR TOOLBAR */}
            <div className="registry-toolbar">
              {/* Language Search */}
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search 33+ programming languages..."
                  value={langSearchQuery}
                  onChange={(e) => setLangSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Category Pills */}
              <div className="category-scroll-pills">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`cat-pill ${langCategoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setLangCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* LANGUAGE CHIPS CAROUSEL */}
            <div className="languages-chips-grid">
              {isRegistryLoading ? (
                <div className="loading-state">Loading dynamic runtime registry from /api/languages...</div>
              ) : filteredLanguages.length === 0 ? (
                <div className="empty-state">No languages found matching "{langSearchQuery}"</div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = selectedLanguage?.id === lang.id;
                  return (
                    <div
                      key={lang.id}
                      className={`lang-card-pill ${isSelected ? 'selected' : ''} ${lang.installed ? 'installed' : 'uninstalled'}`}
                      onClick={() => selectLanguage(lang)}
                    >
                      <div className="lang-pill-header">
                        <span className="lang-name">{lang.name}</span>
                        <span className={`status-badge-small ${lang.installed ? 'badge-green' : 'badge-gray'}`}>
                          {lang.installed ? '✓ Ready' : 'Not installed'}
                        </span>
                      </div>
                      <div className="lang-compiler-info">
                        <small>{lang.compiler}</small>
                        {lang.runtimeVersion && (
                          <div className="runtime-ver">{lang.runtimeVersion.substring(0, 32)}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* SELECTED LANGUAGE STATUS BANNER */}
            {selectedLanguage && (
              <div className={`selected-lang-banner ${selectedLanguage.installed ? 'banner-installed' : 'banner-warning'}`}>
                <div className="banner-details">
                  <strong>{selectedLanguage.name} Runtime Environment</strong>
                  <span>
                    Compiler: <code>{selectedLanguage.compiler}</code> | Category: {selectedLanguage.category} | File Extensions: {selectedLanguage.extensions.join(', ')}
                  </span>
                </div>
                <div className="banner-status-tag">
                  {selectedLanguage.installed ? (
                    <span className="status-tag-green">● {selectedLanguage.availability} ({selectedLanguage.runtimeVersion})</span>
                  ) : (
                    <span className="status-tag-red">⚠️ Runtime not installed: Execution disabled until compiler is installed</span>
                  )}
                </div>
              </div>
            )}

            {/* MULTI-FILE CODE EDITOR & CONSOLE SPLIT */}
            <div className="editor-console-workspace">
              {/* LEFT: CODE EDITOR WITH FILE TABS */}
              <div className="editor-pane">
                {/* File Tabs */}
                <div className="file-tabs-bar">
                  <div className="tabs-list">
                    {editorFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className={`editor-tab ${activeFileIndex === idx ? 'active' : ''}`}
                        onClick={() => setActiveFileIndex(idx)}
                      >
                        <span className="tab-name">{file.name}</span>
                        {editorFiles.length > 1 && (
                          <span
                            className="tab-close"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newFiles = editorFiles.filter((_, i) => i !== idx);
                              setEditorFiles(newFiles);
                              setActiveFileIndex(Math.max(0, idx - 1));
                            }}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    ))}
                    <button
                      className="tab-add-btn"
                      onClick={() => {
                        const newName = `file_${editorFiles.length + 1}${selectedLanguage?.extensions[0] || '.txt'}`;
                        setEditorFiles([...editorFiles, { name: newName, content: '' }]);
                        setActiveFileIndex(editorFiles.length);
                      }}
                    >
                      + Add File
                    </button>
                  </div>
                  <button
                    className="btn-link"
                    onClick={() => {
                      if (selectedLanguage) {
                        const updated = [...editorFiles];
                        updated[activeFileIndex].content = selectedLanguage.starterCode || '';
                        setEditorFiles(updated);
                      }
                    }}
                  >
                    Reset Template
                  </button>
                </div>

                {/* Stdin Drawer */}
                {showStdin && (
                  <div className="stdin-drawer">
                    <div className="stdin-header">
                      <span>Standard Input (stdin stream passed to program):</span>
                    </div>
                    <textarea
                      className="stdin-textarea"
                      placeholder="Enter lines of input here (for scanf, input(), Scanner, etc.)..."
                      value={stdinInput}
                      onChange={(e) => setStdinInput(e.target.value)}
                    />
                  </div>
                )}

                {/* Main Code Editor */}
                <textarea
                  className="code-editor-main"
                  value={editorFiles[activeFileIndex]?.content || ''}
                  onChange={(e) => {
                    const updated = [...editorFiles];
                    updated[activeFileIndex].content = e.target.value;
                    setEditorFiles(updated);
                  }}
                  placeholder="Type or paste code here..."
                  spellCheck="false"
                />
              </div>

              {/* RIGHT: EXECUTION CONSOLE & DIAGNOSTICS */}
              <div className="console-pane">
                <div className="console-tabs-bar">
                  <div className="console-tab-buttons">
                    <button
                      className={`console-tab-btn ${resultTab === 'stdout' ? 'active' : ''}`}
                      onClick={() => setResultTab('stdout')}
                    >
                      Standard Output
                    </button>
                    {executionResult?.compileOutput && (
                      <button
                        className={`console-tab-btn ${resultTab === 'compile' ? 'active' : ''}`}
                        onClick={() => setResultTab('compile')}
                      >
                        Compiler Diagnostics
                      </button>
                    )}
                    {selectedLanguage?.capabilities?.preview && (
                      <button
                        className={`console-tab-btn ${resultTab === 'preview' ? 'active' : ''}`}
                        onClick={() => setResultTab('preview')}
                      >
                        Live Browser Preview
                      </button>
                    )}
                  </div>

                  {executionResult && (
                    <div className="console-metrics">
                      <span className={`exit-badge ${executionResult.success ? 'exit-success' : 'exit-fail'}`}>
                        Exit Code: {executionResult.exitCode}
                      </span>
                      {executionResult.executionTimeMs > 0 && (
                        <span className="time-badge">{executionResult.executionTimeMs.toFixed(1)} ms</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="console-content">
                  {isExecuting ? (
                    <div className="running-spinner">
                      <div className="spinner-ring"></div>
                      <span>Compiling and executing through {selectedLanguage?.name} runtime adapter...</span>
                    </div>
                  ) : resultTab === 'preview' && selectedLanguage?.capabilities?.preview ? (
                    <iframe
                      title="Web Preview Sandbox"
                      className="preview-iframe"
                      srcDoc={editorFiles[activeFileIndex]?.content || ''}
                      sandbox="allow-scripts allow-modals"
                    />
                  ) : resultTab === 'compile' && executionResult?.compileOutput ? (
                    <pre className="output-stream compile-stream">
                      {executionResult.compileOutput}
                    </pre>
                  ) : executionResult ? (
                    <pre className="output-stream">
                      {executionResult.stdout && (
                        <div className="stream-stdout">{executionResult.stdout}</div>
                      )}
                      {executionResult.stderr && (
                        <div className="stream-stderr">{executionResult.stderr}</div>
                      )}
                    </pre>
                  ) : (
                    <div className="console-empty-prompt">
                      <span>Click <strong>"▶ Run Code"</strong> to compile and execute with host runtime.</span>
                      <small>Output, execution duration, and exit codes will stream here in real time.</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NETWORK TOPOLOGY GRAPH */}
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
                <line x1="200" y1="120" x2="420" y2="120" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="420" y1="120" x2="420" y2="320" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="420" y1="320" x2="200" y2="320" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="200" y1="320" x2="200" y2="120" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="200" y1="120" x2="420" y2="320" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <line x1="420" y1="120" x2="200" y2="320" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />

                {packetDots.map((dot) => (
                  <circle key={dot.id} cx={dot.fromX} cy={dot.fromY} r="5" fill="#34d399">
                    <animate attributeName="cx" from={dot.fromX} to={dot.toX} dur="1.2s" fill="freeze" />
                    <animate attributeName="cy" from={dot.fromY} to={dot.toY} dur="1.2s" fill="freeze" />
                    <animate attributeName="opacity" values="1; 1; 0" dur="1.2s" fill="freeze" />
                  </circle>
                ))}

                {nodes.map((node) => {
                  const isLeader = node.role === 'Leader';
                  const isDead = node.status === 'Offline';
                  return (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="node-graph-group" onClick={() => toggleNodeState(node.id)}>
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

        {/* TAB 4: LINUX TERMINAL */}
        {activeTab === 'Terminal' && (
          <div className="terminal-page">
            <div className="header">
              <div>
                <h1>Kernel & Linux Terminal</h1>
                <p className="subtitle">Standard GNU/Linux shell environment with low-level kernel and cluster utilities</p>
              </div>
              <button className="btn btn-secondary" onClick={() => setCliHistory([])}>Clear Terminal</button>
            </div>

            <div className="command-chips">
              <span className="chips-label">Quick Linux Commands:</span>
              {['pwd', 'ls', 'whoami', 'uname -a', 'date', 'uptime', 'ps', 'df -h', 'free -m', 'ping NodeB', 'cat secret.txt', 'help'].map((cmd) => (
                <button
                  key={cmd}
                  className="chip-btn"
                  onClick={() => setCliInput(cmd)}
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
                  placeholder="Type any command (e.g. 'pwd', 'ls', 'whoami', 'uname -a')..."
                  autoFocus
                />
                <button type="submit" className="btn btn-small btn-primary">Run</button>
              </form>
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
                <button type="submit" className="btn btn-primary">SET Key</button>
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
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (selectedFile) {
                    setFiles((prev) =>
                      prev.map((f) => (f.name === selectedFile.name ? { ...f, content: fileEditContent, size: `${fileEditContent.length} B` } : f))
                    );
                    addLog(`💾 VFS: Saved updates to "${selectedFile.name}"`);
                  }
                }}
              >
                💾 Save Changes
              </button>
            </div>

            <div className="vfs-layout">
              <div className="vfs-list-pane">
                <div className="vfs-pane-header"><h3>Files & Inodes</h3></div>
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

        {/* TAB 7: SYSTEM ARCHITECTURE */}
        {activeTab === 'Settings' && (
          <>
            <div className="header">
              <div>
                <h1>Kernel Architecture & 4GB Memory Map</h1>
                <p className="subtitle">Inspect 32-bit x86 protected mode memory paging and hardware subsystems</p>
              </div>
            </div>

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
