#include "../kernel/syscalls/syscall.h"

void app_ls() {
    syscall_write("FILE          SIZE\n");
    syscall_write("--------------------\n");
    syscall_write("secret.txt    23 B\n");
    syscall_write("server.bin    1024 B\n");
}
