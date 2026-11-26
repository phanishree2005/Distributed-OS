package lb

import (
	"fmt"
	"sync"
	"time"
)

// HealthMonitor tracks node liveness and latency
type HealthMonitor struct {
	mu     sync.RWMutex
	status map[string]bool
}

// NewHealthMonitor initializes node health tracking
func NewHealthMonitor(nodes []string) *HealthMonitor {
	hm := &HealthMonitor{
		status: make(map[string]bool),
	}
	for _, node := range nodes {
		hm.status[node] = true
	}
	return hm
}

// MarkHealthy records a successful ping
func (hm *HealthMonitor) MarkHealthy(nodeID string) {
	hm.mu.Lock()
	defer hm.mu.Unlock()
	hm.status[nodeID] = true
}

// MarkUnhealthy records a node timeout
func (hm *HealthMonitor) MarkUnhealthy(nodeID string) {
	hm.mu.Lock()
	defer hm.mu.Unlock()
	hm.status[nodeID] = false
	fmt.Printf("[HealthMonitor] Node '%s' marked UNHEALTHY (timeout)\n", nodeID)
}

// IsHealthy returns true if the node is responsive
func (hm *HealthMonitor) IsHealthy(nodeID string) bool {
	hm.mu.RLock()
	defer hm.mu.RUnlock()
	return hm.status[nodeID]
}

// ProbeSweep periodically verifies cluster nodes
func (hm *HealthMonitor) ProbeSweep(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			hm.mu.RLock()
			for node, healthy := range hm.status {
				if healthy {
					// Simulated ping
				} else {
					fmt.Printf("[HealthMonitor] Warning: Node '%s' remains offline.\n", node)
				}
			}
			hm.mu.RUnlock()
		}
	}()
}
