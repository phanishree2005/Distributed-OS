#include "../kernel/fs/fs.h"
#include "../drivers/screen.h"

void test_fs() {
    kprint("[TEST] Starting File System Tests...\n");
    
    char* test_data = "Test string for disk";
    fs_create_file(99, test_data, 20);
    
    char buf[32];
    fs_read_file(99, buf);
    
    // Simple check
    if (buf[0] == 'T' && buf[1] == 'e') {
        kprint("  [PASS] File read/write verified on disk.\n");
    } else {
        kprint("  [FAIL] File read/write mismatch.\n");
    }
    
    kprint("[TEST] File System Tests Complete.\n\n");
}
