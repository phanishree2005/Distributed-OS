#ifndef DISK_H
#define DISK_H
#include "../core/types.h"

// Read 'count' sectors starting at LBA into 'target' buffer
void ata_lba_read(uint32_t lba, uint8_t count, uint16_t *target);

// Write 'count' sectors starting at LBA from 'source' buffer
void ata_lba_write(uint32_t lba, uint8_t count, uint16_t *source);

#endif
