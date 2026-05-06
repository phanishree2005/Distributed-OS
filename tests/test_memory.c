#include "../kernel/memory/memory.h"
#include "../drivers/screen.h"

void test_memory() {
    kprint("[TEST] Starting Memory Tests...\n");
    
    uint32_t phys;
    uint32_t a = kmalloc(16, 0, &phys);
    if (a != 0) {
        kprint("  [PASS] kmalloc returned valid address.\n");
    } else {
        kprint("  [FAIL] kmalloc failed.\n");
    }
    
    uint32_t b = kmalloc(16, 1, &phys);
    if ((b & 0xFFF) == 0) {
        kprint("  [PASS] Page alignment successful.\n");
    } else {
        kprint("  [FAIL] Page alignment failed.\n");
    }
    
    kprint("[TEST] Memory Tests Complete.\n\n");
}
