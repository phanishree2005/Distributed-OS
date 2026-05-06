#include "../kernel/net/net.h"
#include "../drivers/screen.h"

void test_network() {
    kprint("[TEST] Starting Network Stack Tests...\n");
    
    net_init();
    socket_t* s = socket_create(1234);
    if (s != 0 && s->port == 1234) {
        kprint("  [PASS] Socket created and bound to port.\n");
    } else {
        kprint("  [FAIL] Socket creation failed.\n");
    }
    
    kprint("[TEST] Network Stack Tests Complete.\n\n");
}
