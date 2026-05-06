[bits 32]
[extern main] ; Declare that we will be referencing the external symbol 'main'

; This is the entry point where the bootloader will jump to.
; It's important that this is linked exactly at the beginning of the kernel binary.

global _start
_start:
    call main ; Call the C kernel's main function
    jmp $     ; Loop infinitely if main ever returns
