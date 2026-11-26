package consensus

import (
	"fmt"
	"time"
)

// LogEntry represents an individual replicated command in the distributed state machine
type LogEntry struct {
	Index   int    // 1-based log index
	Term    int    // Term when entry was received by leader
	Command string // State machine command (e.g. "SET key=val")
}

// AppendEntriesArgs represents RPC arguments for log replication and heartbeats
type AppendEntriesArgs struct {
	Term         int        // Leader's current term
	LeaderID     string     // Identifier of leader
	PrevLogIndex int        // Index of log entry immediately preceding new ones
	PrevLogTerm  int        // Term of prevLogIndex entry
	Entries      []LogEntry // Log entries to store (empty for heartbeat)
	LeaderCommit int        // Leader's commit index
}

// AppendEntriesReply represents RPC reply to an AppendEntries call
type AppendEntriesReply struct {
	Term    int  // Current term, for leader to update itself
	Success bool // True if follower contained entry matching prevLogIndex and prevLogTerm
}

// AppendEntries processes an incoming log replication RPC or heartbeat from the leader
func (r *RaftNode) AppendEntries(args *AppendEntriesArgs, reply *AppendEntriesReply) {
	r.Lock.Lock()
	defer r.Lock.Unlock()

	// 1. Reply false if term < currentTerm
	if args.Term < r.Term {
		reply.Term = r.Term
		reply.Success = false
		return
	}

	// 2. Recognize leader and update heartbeat
	r.LastSeen = time.Now()
	if args.Term > r.Term || r.State != "Follower" {
		r.Term = args.Term
		r.State = "Follower"
		r.VotedFor = args.LeaderID
	}

	reply.Term = r.Term
	reply.Success = true

	if len(args.Entries) > 0 {
		for _, entry := range args.Entries {
			fmt.Printf("[Raft %s] Replicated LogEntry #%d: '%s' (Term %d)\n", r.ID, entry.Index, entry.Command, entry.Term)
		}
	}
}
