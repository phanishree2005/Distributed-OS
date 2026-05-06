# Makefile
# Bootloader and Kernel compilation for DistributedOS

CC = gcc
ASM = nasm
LD = ld
QEMU = qemu-system-i386

CFLAGS = -ffreestanding -m32 -g -c -fno-pie -fno-stack-protector -fno-builtin
LDFLAGS = -m elf_i386 -T boot/linker.ld -nostdlib

# Automatically find all C files and Headers
C_SOURCES = $(wildcard kernel/core/*.c kernel/drivers/*.c kernel/memory/*.c kernel/process/*.c kernel/sync/*.c kernel/syscalls/*.c kernel/fs/*.c kernel/net/*.c apps/*.c tests/*.c)
HEADERS = $(wildcard kernel/core/*.h kernel/drivers/*.h kernel/memory/*.h kernel/process/*.h kernel/sync/*.h kernel/syscalls/*.h kernel/fs/*.h kernel/net/*.h apps/*.h tests/*.h)

# Convert the .c filenames to .o to give a list of object files to build
OBJ = $(C_SOURCES:.c=.o) kernel/core/interrupt.o kernel/process/context_switch.o

.PHONY: all run clean

all: os-image.bin

os-image.bin: boot/bootloader.bin kernel.bin
	copy /b boot\bootloader.bin + kernel.bin os-image.bin

kernel.bin: boot/kernel_entry.o ${OBJ}
	$(LD) $(LDFLAGS) -o $@ $^ --oformat binary

# Generic rule for compiling C code to an object file
%.o: %.c ${HEADERS}
	$(CC) $(CFLAGS) $< -o $@

# Generic rule for assembling ASM code to an object file
%.o: %.asm
	$(ASM) -f elf32 $< -o $@

boot/bootloader.bin: boot/bootloader.asm
	$(ASM) -f bin $< -o $@

run: all
	$(QEMU) -drive format=raw,file=os-image.bin

clean:
	del /Q boot\*.bin 2>nul
	del /Q boot\*.o 2>nul
	del /Q kernel\core\*.o 2>nul
	del /Q kernel\drivers\*.o 2>nul
	del /Q *.bin 2>nul
