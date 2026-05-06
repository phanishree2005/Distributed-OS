#include "process.h"

extern void switch_task(uint32_t *prev_esp, uint32_t next_esp);

void schedule() {
    if (!current_process || !ready_queue) return;

    process_t *prev = current_process;
    process_t *next = ready_queue;

    // Dequeue next
    ready_queue = ready_queue->next;

    // Move current process to end of ready queue (Round Robin)
    prev->state = PROCESS_READY;
    prev->next = 0;

    if (!ready_queue) {
        ready_queue = prev;
    } else {
        process_t *curr = ready_queue;
        while(curr->next) curr = curr->next;
        curr->next = prev;
    }

    // Set next as running
    next->state = PROCESS_RUNNING;
    current_process = next;

    // Perform the magic assembly swap!
    switch_task(&prev->esp, next->esp);
}

void yield() {
    schedule();
}

void start_scheduler() {
    if (!ready_queue) return;
    
    current_process = ready_queue;
    ready_queue = ready_queue->next;
    current_process->state = PROCESS_RUNNING;
    
    // Jump into the first process!
    __asm__ __volatile__(
        "mov %0, %%esp \n"
        "pop %%ebx \n"
        "pop %%esi \n"
        "pop %%edi \n"
        "pop %%ebp \n"
        "ret \n"
        : : "r"(current_process->esp)
    );
}
