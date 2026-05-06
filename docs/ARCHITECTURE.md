# DistributedOS Architecture

## Overview
DistributedOS is a modular, bare-metal operating system designed for distributed computing. It follows a layered architecture to separate hardware concerns from high-level distributed logic.

## Layers
1. **Bootloader**: 16-bit real mode to 32-bit protected mode transition.
2. **Kernel Core**: Interrupt management (IDT), hardware I/O, and basic system utilities.
3. **Memory Management**: Virtual memory (paging) and kernel heap allocation (kmalloc).
4. **Process Management**: Preemptive multitasking with PCB, scheduler, and context switching.
5. **Drivers**: VGA screen, keyboard, PIT timer, and ATA disk drivers.
6. **File System**: Inode-based flat file system with persistence on physical disk.
7. **Network Stack**: TCP/IP implementation (Ethernet, IP, UDP, Sockets).
8. **Distributed Layer**: RPC communication, Raft consensus (leader election), and load balancing.

## Data Flow
- **Input**: Interrupts (IRQ) trigger handlers -> Schedulers -> Context Switches.
- **Output**: VGA buffer at 0xB8000.
- **Persistence**: ATA PIO commands to disk controllers.
- **Network**: Raw frame injection into the link layer.
