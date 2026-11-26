#include "../kernel/sync/sync.h"
#include "../drivers/screen.h"

void test_sync() {
    kprint("[TEST] Starting Synchronization Primitives Tests...\n");

    spinlock_t lock;
    spinlock_init(&lock);
    if (lock.locked == 0) {
        kprint("  [PASS] Spinlock initialized cleanly.\n");
    } else {
        kprint("  [FAIL] Spinlock initialization failed.\n");
    }

    spinlock_acquire(&lock);
    if (lock.locked == 1) {
        kprint("  [PASS] Spinlock acquire succeeded.\n");
    } else {
        kprint("  [FAIL] Spinlock acquire failed.\n");
    }

    spinlock_release(&lock);
    if (lock.locked == 0) {
        kprint("  [PASS] Spinlock release succeeded.\n");
    } else {
        kprint("  [FAIL] Spinlock release failed.\n");
    }

    mutex_t m;
    mutex_init(&m);
    if (m.locked == 0) {
        kprint("  [PASS] Mutex initialized cleanly.\n");
    } else {
        kprint("  [FAIL] Mutex initialization failed.\n");
    }

    mutex_lock(&m);
    if (m.locked == 1) {
        kprint("  [PASS] Mutex lock succeeded.\n");
    } else {
        kprint("  [FAIL] Mutex lock failed.\n");
    }

    mutex_unlock(&m);
    if (m.locked == 0) {
        kprint("  [PASS] Mutex unlock succeeded.\n");
    } else {
        kprint("  [FAIL] Mutex unlock failed.\n");
    }

    kprint("[TEST] Synchronization Tests Complete.\n\n");
}
