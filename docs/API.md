# DistributedOS API Reference

## Kernel API (Internal)
- `kmalloc(size, align, phys)`: Allocate kernel memory.
- `kprint(str)`: Print string to VGA console.
- `create_process(entry)`: Spawn a new thread of execution.
- `yield()`: Give up CPU to the next process.

## Syscall API (Userspace)
- `syscall_write(str)`: Securely print to console.
- `syscall_exit()`: Terminate the calling process.

## Distributed API (Go)
- `StartRPCServer(nodeID, port)`: Initialize node for network communication.
- `SendRPCCommand(port, cmd, payload)`: Call a remote node.
- `NewLoadBalancer(nodes)`: Create a traffic distributor.

## File System API
- `fs_create_file(id, data, size)`: Persist data to disk.
- `fs_read_file(id, buffer)`: Retrieve data from disk.
