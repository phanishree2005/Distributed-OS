#include "../kernel/syscalls/syscall.h"

void app_simple_server() {
    syscall_write("[Server] Binding to TCP Port 80...\n");
    syscall_write("[Server] Actively listening for incoming HTTP requests...\n");
    
    // An infinite loop processing packets would go here
    // while(1) { receive_request(); send_response(); }
}
