package rpc

// Common RPC definitions and error codes
const (
	RPCOk             = 200
	RPCNotFound       = 404
	RPCInternalError  = 500
	RPCElectionTerm   = "ELECTION_TERM"
	RPCPingHeartbeat  = "PING_HEARTBEAT"
	RPCDispatchTask   = "DISPATCH_TASK"
)

// TaskPayload encapsulates a cluster job dispatched across nodes
type TaskPayload struct {
	TaskID    int
	Command   string
	Arguments []string
}
