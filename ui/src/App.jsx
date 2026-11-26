import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const INITIAL_NODES = [
  { id: 'NodeA', role: 'Leader', health: 100, load: 14, status: 'Active', ip: '192.168.1.101', term: 1 },
  { id: 'NodeB', role: 'Follower', health: 98, load: 38, status: 'Active', ip: '192.168.1.102', term: 1 },
  { id: 'NodeC', role: 'Follower', health: 100, load: 22, status: 'Active', ip: '192.168.1.103', term: 1 },
  { id: 'NodeD', role: 'Follower', health: 0, load: 0, status: 'Offline', ip: '192.168.1.104', term: 1 },
];

const INITIAL_FILES = [
  { name: 'kernel.bin', type: 'file', size: '64 KB', permissions: '-rwxr-xr-x', content: '[x86 Executable Binary Code: Entry 0x1000, 32-bit Protected Mode, GDT loaded at 0x800]' },
  { name: 'secret.txt', type: 'file', size: '128 B', permissions: '-rw-r--r--', content: 'CLUSTER_MASTER_KEY=0x9FA82C10E8\nRAFT_TOKEN=d83921af78c02' },
  { name: 'hosts.conf', type: 'file', size: '256 B', permissions: '-rw-r--r--', content: '127.0.0.1 localhost\n192.168.1.101 NodeA\n192.168.1.102 NodeB\n192.168.1.103 NodeC' },
  { name: 'boot.log', type: 'file', size: '1.2 KB', permissions: '-rw-r--r--', content: '[0.00000] Kernel entry reached at 0x1000\n[0.00012] Paging enabled: 4KB pages\n[0.00025] PIT Interrupt registered IRQ 0\n[0.00040] Round-Robin scheduler initialized' },
  { name: 'bin/', type: 'folder', size: '--', permissions: 'drwxr-xr-x', content: 'sh, cat, ls, kill, ps, ping' },
  { name: 'etc/', type: 'folder', size: '--', permissions: 'drwxr-xr-x', content: 'system.conf, network.conf, raft.conf' }
];

