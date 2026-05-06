# DistributedOS Design Decisions

## 1. Monolithic vs Microkernel
DistributedOS uses a hybrid approach. While the core kernel handles hardware interrupts and memory, high-level distributed features are implemented as userspace-style modules (often in Go) to ensure scalability.

## 2. Paging and Segmentation
We use a flat memory model with 4KB paging. Segment descriptors (GDT) are used only as required by the x86 architecture, while paging handles isolation.

## 3. Preemptive Multitasking
A Round-Robin scheduler is triggered by the Programmable Interval Timer (PIT). Context switching is handled in Assembly to ensure register state integrity.

## 4. Synchronization
We implement three levels of sync:
- **Spinlocks**: For short, kernel-internal critical sections.
- **Mutexes**: For long-duration resource locking with process yielding.
- **Semaphores**: For pool-based resource management.

## 5. Distributed Consensus
We chose **Raft** over Paxos for its clarity and ease of implementation. It ensures that even if nodes fail, the cluster maintains a single source of truth.
