#ifndef NET_H
#define NET_H
#include "../core/types.h"

// MAC Address (6 bytes)
typedef struct {
    uint8_t mac[6];
} __attribute__((packed)) mac_t;

// IP Address (4 bytes)
typedef struct {
    uint8_t ip[4];
} __attribute__((packed)) ip_t;

// 1. Ethernet Frame Header (14 bytes)
typedef struct {
    mac_t dest;
    mac_t src;
    uint16_t type; // e.g. 0x0800 for IPv4
} __attribute__((packed)) ethernet_header_t;

// 2. IPv4 Header (20 bytes min)
typedef struct {
    uint8_t version_ihl;
    uint8_t dscp_ecn;
    uint16_t length;
    uint16_t ident;
    uint16_t flags_fragment;
    uint8_t ttl;
    uint8_t protocol; // 17 = UDP, 6 = TCP, 1 = ICMP
    uint16_t checksum;
    ip_t src;
    ip_t dest;
} __attribute__((packed)) ipv4_header_t;

// 3. UDP Header (8 bytes)
typedef struct {
    uint16_t src_port;
    uint16_t dest_port;
    uint16_t length;
    uint16_t checksum;
} __attribute__((packed)) udp_header_t;

// Socket Structure for User Space
typedef struct {
    uint32_t fd;
    uint16_t port;
    uint8_t is_listening;
} socket_t;

// Internal Handlers (OS parsing the raw byte stream)
void net_init();
void net_receive_ethernet(uint8_t* frame, uint32_t len);
void net_receive_ipv4(uint8_t* packet, uint32_t len);
void net_receive_udp(uint8_t* packet, uint32_t len, ip_t src_ip);

// User Space Socket API
socket_t* socket_create(uint16_t port);
void socket_send(socket_t* sock, ip_t dest, uint16_t dest_port, char* data, uint32_t len);

#endif
