#include "fs.h"
#include "disk.h"
#include "../drivers/screen.h"
#include "../memory/memory.h"

// A very simple flat file system mapping
// We allocate LBAs sequentially starting from sector 100
// to avoid overwriting our bootloader and kernel!
uint32_t next_free_lba = 100;

#define MAX_FILES 64
inode_t file_table[MAX_FILES];
uint32_t file_count = 0;

void fs_init() {
    file_count = 0;
    // In a real OS, we would load the Inode table from Sector 1.
    // For this prototype, we build it freshly in RAM.
}

void fs_create_file(uint32_t id, char* data, uint32_t size) {
    if (file_count >= MAX_FILES) {
        kprint("FS Error: Max files reached.\n");
        return;
    }
    
    inode_t new_file;
    new_file.id = id;
    new_file.size = size;
    new_file.first_block = next_free_lba;
    
    // Calculate sectors required (512 bytes per sector)
    uint8_t sectors_needed = (size / 512) + 1;
    
    // We must pass a 16-bit aligned buffer to the ATA driver
    uint16_t *buffer = (uint16_t*) kmalloc_a(512 * sectors_needed);
    
    // Copy string data into the aligned buffer
    for(uint32_t i=0; i<size; i++) {
        ((char*)buffer)[i] = data[i];
    }
    
    // Physically write it to the hard disk
    ata_lba_write(new_file.first_block, sectors_needed, buffer);
    
    file_table[file_count++] = new_file;
    next_free_lba += sectors_needed;
    
    kprint("[FS] File created and flushed to Disk Sector ");
    // ... skipping print_hex for brevity
}

void fs_read_file(uint32_t id, char* buffer) {
    for (uint32_t i = 0; i < file_count; i++) {
        if (file_table[i].id == id) {
            inode_t file = file_table[i];
            uint8_t sectors_needed = (file.size / 512) + 1;
            
            // Allocate an aligned buffer for disk read
            uint16_t *disk_buf = (uint16_t*) kmalloc_a(512 * sectors_needed);
            
            // Physically read it from the hard disk
            ata_lba_read(file.first_block, sectors_needed, disk_buf);
            
            // Copy back to the user's character buffer
            for(uint32_t j=0; j<file.size; j++) {
                buffer[j] = ((char*)disk_buf)[j];
            }
            buffer[file.size] = '\0'; // Null-terminate
            return;
        }
    }
    kprint("FS Error: File not found.\n");
}
