#include "irq.h"
#include "idt.h"
#include "../drivers/ports.h"

isr_t interrupt_handlers[256];

void register_interrupt_handler(uint8_t n, isr_t handler) {
    interrupt_handlers[n] = handler;
}

void irq_handler(registers_t r) {
    // Send an EOI (end of interrupt) signal to the PICs.
    // If this interrupt involved the slave, send EOI to it.
    if (r.int_no >= 40) {
        port_byte_out(0xA0, 0x20);
    }
    // Send EOI to master
    port_byte_out(0x20, 0x20);

    if (interrupt_handlers[r.int_no] != 0) {
        isr_t handler = interrupt_handlers[r.int_no];
        handler(r);
    }
}

void irq_install() {
    // ICW1: initialization
    port_byte_out(0x20, 0x11);
    port_byte_out(0xA0, 0x11);
    // ICW2: Vector offset mapping (PIC1 -> 32, PIC2 -> 40)
    port_byte_out(0x21, 0x20);
    port_byte_out(0xA1, 0x28);
    // ICW3: Cascade setup
    port_byte_out(0x21, 0x04);
    port_byte_out(0xA1, 0x02);
    // ICW4: 8086/88 mode
    port_byte_out(0x21, 0x01);
    port_byte_out(0xA1, 0x01);
    // Mask interrupts
    port_byte_out(0x21, 0x0);
    port_byte_out(0xA1, 0x0);

    set_idt_gate(32, (uint32_t)irq0);
    set_idt_gate(33, (uint32_t)irq1);
    set_idt_gate(34, (uint32_t)irq2);
    set_idt_gate(35, (uint32_t)irq3);
    set_idt_gate(36, (uint32_t)irq4);
    set_idt_gate(37, (uint32_t)irq5);
    set_idt_gate(38, (uint32_t)irq6);
    set_idt_gate(39, (uint32_t)irq7);
    set_idt_gate(40, (uint32_t)irq8);
    set_idt_gate(41, (uint32_t)irq9);
    set_idt_gate(42, (uint32_t)irq10);
    set_idt_gate(43, (uint32_t)irq11);
    set_idt_gate(44, (uint32_t)irq12);
    set_idt_gate(45, (uint32_t)irq13);
    set_idt_gate(46, (uint32_t)irq14);
    set_idt_gate(47, (uint32_t)irq15);
}
