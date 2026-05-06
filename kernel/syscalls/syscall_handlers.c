#include "syscall_table.h"
#include "../drivers/screen.h"
#include "../process/process.h"

// Actual implementations executed by the Kernel

void sys_write(char *str) {
    kprint(str); // Safely print to screen using Kernel privileges
}

void sys_exit() {
    kprint("\nProcess Terminated via SYS_EXIT.\n");
    if (current_process) {
        current_process->state = PROCESS_TERMINATED;
    }
    // Yield CPU immediately to the next process
    schedule();
}

void sys_read() {
    // TODO: Read from keyboard buffer
}

void sys_fork() {
    // TODO: Duplicate process PCB and Memory
}
