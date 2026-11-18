import type { Level } from '../types';
import { slug } from './helpers';

// Courses shown on the Courses page.
// A course either IS a module (moduleId) or collects lessons from several modules (lessons).
export type CourseDef = {
  id: string;
  title: string;
  level: Level;
  blurb: string;
  moduleId?: string;
  lessons?: string[]; // lesson ids
};

const ls = (mod: string, ...titles: string[]) => titles.map((t) => mod + '-' + slug(t));

export const COURSES: CourseDef[] = [
  // Beginner
  { id: 'm1', moduleId: 'm1', title: 'Networking Fundamentals', level: 'Beginner', blurb: 'What a network is, how data moves, network types, topologies and architectures.' },
  { id: 'm2', moduleId: 'm2', title: 'Networking Devices', level: 'Beginner', blurb: 'Routers, switches, hubs, modems, access points, firewalls and more: what each does and when to use it.' },
  { id: 'osi-model', title: 'OSI Model', level: 'Beginner', blurb: 'The seven layers, their data units and devices, and how encapsulation works.',
    lessons: ls('m3', 'OSI Model', 'Seven OSI Layers', 'Data Encapsulation', 'Data Decapsulation', 'OSI vs TCP/IP') },
  { id: 'tcp-ip-fundamentals', title: 'TCP/IP Fundamentals', level: 'Beginner', blurb: 'The model the internet runs on: IP addressing, TCP and UDP, and the core services every device uses.',
    lessons: [...ls('m3', 'TCP/IP Model', 'Data Encapsulation'), ...ls('m4', 'IPv4', 'IPv6', 'Public and Private IP', 'MAC Address'), ...ls('m6', 'TCP', 'UDP', 'ARP', 'ICMP', 'DNS', 'DHCP', 'HTTP'), ...ls('m3', 'OSI vs TCP/IP')] },
  { id: 'm14', moduleId: 'm14', title: 'Career Preparation', level: 'Beginner', blurb: 'Roles, NOC processes, SLAs, CCNA direction, resumes and interviews.' },
  // Intermediate
  { id: 'm4', moduleId: 'm4', title: 'IP Addressing', level: 'Intermediate', blurb: 'IPv4, IPv6, public and private addresses, masks, gateways, CIDR and binary.' },
  { id: 'm5', moduleId: 'm5', title: 'Subnetting', level: 'Intermediate', blurb: 'Masks, host and network bits, address ranges, VLSM, FLSM and supernetting with worked examples.' },
  { id: 'm6', moduleId: 'm6', title: 'Networking Protocols', level: 'Intermediate', blurb: 'TCP, UDP, HTTP, HTTPS, DNS, DHCP, ARP, ICMP, email protocols, SNMP, NTP, TLS and QUIC.' },
  { id: 'm7', moduleId: 'm7', title: 'Routing and Switching', level: 'Intermediate', blurb: 'Routing tables, static and dynamic routing, VLANs, trunks, STP, OSPF, BGP, EIGRP and RIP.' },
  { id: 'm8', moduleId: 'm8', title: 'Wireless Networking', level: 'Intermediate', blurb: 'Wi-Fi standards, SSIDs, WPA2 and WPA3, frequencies, Bluetooth and mobile networks.' },
  { id: 'm10', moduleId: 'm10', title: 'Network Services', level: 'Intermediate', blurb: 'DNS, DHCP, web, proxy, mail, file and database servers, NAT, PAT and CDNs.' },
  { id: 'm11', moduleId: 'm11', title: 'Troubleshooting', level: 'Intermediate', blurb: 'Common faults, then one lesson for every command and tool: ping to curl, Wireshark, Nmap and Packet Tracer.' },
  { id: 'm12', moduleId: 'm12', title: 'Practical Networking Labs', level: 'Intermediate', blurb: 'Step-by-step labs from a two-PC network to a complete small office.' },
  // Advanced
  { id: 'm9', moduleId: 'm9', title: 'Network Security', level: 'Advanced', blurb: 'Firewalls, VPNs, encryption, authentication, IDS and IPS, DDoS, segmentation and Zero Trust.' },
  { id: 'advanced-routing', title: 'Advanced Routing', level: 'Advanced', blurb: 'Dynamic routing in depth: multi-area OSPF, EIGRP, BGP policy, MPLS, IPv6 routing and summarisation.',
    lessons: [...ls('m7', 'Dynamic Routing', 'OSPF', 'EIGRP'), ...ls('m13', 'Advanced OSPF', 'BGP', 'MPLS', 'IPv6 Routing'), ...ls('m5', 'Supernetting'), ...ls('m11', 'Routing Problems')] },
  { id: 'enterprise-networking', title: 'Enterprise Networking', level: 'Advanced', blurb: 'Designing and running large networks: redundancy, high availability, QoS, SD-WAN, monitoring and automation.',
    lessons: [...ls('m7', 'STP'), ...ls('m13', 'Network Redundancy', 'High Availability', 'Load Balancing', 'QoS', 'SD-WAN', 'Network Monitoring', 'Network Automation'), ...ls('m9', 'Network Segmentation'), ...ls('m8', 'Access Points')] },
  { id: 'cloud-networking', title: 'Cloud Networking', level: 'Advanced', blurb: 'Virtual networks, NAT, load balancers, CDNs, VPN and Zero Trust access for cloud services.',
    lessons: [...ls('m10', 'Cloud Networking', 'NAT', 'PAT', 'CDN', 'DNS Servers', 'Web Servers', 'Proxy Servers'), ...ls('m2', 'Load Balancer'), ...ls('m9', 'VPN', 'Zero Trust'), ...ls('m13', 'SD-WAN')] },
];
