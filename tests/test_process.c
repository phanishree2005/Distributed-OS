#include "../kernel/process/process.h"
#include "../drivers/screen.h"

static int test_proc_ran = 0;

void dummy_process() {
    test_proc_ran = 1;
    yield();
}

void test_process() {
    kprint("[TEST] Starting Process Tests...\n");
    
    process_t* p = create_process(dummy_process);
    if (p != 0 && p->pid > 0) {
        kprint("  [PASS] Process created with valid PID.\n");
    } else {
        kprint("  [FAIL] Process creation failed.\n");
    }
    
    kprint("[TEST] Process Tests Complete.\n\n");
}
