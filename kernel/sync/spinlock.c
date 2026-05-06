#include "sync.h"

void spinlock_init(spinlock_t *lock) {
    lock->locked = 0;
}

void spinlock_acquire(spinlock_t *lock) {
    // Atomic test-and-set using the xchg assembly instruction.
    // We keep looping (spinning) until the lock transitions from 1 to 0.
    uint32_t acquired = 1;
    while (acquired) {
        __asm__ __volatile__(
            "xchg %0, %1"
            : "=r" (acquired), "=m" (lock->locked)
            : "0" (1), "m" (lock->locked)
        );
    }
}

void spinlock_release(spinlock_t *lock) {
    // Atomically set to 0 to release it to the next spinner
    __asm__ __volatile__ (
        "movl $0, %0"
        : "=m" (lock->locked)
        : "m" (lock->locked)
        : "memory"
    );
}