const INITIAL_PACKETS = [
  { id: 'PKT-101', type: 'RPC', proto: 'TCP', src: '192.168.1.101:8080', dst: '192.168.1.102:8080', payload: 'RPC_CALL_APPEND_ENTRIES (Term 1, Index 44)', status: 'Delivered' },
  { id: 'PKT-102', type: 'RAFT', proto: 'UDP', src: '192.168.1.101:5000', dst: '255.255.255.255:5000', payload: 'HEARTBEAT_BROADCAST (Term 1, Leader NodeA)', status: 'Broadcast' },
  { id: 'PKT-103', type: 'TCP', proto: 'TCP', src: '192.168.1.103:49152', dst: '192.168.1.101:8080', payload: 'SYN -> SYN-ACK -> ACK (Handshake Complete)', status: 'Connected' },
  { id: 'PKT-104', type: 'KERNEL', proto: 'RAW', src: 'Ring 3 Userspace', dst: 'Kernel Core 0x80', payload: 'SYS_CALL: sys_write("Task 104 completed")', status: 'Executed' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [term, setTerm] = useState(1);
  const [tasksCount, setTasksCount] = useState(742);
  const [isElectionInProgress, setIsElectionInProgress] = useState(false);
  const [selectedFile, setSelectedFile] = useState(INITIAL_FILES[1]);
  const [files, setFiles] = useState(INITIAL_FILES);
  const [newFileName, setNewFileName] = useState('');
  const [packets, setPackets] = useState(INITIAL_PACKETS);
  const [packetFilter, setPacketFilter] = useState('ALL');
  
  // Terminal state
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState([
    { type: 'system', text: 'DistributedOS Kernel v1.0.4 - Interactive Shell' },
    { type: 'system', text: 'Type "help" to see available commands or click quick action buttons below.' }
  ]);
  const terminalEndRef = useRef(null);

  // Settings
  const [heartbeatInterval, setHeartbeatInterval] = useState(500);
  const [autoRecovery, setAutoRecovery] = useState(true);
  const [quantum, setQuantum] = useState(10);

  // Cluster activity log
  const [logs, setLogs] = useState([
    { time: '15:35:01', msg: 'Kernel bootloader executed from 0x7C00.' },
    { time: '15:35:02', msg: 'Paging initialized: 1024 Page Tables mapped.' },
    { time: '15:35:04', msg: 'Raft consensus initialized. NodeA elected as Leader.' },
    { time: '15:35:10', msg: 'RPC server listening on ports 8001-8004.' }
  ]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, msg }, ...prev.slice(0, 19)]);
  };

  // Periodic heartbeat animation
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
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [nodes]);

  // Scroll terminal to bottom
  useEffect(() => {
    if (activeTab === 'Terminal' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [cliHistory, activeTab]);

  // ACTIONS

  // 1. Dispatch Task
  const handleDispatchTask = () => {
    const activeNodes = nodes.filter((n) => n.status === 'Active');
    if (activeNodes.length === 0) {
      addLog('❌ Task dispatch failed: No active nodes in cluster!');
      return;
    }
    const targetNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
    const newTaskId = tasksCount + 1;
    setTasksCount(newTaskId);

    // Update target node load
    setNodes((prev) =>
      prev.map((n) =>
        n.id === targetNode.id
          ? { ...n, load: Math.min(98, n.load + 12) }
          : n
      )
    );

    addLog(`⚡ RPC Dispatch: Task #${newTaskId} routed via Load Balancer to ${targetNode.id}`);
    
    // Add network packet
    const newPkt = {
      id: `PKT-${Math.floor(100 + Math.random() * 900)}`,
      type: 'RPC',
      proto: 'TCP',
      src: '192.168.1.1:LB',
      dst: `${targetNode.ip}:8080`,
      payload: `EXEC_TASK #${newTaskId} { priority: HIGH }`,
      status: 'Delivered'
    };
    setPackets((prev) => [newPkt, ...prev.slice(0, 15)]);
  };

  // 2. Kill Leader (Simulate Failover)
  const handleKillLeader = () => {
    const leader = nodes.find((n) => n.role === 'Leader' && n.status === 'Active');
    if (!leader) {
      addLog('⚠️ No active leader found to kill.');
      return;
    }

    addLog(`🚨 CRITICAL: Leader ${leader.id} was forcefully TERMINATED!`);

    // Kill the leader
    setNodes((prev) =>
      prev.map((n) =>
        n.id === leader.id
          ? { ...n, status: 'Offline', role: 'Dead', health: 0, load: 0 }
          : n
      )
    );

    setIsElectionInProgress(true);
    addLog(`⏱️ Heartbeat Timeout detected! Starting Raft election for Term ${term + 1}...`);

    // Automated Raft election after 2 seconds
    setTimeout(() => {
      setNodes((currentNodes) => {
        const eligibleFollowers = currentNodes.filter((n) => n.status === 'Active');
        if (eligibleFollowers.length === 0) {
          addLog('❌ Split-brain / Quorum failure: No active nodes left!');
          setIsElectionInProgress(false);
          return currentNodes;
        }

        const newLeader = eligibleFollowers[0];
        addLog(`🗳️ Raft Election Complete: ${newLeader.id} received majority votes! Promoted to LEADER.`);
        setTerm((t) => t + 1);
        setIsElectionInProgress(false);

        return currentNodes.map((n) => {
          if (n.id === newLeader.id) {
            return { ...n, role: 'Leader', health: 100 };
          }
          if (n.status === 'Active') {
            return { ...n, role: 'Follower' };
          }
          return n;
        });
      });
    }, 2200);
  };

  // 3. Recover All Nodes
  const handleRecoverNodes = () => {
    addLog('🔄 Node recovery routine triggered. Rebooting all offline nodes...');
    setNodes((prev) =>
      prev.map((n) => {
        if (n.status === 'Offline' || n.role === 'Dead') {
          return {
            ...n,
            status: 'Active',
            health: 96,
            load: 18,
            role: 'Follower'
          };
        }
        return n;
      })
    );
    addLog('✅ All cluster nodes online and synchronized with Raft log.');
  };

  // 4. Trigger Re-election
  const handleTriggerElection = () => {
    const active = nodes.filter((n) => n.status === 'Active');
    if (active.length <= 1) {
      addLog('⚠️ Cannot trigger election: Need at least 2 active nodes.');
      return;
    }
    const nextTerm = term + 1;
    setTerm(nextTerm);
    setIsElectionInProgress(true);
    addLog(`🗳️ Manual Raft Election requested: Incrementing to Term ${nextTerm}`);

    setTimeout(() => {
      const candidates = nodes.filter((n) => n.status === 'Active');
      const winner = candidates[Math.floor(Math.random() * candidates.length)];
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          role: n.id === winner.id ? 'Leader' : (n.status === 'Active' ? 'Follower' : n.role),
          term: nextTerm
        }))
      );
      setIsElectionInProgress(false);
      addLog(`✨ Election finished: ${winner.id} is the new Leader for Term ${nextTerm}.`);
    }, 1200);
  };

  // 5. Toggle Individual Node Power
  const toggleNodeState = (nodeId) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const isNowOffline = n.status === 'Active';
          addLog(isNowOffline ? `🛑 Manually shut down ${n.id}` : `🟢 Booted up ${n.id}`);
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

  // CLI Handler
  const handleCliSubmit = (e) => {
    e?.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim().toLowerCase();
    const args = cmd.split(' ');
    const userEntry = { type: 'user', text: `$ ${cliInput}` };
    let response = [];

    switch (args[0]) {
      case 'help':
        response = [
          { type: 'info', text: 'Available commands:' },
          { type: 'info', text: '  status       - Show cluster and consensus summary' },
          { type: 'info', text: '  ps           - List active kernel processes' },
          { type: 'info', text: '  ls           - List files in Virtual File System (VFS)' },
          { type: 'info', text: '  cat <file>   - Display file contents' },
          { type: 'info', text: '  task         - Dispatch new distributed task' },
          { type: 'info', text: '  failover     - Kill current leader to test Raft failover' },
          { type: 'info', text: '  recover      - Restore and reboot dead nodes' },
          { type: 'info', text: '  meminfo      - Display virtual memory paging stats' },
          { type: 'info', text: '  clear        - Clear terminal output' }
        ];
        break;

      case 'status':
        const activeCount = nodes.filter((n) => n.status === 'Active').length;
        const currentLeader = nodes.find((n) => n.role === 'Leader' && n.status === 'Active');
        response = [
          { type: 'success', text: `Cluster State: STABLE | Active Nodes: ${activeCount}/${nodes.length} | Term: ${term}` },
          { type: 'success', text: `Current Raft Leader: ${currentLeader ? currentLeader.id : 'NONE (Election Required)'}` }
        ];
        break;

      case 'ps':
        response = [
          { type: 'info', text: 'PID   NAME               PRIORITY   STATE      STACK_BASE' },
          { type: 'info', text: '0     [kernel_idle]      0          RUNNING    0x00100000' },
          { type: 'info', text: '1     init_process       1          WAITING    0x00200000' },
          { type: 'info', text: '2     raft_heartbeat     2          RUNNING    0x00300000' },
          { type: 'info', text: '3     rpc_listener       2          WAITING    0x00400000' },
          { type: 'info', text: '4     vga_screen_flush   1          SLEEPING   0x00500000' }
        ];
        break;

      case 'ls':
        response = [
          { type: 'info', text: 'PERM         SIZE     NAME' },
          ...files.map((f) => ({ type: 'info', text: `${f.permissions}  ${f.size.padEnd(8)} ${f.name}` }))
        ];
        break;

      case 'cat':
        if (!args[1]) {
          response = [{ type: 'error', text: 'Usage: cat <filename>' }];
        } else {
          const target = files.find((f) => f.name.toLowerCase() === args[1].toLowerCase());
          if (target) {
            response = [{ type: 'info', text: target.content }];
          } else {
            response = [{ type: 'error', text: `File not found: ${args[1]}` }];
          }
        }
        break;

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

      default:
        response = [{ type: 'error', text: `Unknown command "${args[0]}". Type "help" for a list of commands.` }];
        break;
    }

    setCliHistory((prev) => [...prev, userEntry, ...response]);
    setCliInput('');
  };

  const handleAddFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim();
    const newEntry = {
      name: cleanName,
      type: 'file',
      size: '42 B',
      permissions: '-rw-r--r--',
      content: `Simulated custom file created on ${new Date().toLocaleTimeString()}`
    };
    setFiles((prev) => [...prev, newEntry]);
    setSelectedFile(newEntry);
    setNewFileName('');
    addLog(`📁 VFS: Created new file "${cleanName}" in root directory`);
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
            { id: 'Terminal', icon: '💻', label: 'Interactive Terminal' },
            { id: 'Cluster Nodes', icon: '🖥️', label: 'Nodes & Telemetry' },
            { id: 'File Explorer', icon: '📁', label: 'VFS File Explorer' },
            { id: 'Network Logs', icon: '🌐', label: 'Packet Analyzer' },
            { id: 'Settings', icon: '⚙️', label: 'System Settings' }
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
                <button className="btn btn-secondary" onClick={handleTriggerElection}>
                  🗳️ Trigger Re-Election
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

        {/* TAB 2: INTERACTIVE TERMINAL */}
        {activeTab === 'Terminal' && (
          <div className="terminal-page">
            <div className="header">
              <div>
                <h1>Kernel & Cluster Terminal</h1>
                <p className="subtitle">Execute live commands against the kernel subsystem and distributed layer</p>
              </div>
            </div>

            {/* QUICK COMMAND CHIPS */}
            <div className="command-chips">
              <span className="chips-label">Quick Commands:</span>
              {['status', 'ps', 'ls', 'cat secret.txt', 'meminfo', 'task', 'failover', 'recover', 'help'].map((cmd) => (
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
                <span className="terminal-title">DistributedOS TTY0 - 32-bit x86 Protected Mode</span>
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
                <span className="terminal-prompt">root@distributed-os:~#</span>
                <input
                  type="text"
                  className="terminal-input"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="Type a command (try 'help', 'ps', 'status', 'ls')..."
                  autoFocus
                />
                <button type="submit" className="btn btn-small btn-primary">Run</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: CLUSTER NODES */}
        {activeTab === 'Cluster Nodes' && (
          <>
            <div className="header">
              <div>
                <h1>Managed Cluster Nodes</h1>
                <p className="subtitle">Comprehensive telemetry, network addressing, and heartbeat synchronization</p>
              </div>
              <button className="btn btn-primary" onClick={handleDispatchTask}>+ Dispatch Workload</button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>NODE ID</th>
                    <th>IP ADDRESS</th>
                    <th>RAFT ROLE</th>
                    <th>HEALTH</th>
                    <th>CPU USAGE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((node) => (
                    <tr key={node.id}>
                      <td><strong>{node.id}</strong></td>
                      <td><code>{node.ip}:8080</code></td>
                      <td>
                        <span className={`role-pill role-${node.role.toLowerCase()}`}>
                          {node.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: node.health > 80 ? 'var(--emerald)' : 'var(--ruby)' }}>
                          {node.health}%
                        </span>
                      </td>
                      <td>{node.load}%</td>
                      <td>
                        <span className={`status-dot ${node.status === 'Active' ? 'dot-active' : 'dot-offline'}`}>
                          ● {node.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn-small ${node.status === 'Active' ? 'btn-small-danger' : 'btn-small-success'}`}
                          onClick={() => toggleNodeState(node.id)}
                        >
                          {node.status === 'Active' ? 'Terminate' : 'Start'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 4: FILE EXPLORER */}
        {activeTab === 'File Explorer' && (
          <>
            <div className="header">
              <div>
                <h1>VFS Virtual File System</h1>
                <p className="subtitle">Inode-backed flat filesystem implementation on ATA PIO storage</p>
              </div>
            </div>

            <div className="vfs-layout">
              {/* File list */}
              <div className="vfs-list-pane">
                <div className="vfs-pane-header">
                  <h3>Files & Inodes</h3>
                  <form onSubmit={handleAddFile} className="create-file-form">
                    <input
                      type="text"
                      className="input-text"
                      placeholder="New file name..."
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-small btn-primary">+ Add</button>
                  </form>
                </div>

                <div className="file-items">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className={`file-item ${selectedFile?.name === file.name ? 'file-item-selected' : ''}`}
                      onClick={() => setSelectedFile(file)}
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

              {/* File preview */}
              <div className="vfs-preview-pane">
                <div className="vfs-pane-header">
                  <h3>File Preview: {selectedFile ? selectedFile.name : 'None selected'}</h3>
                  {selectedFile && <span className="tag">{selectedFile.permissions}</span>}
                </div>
                {selectedFile ? (
                  <div className="file-content-view">
                    <pre>{selectedFile.content}</pre>
                  </div>
                ) : (
                  <div className="empty-state">Select a file on the left to preview its contents</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 5: NETWORK LOGS */}
        {activeTab === 'Network Logs' && (
          <>
            <div className="header">
              <div>
                <h1>Packet Analyzer & Network Stack</h1>
                <p className="subtitle">Inspect Ethernet frames, IP routing, UDP heartbeats, and TCP RPC traffic</p>
              </div>
              <div className="btn-group">
                {['ALL', 'RPC', 'RAFT', 'TCP', 'KERNEL'].map((filter) => (
                  <button
                    key={filter}
                    className={`btn-small ${packetFilter === filter ? 'btn-small-active' : ''}`}
                    onClick={() => setPacketFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="packet-actions-row">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const newP = {
                    id: `PKT-${Math.floor(100 + Math.random() * 900)}`,
                    type: 'RAFT',
                    proto: 'UDP',
                    src: '192.168.1.101:5000',
                    dst: '255.255.255.255:5000',
                    payload: `HEARTBEAT_ACK (Term ${term}, Status: OK)`,
                    status: 'Broadcast'
                  };
                  setPackets((prev) => [newP, ...prev]);
                  addLog('📡 Injected manual Raft heartbeat packet into network stack.');
                }}
              >
                📡 Send Broadcast Heartbeat
              </button>
              <button className="btn btn-secondary" onClick={handleDispatchTask}>
                📦 Generate RPC Frame
              </button>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>FRAME ID</th>
                    <th>TYPE</th>
                    <th>PROTOCOL</th>
                    <th>SOURCE</th>
                    <th>DESTINATION</th>
                    <th>PAYLOAD / DESCRIPTOR</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {packets
                    .filter((p) => packetFilter === 'ALL' || p.type === packetFilter)
                    .map((pkt) => (
                      <tr key={pkt.id}>
                        <td><code>{pkt.id}</code></td>
                        <td><span className="badge-type">{pkt.type}</span></td>
                        <td><span className="badge-proto">{pkt.proto}</span></td>
                        <td><small>{pkt.src}</small></td>
                        <td><small>{pkt.dst}</small></td>
                        <td><code>{pkt.payload}</code></td>
                        <td><span className="badge-status">{pkt.status}</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'Settings' && (
          <>
            <div className="header">
              <div>
                <h1>Kernel & Cluster Configuration</h1>
                <p className="subtitle">Tune runtime parameters, scheduling quantums, and fault-tolerance policies</p>
              </div>
              <button className="btn btn-primary" onClick={() => addLog('💾 Settings saved to system.conf')}>
                Save Configuration
              </button>
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

              <div className="setting-card">
                <h3>Virtual Memory Architecture</h3>
                <div className="setting-item">
                  <label>Paging Block Size</label>
                  <select className="select-input" disabled>
                    <option>4 KB Standard Two-Level Paging (x86 CR3)</option>
                  </select>
                  <small>Hardware page size enforced by 32-bit x86 architecture.</small>
                </div>
                <div className="setting-item">
                  <label>Kernel Heap Allocator</label>
                  <select className="select-input">
                    <option>Bump / Free-List Allocator (kmalloc)</option>
                    <option>Buddy Allocator (Roadmap)</option>
                  </select>
                </div>
              </div>

              <div className="setting-card">
                <h3>Disk & Storage Controller</h3>
                <div className="setting-item">
                  <label>Storage I/O Mode</label>
                  <select className="select-input">
                    <option>ATA PIO Mode (Ports 0x1F0 - 0x1F7)</option>
                    <option>Bus-Master DMA (Roadmap)</option>
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
