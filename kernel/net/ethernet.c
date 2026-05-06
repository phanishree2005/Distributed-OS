#include "net.h"
#include "../drivers/screen.h"

// Network traffic is Big-Endian. Our CPU is Little-Endian.
// This utility swaps the bytes so our OS can read them correctly.
uint16_t ntohs(uint16_t netshort) {
    return ((netshort & 0xFF) << 8) | ((netshort & 0xFF00) >> 8);
}

// Entry point from the Hardware Network Card Interrupt
void net_receive_ethernet(uint8_t* frame, uint32_t len) {
    ethernet_header_t* header = (ethernet_header_t*)frame;
    uint16_t type = ntohs(header->type);
    
    // IPv4 Protocol
    if (type == 0x0800) {
        // Strip the 14-byte Ethernet header and pass the rest to the IP layer!
        net_receive_ipv4(frame + sizeof(ethernet_header_t), len - sizeof(ethernet_header_t));
    } else if (type == 0x0806) {
        kprint("[NET] ARP Packet received. Resolving MAC address...\n");
    } else {
        kprint("[NET] Unknown Ethernet frame dropped.\n");
    }
}
