#ifndef PROCESS_H
#define PROCESS_H

#include "../core/types.h"

typedef enum {
    PROCESS_READY,
    PROCESS_RUNNING,
    PROCESS_BLOCKED,
    PROCESS_TERMINATED
} process_state_t;

// PCB (Process Control Block)
typedef struct process {
    uint32_t pid;
    uint32_t esp;          // Stack pointer for context switching
    process_state_t state;
    uint32_t stack_base;   // Base of allocated memory for stack
    struct process *next;  // Queue pointer
} process_t;

void init_process_manager();
process_t* create_process(void (*entry_point)());
void schedule();
void yield();
void start_scheduler();

extern process_t *current_process;
extern process_t *ready_queue;

#endif
