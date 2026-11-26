package lock

import (
	"fmt"
	"sync"
	"time"
)

// Lock represents a distributed lock instance with owner and expiration
type Lock struct {
	ResourceID string
	OwnerID    string
	ExpiresAt  time.Time
}

// DistributedLock manages distributed mutual exclusion for cluster nodes
type DistributedLock struct {
	mu    sync.Mutex
	locks map[string]*Lock
}

// NewDistributedLock initializes a new lock table
func NewDistributedLock() *DistributedLock {
	return &DistributedLock{
		locks: make(map[string]*Lock),
	}
}

// Acquire attempts to acquire a lock for a given resource with a timeout lease
func (dl *DistributedLock) Acquire(resourceID, ownerID string, ttl time.Duration) bool {
	dl.mu.Lock()
	defer dl.mu.Unlock()

	now := time.Now()
	existing, exists := dl.locks[resourceID]

	// Check if already locked by someone else and not expired
	if exists && existing.ExpiresAt.After(now) {
		if existing.OwnerID == ownerID {
			// Extend lease
			existing.ExpiresAt = now.Add(ttl)
			return true
		}
		return false
	}

	// Grant lock
	dl.locks[resourceID] = &Lock{
		ResourceID: resourceID,
		OwnerID:    ownerID,
		ExpiresAt:  now.Add(ttl),
	}
	fmt.Printf("[DistLock] Resource '%s' successfully locked by '%s' for %v\n", resourceID, ownerID, ttl)
	return true
}

// Release frees the lock if held by the owner
func (dl *DistributedLock) Release(resourceID, ownerID string) bool {
	dl.mu.Lock()
	defer dl.mu.Unlock()

	existing, exists := dl.locks[resourceID]
	if !exists {
		return true
	}

	if existing.OwnerID == ownerID || existing.ExpiresAt.Before(time.Now()) {
		delete(dl.locks, resourceID)
		fmt.Printf("[DistLock] Resource '%s' released by '%s'\n", resourceID, ownerID)
		return true
	}

	return false
}
