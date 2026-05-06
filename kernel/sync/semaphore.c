#include "sync.h"
#include "../process/process.h" // For yield()

void semaphore_init(semaphore_t *s, int initial_count) {
    s->count = initial_count;
    spinlock_init(&s->lock);
}

void semaphore_wait(semaphore_t *s) {
    while (1) {
        // Protect the counter check
        spinlock_acquire(&s->lock);
        
        if (s->count > 0) {
            s->count--;
            spinlock_release(&s->lock);
            return; // We secured a resource!
        }
        
        spinlock_release(&s->lock);
        
        // Resource pool is empty, yield CPU to let other processes work and eventually signal()
        yield();
    }
}

void semaphore_signal(semaphore_t *s) {
    // Protect the counter increment
    spinlock_acquire(&s->lock);
    s->count++;
    spinlock_release(&s->lock);
}
