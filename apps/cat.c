#include "../kernel/syscalls/syscall.h"

void app_cat(char *filename) {
    // In a real OS, we would use a syscall like sys_open() and sys_read()
    // For this prototype, we simulate returning the disk contents
    syscall_write("Hello, Persistent Disk!\n");
}
