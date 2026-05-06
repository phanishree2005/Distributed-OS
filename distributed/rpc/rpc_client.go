package rpc

import (
	"fmt"
	"net/rpc"
)

// SendRPCCommand reaches out across the network to execute a function on a remote machine
func SendRPCCommand(targetPort string, command string, payload string) {
	client, err := rpc.Dial("tcp", "localhost:"+targetPort)
	if err != nil {
		fmt.Println("RPC Client connection error:", err)
		return
	}
	defer client.Close()

	args := &RPCArgs{Command: command, Payload: payload}
	var reply RPCReply

	// This completely abstracts the network layer. It looks like a normal function call!
	err = client.Call("NodeService.ExecuteCommand", args, &reply)
	if err != nil {
		fmt.Println("RPC Call error:", err)
		return
	}

	fmt.Printf("[Client] RPC Reply received: %s (Success: %v)\n", reply.Message, reply.Success)
}
