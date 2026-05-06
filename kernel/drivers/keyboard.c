#include "keyboard.h"
#include "../core/irq.h"
#include "../drivers/ports.h"
#include "../drivers/screen.h"

// Simplified QWERTY mapping for scancodes
const char scancode_to_char[] = {
    0, 27, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '\b',
    '\t', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\n',
    0, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '`', 0,
    '\\', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 0, '*', 0, ' '
};

static void keyboard_callback(registers_t regs) {
    uint8_t scancode = port_byte_in(0x60);
    
    // Ignore key releases (top bit set)
    if (scancode > 0x39) {
        return;
    }

    char letter = scancode_to_char[scancode];
    
    if (letter == '\b') {
        kprint_backspace();
    } else if (letter == '\n') {
        kprint("\nOS> ");
    } else if (letter != 0) {
        char str[2] = {letter, '\0'};
        kprint(str);
    }
}

void init_keyboard() {
    register_interrupt_handler(IRQ1, keyboard_callback);
}
