#ifndef MEMORY_H
#define MEMORY_H

#include "../core/types.h"

// Basic kernel malloc (kmalloc)
uint32_t kmalloc(uint32_t size, int align, uint32_t *phys_addr);

// Helper functions
uint32_t kmalloc_a(uint32_t size); // Page aligned
uint32_t kmalloc_p(uint32_t size, uint32_t *phys_addr); // Returns physical address
uint32_t kmalloc_ap(uint32_t size, uint32_t *phys_addr); // Page aligned + Returns physical address
uint32_t kmalloc_base(uint32_t size); // Standard malloc

#endif
