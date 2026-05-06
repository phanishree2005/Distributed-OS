#include "disk.h"
#include "../drivers/ports.h"

// ATA PIO implementation for reading and writing to the hard disk.
// IDE Controllers map to specific I/O Ports:
// Status Register: 0x1F7 | Command Register: 0x1F7 | Data Register: 0x1F0

void ata_wait_bsy() {
    // Wait until the BSY (Busy) bit is cleared (bit 7)
    while(port_byte_in(0x1F7) & 0x80);
}

void ata_wait_drq() {
    // Wait until the DRQ (Data Request) bit is set (bit 3)
    while(!(port_byte_in(0x1F7) & 0x08));
}

void ata_lba_read(uint32_t lba, uint8_t count, uint16_t *target) {
    ata_wait_bsy();
    
    // Select the master drive and send the highest 4 bits of the LBA
    port_byte_out(0x1F6, 0xE0 | ((lba >> 24) & 0x0F));
    
    port_byte_out(0x1F2, count);               // Sector count
    port_byte_out(0x1F3, (uint8_t) lba);       // Low 8 bits of LBA
    port_byte_out(0x1F4, (uint8_t)(lba >> 8)); // Next 8 bits
    port_byte_out(0x1F5, (uint8_t)(lba >> 16));// Next 8 bits
    
    port_byte_out(0x1F7, 0x20); // 0x20 is the "Read Sectors" command

    for (int j = 0; j < count; j++) {
        ata_wait_bsy();
        ata_wait_drq();
        
        // A sector is 512 bytes, read as 256 16-bit words
        for (int i = 0; i < 256; i++) {
            target[i] = port_word_in(0x1F0);
        }
    }
}

void ata_lba_write(uint32_t lba, uint8_t count, uint16_t *source) {
    ata_wait_bsy();
    
    port_byte_out(0x1F6, 0xE0 | ((lba >> 24) & 0x0F));
    
    port_byte_out(0x1F2, count);
    port_byte_out(0x1F3, (uint8_t) lba);
    port_byte_out(0x1F4, (uint8_t)(lba >> 8));
    port_byte_out(0x1F5, (uint8_t)(lba >> 16));
    
    port_byte_out(0x1F7, 0x30); // 0x30 is the "Write Sectors" command

    for (int j = 0; j < count; j++) {
        ata_wait_bsy();
        ata_wait_drq();
        
        for (int i = 0; i < 256; i++) {
            port_word_out(0x1F0, source[i]);
        }
    }
}
