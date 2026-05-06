#ifndef PAGING_H
#define PAGING_H

#include "../core/types.h"
#include "memory.h"

// Define a single page (4KB)
typedef struct {
    uint32_t present    : 1;   // Page present in memory
    uint32_t rw         : 1;   // Read-only if clear, readwrite if set
    uint32_t user       : 1;   // Supervisor level only if clear
    uint32_t accessed   : 1;   // Has the page been accessed since last refresh?
    uint32_t dirty      : 1;   // Has the page been written to since last refresh?
    uint32_t unused     : 7;   // Amalgamation of unused and reserved bits
    uint32_t frame      : 20;  // Frame address (shifted right 12 bits)
} page_t;

// A page table contains 1024 pages
typedef struct {
    page_t pages[1024];
} page_table_t;

// A page directory contains 1024 page tables
typedef struct {
    page_table_t *tables[1024]; // Pointers to page tables (Virtual address)
    uint32_t tablesPhysical[1024]; // Physical addresses of tables
    uint32_t physicalAddr;
} page_directory_t;

void initialise_paging();
void load_page_directory(page_directory_t *dir);
void enable_paging();

#endif
