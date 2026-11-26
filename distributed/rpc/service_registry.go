package rpc

import (
	"fmt"
	"sync"
)

// ServiceRegistry maintains directory of available cluster nodes and services
type ServiceRegistry struct {
	mu       sync.RWMutex
	services map[string]string // nodeID -> address (host:port)
}

// NewServiceRegistry creates a thread-safe node registry
func NewServiceRegistry() *ServiceRegistry {
	return &ServiceRegistry{
		services: make(map[string]string),
	}
}

// Register adds or updates a node endpoint in the registry
func (sr *ServiceRegistry) Register(nodeID, address string) {
	sr.mu.Lock()
	defer sr.mu.Unlock()
	sr.services[nodeID] = address
	fmt.Printf("[ServiceRegistry] Registered Node '%s' at %s\n", nodeID, address)
}

// Deregister removes a node from the cluster registry
func (sr *ServiceRegistry) Deregister(nodeID string) {
	sr.mu.Lock()
	defer sr.mu.Unlock()
	delete(sr.services, nodeID)
	fmt.Printf("[ServiceRegistry] Deregistered Node '%s'\n", nodeID)
}

// Lookup finds the address for a given node
func (sr *ServiceRegistry) Lookup(nodeID string) (string, bool) {
	sr.mu.RLock()
	defer sr.mu.RUnlock()
	addr, ok := sr.services[nodeID]
	return addr, ok
}
