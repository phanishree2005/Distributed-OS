#ifndef SYSCALL_H
#define SYSCALL_H

#include "../core/types.h"
#include "../core/isr.h"

void initialise_syscalls();
void syscall_handler(registers_t regs);

// --- C Wrappers for User Programs ---
// These use inline assembly to trigger 'int 0x80'
void syscall_write(char *str);
void syscall_exit();

#endif
