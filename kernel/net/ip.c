#include "net.h"
#include "../drivers/screen.h"

void net_receive_ipv4(uint8_t* packet, uint32_t len) {
    ipv4_header_t* header = (ipv4_header_t*)packet;
    
    // The Internet Header Length (IHL) is the bottom 4 bits.
    // It represents the number of 32-bit words (so we multiply by 4 to get bytes).
    uint8_t ihl = header->version_ihl & 0x0F;
    uint32_t header_len = ihl * 4;
    
    // Route based on Protocol
    if (header->protocol == 17) { // UDP
        // Strip the IP header and pass the rest to the UDP layer!
        net_receive_udp(packet + header_len, len - header_len, header->src);
    } else if (header->protocol == 6) { // TCP
        kprint("[IP] TCP Segment received. Queuing for SYN/ACK handshake.\n");
    } else if (header->protocol == 1) { // ICMP
        kprint("[IP] ICMP Ping Request received. Sending Pong response.\n");
    } else {
        kprint("[IP] Unknown IP protocol. Dropping.\n");
    }
}
