package lock

import (
	"fmt"
	"time"
)

// LockManager coordinates cluster-wide locking across nodes
type LockManager struct {
	distLock *DistributedLock
}

// NewLockManager creates a new coordinator instance
func NewLockManager() *LockManager {
	return &LockManager{
		distLock: NewDistributedLock(),
	}
}

// LockTask ensures a task execution has exclusive access
func (lm *LockManager) LockTask(taskID int, nodeID string) bool {
	resKey := fmt.Sprintf("task_%d", taskID)
	return lm.distLock.Acquire(resKey, nodeID, 5*time.Second)
}

// UnlockTask releases the task lock
func (lm *LockManager) UnlockTask(taskID int, nodeID string) bool {
	resKey := fmt.Sprintf("task_%d", taskID)
	return lm.distLock.Release(resKey, nodeID)
}
