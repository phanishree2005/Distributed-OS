#include "sync.h"
#include "../process/process.h" // For yield() and current_process

void mutex_init(mutex_t *m) {
    m->locked = 0;
    m->owner_pid = 0;
}

void mutex_lock(mutex_t *m) {
    uint32_t acquired = 1;
    while (acquired) {
        __asm__ __volatile__(
            "xchg %0, %1"
            : "=r" (acquired), "=m" (m->locked)
            : "0" (1), "m" (m->locked)
        );
        
        // If we didn't get the lock, DON'T burn CPU cycles.
        // Yield the CPU to another process!
        if (acquired == 1) {
            yield();
        }
    }
    
    // We safely acquired it. Register the owner.
    if (current_process) {
        m->owner_pid = current_process->pid;
    }
}

void mutex_unlock(mutex_t *m) {
    // Only the process that locked the mutex can unlock it!
    if (!current_process || m->owner_pid == current_process->pid) {
        m->owner_pid = 0;
        __asm__ __volatile__("movl $0, %0" : "=m" (m->locked) : : "memory");
    }
}
