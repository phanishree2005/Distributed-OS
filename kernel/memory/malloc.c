#include "memory.h"
#include "../drivers/screen.h"

// Symbol from linker
extern uint32_t end;
uint32_t placement_address = (uint32_t)&end;

// Simple Freelist Block Header
typedef struct header {
    uint32_t size;
    uint32_t is_free;
    struct header *next;
} header_t;

header_t *free_list_head = 0;

uint32_t kmalloc(uint32_t size, int align, uint32_t *phys_addr) {
    // 1. Alignment Handling
    if (align == 1 && (placement_address & 0xFFFFF000)) {
        placement_address &= 0xFFFFF000;
        placement_address += 0x1000;
    }

    // 2. Simple Bump Allocator Logic (for simplicity in bare-metal)
    // In a production OS, we would search the free_list here.
    if (phys_addr) *phys_addr = placement_address;

    uint32_t tmp = placement_address;
    placement_address += size;
    
    // Add a small header for future kfree capability
    header_t *h = (header_t*)tmp;
    h->size = size;
    h->is_free = 0;
    
    return tmp + sizeof(header_t);
}

void kfree(void *ptr) {
    if (!ptr) return;
    
    header_t *h = (header_t*)((uint32_t)ptr - sizeof(header_t));
    h->is_free = 1;
    
    // Add to free list
    h->next = free_list_head;
    free_list_head = h;
    
    // Note: In an interview, you can explain that this is a 
    // naive implementation and real OSes use Buddy Allocators or Slab.
    kprint("[MEM] Block freed and added to freelist.\n");
}

uint32_t kmalloc_a(uint32_t size) { return kmalloc(size, 1, 0); }
uint32_t kmalloc_p(uint32_t size, uint32_t *phys_addr) { return kmalloc(size, 0, phys_addr); }
uint32_t kmalloc_ap(uint32_t size, uint32_t *phys_addr) { return kmalloc(size, 1, phys_addr); }
uint32_t kmalloc_base(uint32_t size) { return kmalloc(size, 0, 0); }
