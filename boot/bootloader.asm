; bootloader.asm
[bits 16]
[org 0x7c00]

KERNEL_OFFSET equ 0x1000 ; Memory offset to which we will load our kernel

start:
    cli                     ; Disable interrupts
    mov ax, 0x0000
    mov ds, ax              ; Set Data Segment
    mov es, ax              ; Set Extra Segment
    mov ss, ax              ; Set Stack Segment
    mov sp, 0x7C00          ; Set Stack Pointer

    mov [BOOT_DRIVE], dl    ; BIOS stores our boot drive in DL

    mov si, msg_loading
    call print_string_16

    call load_kernel        ; Read the kernel from disk into memory

    ; Enable A20 line (fast A20 gate)
    in al, 0x92
    or al, 2
    out 0x92, al

    lgdt [gdt_descriptor]   ; Load GDT

    mov eax, cr0
    or eax, 0x1             ; Set PE (Protection Enable) bit
    mov cr0, eax

    jmp CODE_SEG:init_pm    ; Far jump to 32-bit Protected Mode

; --- 16-bit Functions ---
print_string_16:
    mov ah, 0x0e
.loop:
    lodsb
    test al, al
    jz .done
    int 0x10
    jmp .loop
.done:
    ret

load_kernel:
    mov si, msg_load_kernel
    call print_string_16

    ; Set up parameters for BIOS disk read interrupt
    mov bx, KERNEL_OFFSET   ; Destination pointer where kernel will be loaded
    mov dh, 15              ; Number of sectors to read (15 * 512 bytes)
    mov dl, [BOOT_DRIVE]    ; Boot drive
    call disk_load
    ret

disk_load:
    push dx
    mov ah, 0x02            ; BIOS read sector function
    mov al, dh              ; Read DH sectors
    mov ch, 0x00            ; Cylinder 0
    mov dh, 0x00            ; Head 0
    mov cl, 0x02            ; Start reading from 2nd sector (right after our bootloader)
    int 0x13
    jc disk_error           ; Jump if error (carry flag set)
    pop dx
    cmp dh, al              ; Check if AL (sectors read) == DH (sectors expected)
    jne disk_error
    ret

disk_error:
    mov si, msg_disk_err
    call print_string_16
    jmp $

; Global Variables
BOOT_DRIVE db 0
msg_loading db "Booting DistributedOS...", 0x0A, 0x0D, 0
msg_load_kernel db "Loading kernel from disk...", 0x0A, 0x0D, 0
msg_disk_err db "Disk read error!", 0x0A, 0x0D, 0

; --- Global Descriptor Table (GDT) ---
gdt_start:
gdt_null:
    dd 0x0
    dd 0x0
gdt_code:
    dw 0xffff
    dw 0x0
    db 0x0
    db 10011010b
    db 11001111b
    db 0x0
gdt_data:
    dw 0xffff
    dw 0x0
    db 0x0
    db 10010010b
    db 11001111b
    db 0x0
gdt_end:

gdt_descriptor:
    dw gdt_end - gdt_start - 1
    dd gdt_start

CODE_SEG equ gdt_code - gdt_start
DATA_SEG equ gdt_data - gdt_start

; --- 32-bit Protected Mode ---
[bits 32]
init_pm:
    mov ax, DATA_SEG
    mov ds, ax
    mov ss, ax
    mov es, ax
    mov fs, ax
    mov gs, ax
    mov ebp, 0x90000
    mov esp, ebp

    call KERNEL_OFFSET      ; Jump to the loaded kernel!
    jmp $                   ; Infinite loop if kernel returns

; --- Bootsector Padding ---
times 510-($-$$) db 0
dw 0xaa55
