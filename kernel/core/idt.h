#ifndef IDT_H
#define IDT_H

#include "types.h"

#define KERNEL_CS 0x08

typedef struct {
    uint16_t low_offset; // Lower 16 bits of handler function address
    uint16_t sel;        // Kernel segment selector
    uint8_t always0;
    uint8_t flags;       // Priority, present, etc
    uint16_t high_offset;// Higher 16 bits of handler function address
} __attribute__((packed)) idt_gate_t;

typedef struct {
    uint16_t limit;
    uint32_t base;
} __attribute__((packed)) idt_register_t;

#define IDT_ENTRIES 256
idt_gate_t idt[IDT_ENTRIES];
idt_register_t idt_reg;

void set_idt_gate(int n, uint32_t handler);
void set_idt();

#endif
