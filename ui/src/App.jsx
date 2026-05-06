import React, { useState, useEffect } from 'react';
import './index.css';

const NodeCard = ({ id, role, health, load, status }) => (
  <div className="node-card">
    <div className="node-header">
      <div className="node-id">{id}</div>
      <div className="node-role" style={{ color: role === 'Leader' ? 'var(--emerald)' : 'var(--text-dim)' }}>
        {role}
      </div>
    </div>
    <div className="metric-group">
      <div className="metric">
        <span className="metric-label">SYSTEM HEALTH</span>
        <span className="metric-value" style={{ color: health > 90 ? 'var(--emerald)' : 'var(--gold)' }}>
          {health}%
        </span>
      </div>
      <div className="metric">
        <span className="metric-label">CPU LOAD</span>
        <span className="metric-value">{load}%</span>
      </div>
    </div>
    <div style={{ marginTop: '20px', fontSize: '0.8rem', color: status === 'Active' ? 'var(--emerald)' : 'var(--ruby)' }}>
      ● {status}
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [logs, setLogs] = useState([
    { time: '00:14:02', msg: 'Kernel Booting...' },
    { time: '00:14:03', msg: 'Paging Enabled.' },
    { time: '00:14:05', msg: 'Cluster NodeA Elected as Leader.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        time: new Date().toLocaleTimeString(),
        msg: `Task ${Math.floor(Math.random() * 1000)} synchronized across cluster.`
      };
      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch(activeTab) {
      case 'Dashboard':
        return (
          <>
            <div className="header">
              <h1>Cluster Overview</h1>
              <div className="status-badge">SYSTEM STABLE</div>
            </div>
            <div className="node-grid">
              <NodeCard id="NodeA" role="Leader" health={100} load={12} status="Active" />
              <NodeCard id="NodeB" role="Follower" health={98} load={45} status="Active" />
              <NodeCard id="NodeC" role="Follower" health={100} load={8} status="Active" />
              <NodeCard id="NodeD" role="Follower" health={0} load={0} status="Offline" />
            </div>
            <h2 style={{ marginBottom: '20px' }}>Cluster Activity Log</h2>
            <div className="terminal">
              {logs.map((log, i) => (
                <div key={i} className="log-entry">
                  <span className="log-time">[{log.time}]</span>
                  {log.msg}
                </div>
              ))}
            </div>
          </>
        );
      case 'Cluster Nodes':
        return (
          <>
            <div className="header"><h1>Managed Nodes</h1></div>
            <div className="terminal" style={{ height: '400px' }}>
              <div className="log-entry">ID: NodeA | IP: 192.168.1.1 | Role: Leader | Uptime: 4h 12m</div>
              <div className="log-entry">ID: NodeB | IP: 192.168.1.2 | Role: Follower | Uptime: 4h 10m</div>
              <div className="log-entry">ID: NodeC | IP: 192.168.1.3 | Role: Follower | Uptime: 3h 55m</div>
            </div>
          </>
        );
      case 'File Explorer':
        return (
          <>
            <div className="header"><h1>VFS Explorer</h1></div>
            <div className="terminal" style={{ height: '400px' }}>
              <div className="log-entry">drwxr-xr-x  bin/</div>
              <div className="log-entry">drwxr-xr-x  etc/</div>
              <div className="log-entry">-rw-r--r--  secret.txt (23 Bytes)</div>
            </div>
          </>
        );
      case 'Network Logs':
        return (
          <>
            <div className="header"><h1>Packet Analyzer</h1></div>
            <div className="terminal" style={{ height: '400px' }}>
              <div className="log-entry">[ETH] Frame: 0x0800 | SRC: 00:1A:2B | DST: FF:FF:FF</div>
              <div className="log-entry">[IPv4] Proto: 17 (UDP) | SRC: 192.168.1.100 | DST: 192.168.1.1</div>
              <div className="log-entry">[UDP] Port: 8080 | Payload: RPC_CALL_VOTE_REQUEST</div>
              <div className="log-entry" style={{ color: 'var(--gold)' }}>[NET] Checksum verified. Routing to kernel...</div>
            </div>
          </>
        );
      case 'Settings':
        return (
          <>
            <div className="header"><h1>System Configuration</h1></div>
            <div className="node-grid">
              <div className="node-card">
                <div className="node-id">Kernel v1.0.4</div>
                <div className="metric-group" style={{ marginTop: '15px' }}>
                  <div className="metric"><span className="metric-label">UPTIME</span><span className="metric-value">4h 12m</span></div>
                  <div className="metric"><span className="metric-label">TASKS</span><span className="metric-value">1,242</span></div>
                </div>
              </div>
              <div className="node-card">
                <div className="node-id">Memory Statistics</div>
                <div className="metric-group" style={{ marginTop: '15px' }}>
                  <div className="metric"><span className="metric-label">USED</span><span className="metric-value">256 KB</span></div>
                  <div className="metric"><span className="metric-label">TOTAL</span><span className="metric-value">4096 KB</span></div>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return <div className="header"><h1>Dashboard Coming Soon</h1></div>;
    }
  };

  return (
    <React.Fragment>
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon"></div>
          DistributedOS
        </div>
        {['Dashboard', 'Cluster Nodes', 'File Explorer', 'Network Logs', 'Settings'].map(tab => (
          <div 
            key={tab} 
            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="dashboard">
        {renderContent()}
      </div>
    </React.Fragment>
  );
};

export default App;
