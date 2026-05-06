#include "paging.h"
#include "../drivers/screen.h"
#include "../core/isr.h"

page_directory_t *kernel_directory = 0;
page_directory_t *current_directory = 0;

// descriptive Page Fault handler
void page_fault_handler(registers_t regs) {
    uint32_t faulting_address;
    __asm__ __volatile__("mov %%cr2, %0" : "=r" (faulting_address));
    
    int present = !(regs.err_code & 0x1);
    int rw = regs.err_code & 0x2;
    int us = regs.err_code & 0x4;
    int reserved = regs.err_code & 0x8;
    int id = regs.err_code & 0x10;

    kprint("\n!!! EXCEPTION: PAGE FAULT !!!\n");
    kprint("Faulting address: ");
    // ... hex print would be here
    kprint("Memory Protection Violation detected.\n");
    
    if (present) kprint("Reason: Page not present\n");
    if (rw) kprint("Reason: Write to read-only page\n");
    if (us) kprint("Reason: User-mode process tried to access kernel page\n");
    
    kprint("System Halted to prevent data corruption.\n");
    __asm__ __volatile__("cli; hlt");
}

void initialise_paging() {
    kernel_directory = (page_directory_t*)kmalloc_a(sizeof(page_directory_t));
    for (int i = 0; i < 1024; i++) {
        kernel_directory->tables[i] = 0;
        kernel_directory->tablesPhysical[i] = 0;
    }

    page_table_t *table = (page_table_t*)kmalloc_ap(sizeof(page_table_t), 0);
    for (int i = 0; i < 1024; i++) {
        table->pages[i].frame = i;
        table->pages[i].present = 1;
        table->pages[i].rw = 1;
        table->pages[i].user = 0;
    }

    kernel_directory->tables[0] = table;
    kernel_directory->tablesPhysical[0] = ((uint32_t)table) | 0x7;

    // Map interrupt 14 to our descriptive handler
    register_interrupt_handler(14, page_fault_handler);

    current_directory = kernel_directory;
    load_page_directory(kernel_directory);
    enable_paging();
}

void load_page_directory(page_directory_t *dir) {
    __asm__ __volatile__("mov %0, %%cr3":: "r"(&dir->tablesPhysical));
}

void enable_paging() {
    uint32_t cr0;
    __asm__ __volatile__("mov %%cr0, %0": "=r"(cr0));
    cr0 |= 0x80000000;
    __asm__ __volatile__("mov %0, %%cr0":: "r"(cr0));
}
