package main

import (
	"fmt"
	"time"

	"../distributed/consensus"
	"../distributed/lb"
	"../distributed/lock"
	"../distributed/rpc"
)

func main() {
	fmt.Println("==================================================")
	fmt.Println("  DistributedOS: DISTRIBUTED SYSTEMS TEST SUITE   ")
	fmt.Println("==================================================\n")

	passedTests := 0
	totalTests := 0

	testAssert := func(name string, condition bool) {
		totalTests++
		if condition {
			fmt.Printf("  [PASS] %s\n", name)
			passedTests++
		} else {
			fmt.Printf("  [FAIL] %s\n", name)
		}
	}

	// 1. Raft Consensus Node Initialization
	nodeA := consensus.NewRaftNode("NodeA")
	nodeB := consensus.NewRaftNode("NodeB")
	nodeC := consensus.NewRaftNode("NodeC")

	testAssert("Raft nodes initialize in Follower state with Term 0", 
		nodeA.State == "Follower" && nodeA.Term == 0 && nodeB.State == "Follower")

	// 2. Election Quorum
	peers := []*RaftNode{nodeB, nodeC}
	elected := nodeA.StartElection(peers)
	testAssert("NodeA achieves quorum majority and becomes Leader", 
		elected && nodeA.State == "Leader" && nodeA.Term == 1)

	// 3. Heartbeat Update
	nodeB.ReceiveHeartbeat()
	testAssert("Follower nodeB processes heartbeat and refreshes lastSeen timestamp", 
		time.Since(nodeB.LastSeen) < 100*time.Millisecond)

	// 4. Log Replication
	args := &consensus.AppendEntriesArgs{
		Term:         1,
		LeaderID:     "NodeA",
		PrevLogIndex: 0,
		PrevLogTerm:  0,
		Entries: []consensus.LogEntry{
			{Index: 1, Term: 1, Command: "SET cluster_name=Production-Alpha"},
		},
	}
	var reply consensus.AppendEntriesReply
	nodeB.AppendEntries(args, &reply)
	testAssert("AppendEntries successfully replicates log entry to follower", reply.Success)

	// 5. Distributed Lock Manager
	distLock := lock.NewDistributedLock()
	lockedFirst := distLock.Acquire("db_write", "NodeA", 2*time.Second)
	lockedSecond := distLock.Acquire("db_write", "NodeB", 2*time.Second)
	testAssert("Distributed lock grants exclusive ownership (first wins)", lockedFirst && !lockedSecond)

	released := distLock.Release("db_write", "NodeA")
	lockedAfterRelease := distLock.Acquire("db_write", "NodeB", 2*time.Second)
	testAssert("Distributed lock can be acquired after release by prior owner", released && lockedAfterRelease)

	// 6. Load Balancer Round-Robin Routing
	balancer := lb.NewLoadBalancer([]string{"NodeA", "NodeB", "NodeC"})
	r1 := balancer.GetNextNode()
	r2 := balancer.GetNextNode()
	r3 := balancer.GetNextNode()
	r4 := balancer.GetNextNode()
	testAssert("Load balancer performs deterministic round-robin traffic routing",
		r1 == "NodeB" && r2 == "NodeC" && r3 == "NodeA" && r4 == "NodeB")

	// 7. Service Registry
	registry := rpc.NewServiceRegistry()
	registry.Register("NodeA", "192.168.1.101:8080")
	addr, found := registry.Lookup("NodeA")
	testAssert("RPC Service Registry successfully stores and resolves node endpoints", 
		found && addr == "192.168.1.101:8080")

	fmt.Printf("\n==================================================\n")
	fmt.Printf("  TEST SUMMARY: %d/%d Distributed Tests Passed\n", passedTests, totalTests)
	fmt.Println("==================================================")
}
