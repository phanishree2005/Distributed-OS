#include "syscall.h"
#include "syscall_table.h"
#include "../drivers/screen.h"

extern void sys_write(char *str);
extern void sys_exit();
extern void sys_read();
extern void sys_fork();

// Function pointer array for quick dispatcher mapping
void *syscalls[4] = {
    &sys_exit,
    &sys_fork,
    &sys_read,
    &sys_write
};

void syscall_handler(registers_t regs) {
    // System call number is loaded in the EAX register
    if (regs.eax >= 4) {
        kprint("Invalid syscall requested!\n");
        return;
    }
    
    // Get the address of the target function
    void *location = syscalls[regs.eax];
    
    // We push EBX, ECX, EDX, ESI, EDI onto the stack (parameters)
    // and call the function pointer dynamically.
    int ret;
    __asm__ __volatile__ (
        "push %1; \n"
        "push %2; \n"
        "push %3; \n"
        "push %4; \n"
        "push %5; \n"
        "call *%6; \n"
        "pop %%ebx; \n"
        "pop %%ebx; \n"
        "pop %%ebx; \n"
        "pop %%ebx; \n"
        "pop %%ebx; \n"
        : "=a" (ret) 
        : "r" (regs.edi), "r" (regs.esi), "r" (regs.edx), "r" (regs.ecx), "r" (regs.ebx), "r" (location)
    );
}

void initialise_syscalls() {
    // Standard Linux Syscall interrupt is 0x80 (128)
    register_interrupt_handler(128, syscall_handler);
}

// --- USERSPACE WRAPPERS ---
// This is the code that would be packaged in a 'libc' library 
// for user applications to call safely.

void syscall_write(char *str) {
    // Move SYS_WRITE (3) into EAX, and the string pointer into EBX
    __asm__ __volatile__("int $0x80" : : "a"(SYS_WRITE), "b"(str));
}

void syscall_exit() {
    __asm__ __volatile__("int $0x80" : : "a"(SYS_EXIT));
}
