package rpc

import (
	"fmt"
	"net"
	"net/rpc"
)

type NodeService struct {
	NodeID string
}

type RPCArgs struct {
	Command string
	Payload string
}

type RPCReply struct {
	Success bool
	Message string
}

// ExecuteCommand is exposed over the network so other nodes can call it!
func (s *NodeService) ExecuteCommand(args *RPCArgs, reply *RPCReply) error {
	fmt.Printf("[Node %s] Received RPC Command: %s | Payload: %s\n", s.NodeID, args.Command, args.Payload)
	reply.Success = true
	reply.Message = fmt.Sprintf("Command '%s' executed successfully by Node %s", args.Command, s.NodeID)
	return nil
}

// Starts the TCP Server to listen for incoming RPC requests
func StartRPCServer(nodeID string, port string) {
	service := &NodeService{NodeID: nodeID}
	rpc.Register(service)

	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		fmt.Println("RPC Server error:", err)
		return
	}

	fmt.Printf("[Node %s] RPC Server actively listening on port %s...\n", nodeID, port)
	
	go func() {
		for {
			conn, err := listener.Accept()
			if err != nil {
				continue
			}
			go rpc.ServeConn(conn) // Handle concurrent RPC connections
		}
	}()
}
