#include "../drivers/screen.h"
#include "isr.h"
#include "irq.h"
#include "../drivers/timer.h"
#include "../process/process.h"
#include "../sync/sync.h"

// --- DEMO 1: RACE CONDITION & SYNC ---
volatile int shared_counter = 0;
mutex_t counter_mutex;

void process_A() {
    for(int i = 0; i < 5; i++) {
        mutex_lock(&counter_mutex);
        shared_counter++;
        kprint("A: Counter = ");
        // kprint_int(shared_counter) simulated
        kprint("INC\n");
        mutex_unlock(&counter_mutex);
        for (volatile int j = 0; j < 10000000; j++);
    }
}

void process_B() {
    for(int i = 0; i < 5; i++) {
        mutex_lock(&counter_mutex);
        shared_counter++;
        kprint("B: Counter = ");
        kprint("INC\n");
        mutex_unlock(&counter_mutex);
        for (volatile int j = 0; j < 10000000; j++);
    }
}

void process_C() {
    while(1) {
        kprint("[IDLE] Node monitoring heartbeat...\n");
        for (volatile int j = 0; j < 50000000; j++);
        yield();
    }
}

void main() {
    clear_screen();
    isr_install();
    irq_install();
    initialise_paging();
    init_process_manager();
    
    kprint("========================================\n");
    kprint("  DistributedOS: INTERVIEW DEFENSE DEMO\n");
    kprint("========================================\n\n");
    
    // Initialize Sync
    mutex_init(&counter_mutex);
    
    kprint("Step 1: Spawning 3 concurrent processes...\n");
    create_process(process_A);
    create_process(process_B);
    create_process(process_C);
    
    kprint("Step 2: Starting Preemptive Scheduler...\n");
    init_timer(100);
    __asm__ __volatile__("sti"); 
    
    start_scheduler();
    
    while(1) { __asm__ __volatile__("hlt"); }
}
