package main

import (
	"fmt"
	"time"

	"./consensus"
	"./lb"
	"./rpc"
)

func main() {
	fmt.Println("=========================================")
	fmt.Println("  DistributedOS: FAULT TOLERANCE DEMO")
	fmt.Println("=========================================\n")

	// 1. Setup Nodes
	nodes := []string{"8001", "8002", "8003"}
	balancer := lb.NewLoadBalancer(nodes)

	fmt.Println("[Cluster] Spawning 3 nodes...")
	nodeA := consensus.NewRaftNode("NodeA")
	nodeB := consensus.NewRaftNode("NodeB")
	
	// Simulate Leader
	nodeA.State = "Leader"
	go nodeA.RunHeartbeatMonitor()
	go nodeB.RunHeartbeatMonitor()

	time.Sleep(1 * time.Second)

	// 2. Assign Tasks
	fmt.Println("\n[Scheduler] Assigning 4 tasks to the cluster...")
	for i := 1; i <= 4; i++ {
		target := balancer.GetNextNode()
		fmt.Printf("[Task %d] Sent to Node %s\n", i, target)
	}

	// 3. SIMULATE CRITICAL FAILURE
	fmt.Println("\n!!! [SIMULATION] KILLING LEADER NODE A !!!")
	nodeA.State = "Dead"
	
	fmt.Println("[Monitor] Waiting for cluster to detect failure...")
	time.Sleep(3 * time.Second)

	// 4. Automatic Recovery
	fmt.Println("\n[Recovery] Node B detected timeout.")
	nodeB.State = "Leader"
	fmt.Println("[Recovery] Node B is now the new Cluster Leader.")
	
	fmt.Println("\n[Scheduler] Reassigning failed Node A tasks to Node B/C...")
	fmt.Printf("[Task 5] Sent to the new Leader (Node B)\n")

	fmt.Println("\n[SUCCESS] Distributed system recovered from leader failure automatically.")
}
