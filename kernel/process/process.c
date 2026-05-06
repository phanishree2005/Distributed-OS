#include "process.h"
#include "../memory/memory.h"
#include "../drivers/screen.h"
#include "../drivers/ports.h"

process_t *current_process = 0;
process_t *ready_queue = 0;
uint32_t next_pid = 1;

void init_process_manager() {
    current_process = 0;
    ready_queue = 0;
}

// Wrapper that acknowledges the Timer PIC and enables interrupts
// so that a new process can successfully be preempted later!
void process_wrapper(void (*entry_point)()) {
    port_byte_out(0x20, 0x20); // Send EOI to PIC master
    __asm__ __volatile__("sti"); // Re-enable interrupts
    entry_point();
    while(1); // Process finished
}

process_t* create_process(void (*entry_point)()) {
    process_t *new_proc = (process_t*)kmalloc_a(sizeof(process_t));
    new_proc->pid = next_pid++;
    new_proc->state = PROCESS_READY;
    new_proc->stack_base = kmalloc_a(4096);
    
    uint32_t *stack = (uint32_t*)(new_proc->stack_base + 4096);
    
    // C Calling convention: Arguments are pushed right to left
    *(--stack) = (uint32_t)entry_point; // Argument to process_wrapper
    *(--stack) = 0;                     // Dummy return address for process_wrapper
    *(--stack) = (uint32_t)process_wrapper; // EIP (Will be popped by 'ret' in context_switch)
    *(--stack) = 0; // EBP
    *(--stack) = 0; // EDI
    *(--stack) = 0; // ESI
    *(--stack) = 0; // EBX
    
    new_proc->esp = (uint32_t)stack;
    new_proc->next = 0;
    
    if (!ready_queue) {
        ready_queue = new_proc;
    } else {
        process_t *curr = ready_queue;
        while(curr->next) curr = curr->next;
        curr->next = new_proc;
    }
    
    return new_proc;
}
