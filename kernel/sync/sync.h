#ifndef SYNC_H
#define SYNC_H

#include "../core/types.h"

// --- SPINLOCK ---
// Spinlocks burn CPU cycles while waiting (busy waiting).
typedef struct {
    volatile uint32_t locked;
} spinlock_t;

void spinlock_init(spinlock_t *lock);
void spinlock_acquire(spinlock_t *lock);
void spinlock_release(spinlock_t *lock);

// --- MUTEX ---
// Mutexes yield the CPU if the lock is unavailable (no busy waiting).
typedef struct {
    volatile uint32_t locked;
    uint32_t owner_pid;
} mutex_t;

void mutex_init(mutex_t *m);
void mutex_lock(mutex_t *m);
void mutex_unlock(mutex_t *m);

// --- SEMAPHORE ---
// Controls access to a pool of resources
typedef struct {
    volatile int count;
    spinlock_t lock; // Protects the counter from race conditions
} semaphore_t;

void semaphore_init(semaphore_t *s, int initial_count);
void semaphore_wait(semaphore_t *s);
void semaphore_signal(semaphore_t *s);

#endif
