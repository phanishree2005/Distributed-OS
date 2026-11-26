package consensus

import (
	"fmt"
	"sync"
	"time"
)

// RequestVoteArgs represents RPC arguments for requesting a vote
type RequestVoteArgs struct {
	Term         int    // Candidate's term
	CandidateID  string // Candidate requesting vote
	LastLogIndex int    // Index of candidate's last log entry
	LastLogTerm  int    // Term of candidate's last log entry
}

// RequestVoteReply represents RPC reply to a vote request
type RequestVoteReply struct {
	Term        int  // Current term, for candidate to update itself
	VoteGranted bool // True means candidate received vote
}

// RequestVote handles an incoming vote request from a candidate
func (r *RaftNode) RequestVote(args *RequestVoteArgs, reply *RequestVoteReply) {
	r.Lock.Lock()
	defer r.Lock.Unlock()

	// 1. Reply false if term < currentTerm
	if args.Term < r.Term {
		reply.Term = r.Term
		reply.VoteGranted = false
		return
	}

	// 2. If term > currentTerm, update term and become follower
	if args.Term > r.Term {
		r.Term = args.Term
		r.State = "Follower"
		r.VotedFor = ""
	}

	// 3. If votedFor is null or candidateId, grant vote
	if r.VotedFor == "" || r.VotedFor == args.CandidateID {
		r.VotedFor = args.CandidateID
		r.LastSeen = time.Now()
		reply.Term = r.Term
		reply.VoteGranted = true
		fmt.Printf("[Raft %s] Voted for candidate %s in Term %d\n", r.ID, args.CandidateID, r.Term)
		return
	}

	reply.Term = r.Term
	reply.VoteGranted = false
}

// StartElection transitions the node to Candidate and requests votes from cluster peers
func (r *RaftNode) StartElection(peers []*RaftNode) bool {
	r.Lock.Lock()
	r.State = "Candidate"
	r.Term++
	r.VotedFor = r.ID
	r.LastSeen = time.Now()
	currentTerm := r.Term
	candidateID := r.ID
	r.Lock.Unlock()

	fmt.Printf("[Raft %s] Starting election for Term %d...\n", candidateID, currentTerm)

	votesReceived := 1 // Vote for self
	totalNodes := len(peers) + 1
	var voteMutex sync.Mutex

	for _, peer := range peers {
		if peer.ID == candidateID {
			continue
		}
		go func(p *RaftNode) {
			args := RequestVoteArgs{
				Term:        currentTerm,
				CandidateID: candidateID,
			}
			var reply RequestVoteReply
			p.RequestVote(&args, &reply)

			if reply.VoteGranted {
				voteMutex.Lock()
				votesReceived++
				voteMutex.Unlock()
			}
		}(peer)
	}

	// Wait briefly for election quorum
	time.Sleep(150 * time.Millisecond)

	r.Lock.Lock()
	defer r.Lock.Unlock()

	// If quorum (majority) achieved and still candidate in this term
	if r.State == "Candidate" && r.Term == currentTerm && votesReceived > totalNodes/2 {
		r.State = "Leader"
		fmt.Printf("[Raft %s] Quorum achieved (%d/%d votes)! Elected as LEADER for Term %d.\n", r.ID, votesReceived, totalNodes, r.Term)
		return true
	}

	return false
}
