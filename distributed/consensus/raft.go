package consensus

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

type RaftNode struct {
	ID        string
	State     string
	Term      int
	VotedFor  string
	Lock      sync.Mutex
	LastSeen  time.Time
}

func NewRaftNode(id string) *RaftNode {
	return &RaftNode{ID: id, State: "Follower", Term: 0, LastSeen: time.Now()}
}

// Heartbeat Mechanism
func (r *RaftNode) RunHeartbeatMonitor() {
	for {
		time.Sleep(500 * time.Millisecond)
		r.Lock.Lock()
		if r.State == "Leader" {
			fmt.Printf("[Raft Leader %s] Broadcast Heartbeat to cluster...\n", r.ID)
		} else {
			// If we haven't seen a heartbeat in 2 seconds, the Leader is dead!
			if time.Since(r.LastSeen) > 2*time.Second {
				fmt.Printf("[Raft %s] LEADER FAILURE DETECTED! Starting new election...\n", r.ID)
				r.State = "Candidate"
			}
		}
		r.Lock.Unlock()
	}
}

func (r *RaftNode) ReceiveHeartbeat() {
	r.Lock.Lock()
	r.LastSeen = time.Now()
	if r.State == "Candidate" {
		r.State = "Follower"
		fmt.Printf("[Raft %s] New leader found. Reverting to Follower.\n", r.ID)
	}
	r.Lock.Unlock()
}
