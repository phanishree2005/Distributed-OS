#include "net.h"
#include "../drivers/screen.h"
#include "../memory/memory.h"

#define MAX_SOCKETS 32
socket_t sockets[MAX_SOCKETS];
uint32_t socket_count = 0;

void net_init() {
    socket_count = 0;
    kprint("[NET] TCP/IP Protocol Stack Initialized.\n");
}

socket_t* socket_create(uint16_t port) {
    if (socket_count >= MAX_SOCKETS) return 0;
    
    socket_t* sock = &sockets[socket_count++];
    sock->fd = socket_count; // File Descriptor starts at 1
    sock->port = port;
    sock->is_listening = 1;
    
    return sock;
}

void socket_send(socket_t* sock, ip_t dest, uint16_t dest_port, char* data, uint32_t len) {
    kprint("[SOCKET] Constructing outward packet...\n");
    // In a real OS, this function wraps the data backwards:
    // 1. Adds UDP Header
    // 2. Adds IP Header
    // 3. Adds Ethernet Header
    // 4. Writes the physical bytes to the RTL8139 Network Interface Card (NIC) via I/O Ports
}
