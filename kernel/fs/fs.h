#ifndef FS_H
#define FS_H
#include "../core/types.h"

// Simple Inode representing a file on disk
typedef struct {
    uint32_t id;
    uint32_t size;
    uint32_t first_block; // The LBA sector where the file begins
} inode_t;

void fs_init();
void fs_create_file(uint32_t id, char* data, uint32_t size);
void fs_read_file(uint32_t id, char* buffer);

#endif
