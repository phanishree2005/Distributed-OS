# Project Limitations & Future Roadmap

Acknowledging limitations is a sign of a mature engineer. Here is where DistributedOS can grow:

## 1. Memory Fragmentation
- **Current**: Simple free-list allocator.
- **Limitation**: Can suffer from external fragmentation over long uptimes.
- **Next Step**: Implement a **Buddy Allocator** or **Slab Allocator** (like Linux) to handle varying block sizes efficiently.

## 2. Disk Performance
- **Current**: ATA PIO (Programmed I/O).
- **Limitation**: The CPU is busy during the entire disk transfer.
- **Next Step**: Implement **DMA (Direct Memory Access)** to let the disk controller write to RAM without CPU intervention.

## 3. Network Complexity
- **Current**: UDP-based simplified protocol.
- **Limitation**: No congestion control or guaranteed ordering.
- **Next Step**: Build a full **TCP sliding window** mechanism and retransmission logic.

## 4. Security
- **Current**: Ring 0 kernel (flat mode).
- **Limitation**: User programs could theoretically overwrite kernel memory.
- **Next Step**: Implement **User/Kernel Separation (Ring 3)** via GDT Task State Segments (TSS).
