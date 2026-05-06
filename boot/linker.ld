ENTRY(_start)

SECTIONS {
    . = 0x1000;

    .text : {
        *(.text)
    }

    .data : {
        *(.data)
        *(.rodata)
    }

    .bss : {
        *(.bss)
    }

    /* 
     * IMPORTANT: We define 'end' here so our memory allocator (malloc.c)
     * knows exactly where the kernel binary finishes in RAM.
     * This allows us to safely allocate memory AFTER the kernel!
     */
    end = .; _end = .; __end = .;
}
