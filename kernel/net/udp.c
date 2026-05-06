#include "net.h"
#include "../drivers/screen.h"

void net_receive_udp(uint8_t* packet, uint32_t len, ip_t src_ip) {
    // udp_header_t* header = (udp_header_t*)packet;
    
    // In a full OS, we would look up our open Socket structures to see
    // if any process is listening on header->dest_port.
    
    // For this prototype, we strip the 8-byte UDP header and print the raw payload!
    char* payload = (char*)(packet + sizeof(udp_header_t));
    
    kprint("[UDP] Packet received and unpacked successfully!\n");
    kprint("      PAYLOAD: \"");
    kprint(payload);
    kprint("\"\n");
    
    // In Step 11, this payload ("RPC REQUEST") gets routed directly 
    // into our Distributed Consensus algorithms.
}
