#include "../kernel/syscalls/syscall.h"

// Critical: Standard String comparison
int strcmp(char s1[], char s2[]) {
    int i;
    for (i = 0; s1[i] == s2[i]; i++) {
        if (s1[i] == '\0') return 0;
    }
    return s1[i] - s2[i];
}

// System Command Dispatcher
void execute_command(char *input) {
    if (strcmp(input, "list-nodes") == 0) {
        syscall_write("NODE_ID    HEALTH    STATUS\n");
        syscall_write("NodeA      100%      LEADER\n");
        syscall_write("NodeB      100%      FOLLOWER\n");
    } else if (strcmp(input, "status") == 0) {
        syscall_write("System: STABLE | CPU: 12% | Mem: 256KB/4096KB\n");
    } else if (strcmp(input, "help") == 0) {
        syscall_write("Commands: ls, cat, status, list-nodes, run-task, help\n");
    } else {
        syscall_write("Unknown command.\n");
    }
}

void shell_main() {
    syscall_write("\nDistributedOS Bash Terminal\n");
    
    // Automated Demo for Interview Video
    syscall_write("root@nodeA:~$ status\n");
    execute_command("status");
    
    syscall_write("\nroot@nodeA:~$ list-nodes\n");
    execute_command("list-nodes");
    
    syscall_write("\nroot@nodeA:~$ ");
    syscall_exit();
}
