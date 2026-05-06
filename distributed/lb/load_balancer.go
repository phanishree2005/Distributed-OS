package lb

import (
	"fmt"
	"sync/atomic"
)

type LoadBalancer struct {
	nodes   []string
	counter uint64
}

func NewLoadBalancer(nodes []string) *LoadBalancer {
	return &LoadBalancer{
		nodes:   nodes,
		counter: 0,
	}
}

// GetNextNode routes incoming internet traffic to the least busy server
func (lb *LoadBalancer) GetNextNode() string {
	if len(lb.nodes) == 0 {
		return ""
	}
	
	// Atomic increment ensures thread-safe Round-Robin routing
	idx := atomic.AddUint64(&lb.counter, 1) % uint64(len(lb.nodes))
	node := lb.nodes[idx]
	
	fmt.Printf("[Load Balancer] Routed incoming task to Node: %s\n", node)
	return node
}
