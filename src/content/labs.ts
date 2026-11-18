// Virtual Lab scenarios. Each lab is shown only next to the lessons and questions it helps with.
// The simulator is read-only: commands return curated output; nothing touches real equipment.

export type LabScenario = {
  id: string;
  title: string;
  level: string;
  brief: string;
  objective: string[];
  hint: string;
  solution: string[];
  devices: string[];
  topology: string[];
  quick: string[];
  outputs: Record<string, string>;
};

export const LABS: LabScenario[] = [
  {
    id: 'vlan',
    title: 'Branch office: users cannot reach the server',
    level: 'Intermediate',
    brief: 'Users in VLAN 20 can reach their default gateway but cannot reach the server in VLAN 10. A recent switch change may have affected the uplink.',
    objective: ['Inspect VLAN membership on SW1.', 'Check the switch trunk configuration.', 'Identify the missing VLAN and explain the fix.'],
    hint: 'Compare the VLAN list on the access switch with the VLANs allowed on the trunk.',
    solution: ['Run show vlan brief on SW1: VLAN 20 exists and its access ports are assigned correctly.', 'Run show interfaces trunk: the uplink allows VLANs 10,30, but VLAN 20 is missing.', 'Add VLAN 20 to the trunk allowed list (switchport trunk allowed vlan add 20 on both ends), then verify end-to-end connectivity.'],
    devices: ['SW1', 'SW2', 'R1'],
    topology: ['PC-STAFF', 'SW1', 'SW2', 'SERVER'],
    quick: ['show vlan brief', 'show interfaces trunk', 'show interfaces status'],
    outputs: {
      'show vlan brief': 'VLAN Name                             Status    Ports\n1    default                          active    Gi0/2\n10   SERVERS                          active    Gi0/3\n20   STAFF                            active    Gi0/4, Gi0/5\n30   VOICE                            active    Gi0/6',
      'show interfaces trunk': 'Port    Mode   Encapsulation  Status    Native vlan\nGi0/1   on     802.1q          trunking  1\n\nPort    Vlans allowed on trunk\nGi0/1   10,30\n\nPort    Vlans allowed and active\nGi0/1   10,30',
      'show interfaces status': 'Port   Name       Status       Vlan  Duplex Speed Type\nGi0/1  Uplink     connected    trunk a-full a-1000  10/100/1000BaseTX\nGi0/4  Staff-01   connected    20    a-full a-1000  10/100/1000BaseTX',
      'ping 10.10.10.10': 'Sending 5, 100-byte ICMP Echos to 10.10.10.10:\n.....\nSuccess rate is 0 percent (0/5)',
      'show ip interface brief': 'Interface    IP-Address    OK? Method Status                Protocol\nVlan10       10.10.10.2    YES manual up                    up\nVlan20       10.20.20.2    YES manual up                    up\nGi0/1        unassigned    YES unset  up                    up',
      'help': 'Available commands: help, show vlan brief, show interfaces trunk, show interfaces status, show ip interface brief, ping 10.10.10.10, clear',
    },
  },
  {
    id: 'dhcp',
    title: 'Head office: new laptops receive no IP address',
    level: 'Intermediate',
    brief: 'New clients in VLAN 20 are self-assigning 169.254.x.x addresses. The DHCP server is in another subnet (192.0.2.50). Investigate the DHCP relay path.',
    objective: ['Check the client addressing state.', 'Inspect the router interface and DHCP relay configuration.', 'Identify the missing relay configuration.'],
    hint: 'A DHCP server on another subnet needs a relay agent on the client VLAN gateway.',
    solution: ['The client APIPA address (169.254.0.0/16) shows DHCP Discover never received an Offer.', 'The VLAN 20 gateway interface is up, and the DHCP server is reachable, but no helper address is configured.', 'Add ip helper-address 192.0.2.50 under interface Vlan20, then run ipconfig /renew on the client and verify the lease.'],
    devices: ['R1', 'PC-01'],
    topology: ['PC-01', 'SW-ACCESS', 'R1', 'DHCP-SERVER'],
    quick: ['ipconfig /all', 'show running-config interface vlan 20', 'ping 192.0.2.50'],
    outputs: {
      'ipconfig /all': 'Ethernet adapter LAN:\n   DHCP Enabled . . . . . . . . . : Yes\n   Autoconfiguration IPv4 Address : 169.254.24.18\n   Subnet Mask . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . :',
      'show ip interface brief': 'Interface    IP-Address     Status    Protocol\nGi0/0        192.0.2.1      up        up\nVlan20       10.20.20.1     up        up',
      'show running-config interface vlan 20': 'interface Vlan20\n description STAFF CLIENT GATEWAY\n ip address 10.20.20.1 255.255.255.0\n no shutdown\n!',
      'show ip route': 'C 10.20.20.0/24 is directly connected, Vlan20\nC 192.0.2.0/24 is directly connected, Gi0/0\nS* 0.0.0.0/0 via 192.0.2.254',
      'ping 192.0.2.50': 'Sending 5, 100-byte ICMP Echos to 192.0.2.50:\n!!!!!\nSuccess rate is 100 percent (5/5)',
      'help': 'Available commands: help, ipconfig /all, show ip interface brief, show running-config interface vlan 20, show ip route, ping 192.0.2.50, clear',
    },
  },
  {
    id: 'ospf',
    title: 'Remote site: OSPF routes are missing',
    level: 'Advanced',
    brief: 'The WAN link between R-BRANCH and R-HQ is up, but the branch router has no OSPF-learned routes. Check neighbour formation and interface settings.',
    objective: ['Confirm interface state and IP reachability.', 'Inspect OSPF neighbour status.', 'Find the parameter that does not match and state the correction.'],
    hint: 'OSPF neighbours must agree on the area ID of the link they share.',
    solution: ['Gi0/0 is up/up and ping to 10.0.0.2 succeeds, so Layers 1 to 3 work.', 'show ip ospf neighbor shows no neighbour.', 'show ip ospf interface brief shows Gi0/0 in area 0, while R-HQ uses area 1 on that link. Put both ends in the same area, then confirm the neighbour reaches FULL and O routes appear.'],
    devices: ['R-BRANCH'],
    topology: ['R-BRANCH', 'WAN LINK', 'R-HQ', 'HQ LAN'],
    quick: ['show ip ospf neighbor', 'show ip ospf interface brief', 'show ip route ospf'],
    outputs: {
      'show ip interface brief': 'Interface    IP-Address    Status    Protocol\nGi0/0        10.0.0.1      up        up\nGi0/1        192.168.50.1  up        up\nLo0          10.255.0.1    up        up',
      'show ip ospf neighbor': 'Neighbor ID     Pri   State           Dead Time   Address         Interface\n(no neighbours)',
      'show ip ospf interface brief': 'Interface    PID   Area   IP Address/Mask      Cost  State Nbrs F/C\nGi0/0        10    0      10.0.0.1/30          1     P2P   0/0\nGi0/1        10    0      192.168.50.1/24      1     DR    0/0\n\nPeer R-HQ Gi0/0 (10.0.0.2/30) is configured in area 1.',
      'show ip route ospf': '(no OSPF routes)',
      'ping 10.0.0.2': 'Sending 5, 100-byte ICMP Echos to 10.0.0.2:\n!!!!!\nSuccess rate is 100 percent (5/5)',
      'help': 'Available commands: help, show ip interface brief, show ip ospf neighbor, show ip ospf interface brief, show ip route ospf, ping 10.0.0.2, clear',
    },
  },
  {
    id: 'dns',
    title: 'Users: website name fails, IP works',
    level: 'Beginner',
    brief: 'Staff can ping a public IP address, but the company portal name does not open. Decide whether the issue is routing or name resolution.',
    objective: ['Test connectivity to an IP address.', 'Query the configured DNS resolver.', 'Explain why IP connectivity can work while names fail.'],
    hint: 'Use nslookup to test name resolution separately from IP reachability, and try a second resolver.',
    solution: ['ping 1.1.1.1 succeeds, so IP routing to the internet works.', 'nslookup portal.example.test times out against the configured resolver 10.20.20.53, but answers when asked of 1.1.1.1.', 'The office DNS server is the fault: check that its service is running and that UDP/TCP 53 is reachable. Do not change routing.'],
    devices: ['PC-01'],
    topology: ['PC-01', 'SWITCH', 'DNS 10.20.20.53', 'INTERNET'],
    quick: ['ipconfig /all', 'ping 1.1.1.1', 'nslookup portal.example.test', 'nslookup portal.example.test 1.1.1.1'],
    outputs: {
      'ping 1.1.1.1': 'Pinging 1.1.1.1 with 32 bytes of data:\nReply from 1.1.1.1: bytes=32 time=18ms TTL=57\nReply from 1.1.1.1: bytes=32 time=17ms TTL=57\nReply from 1.1.1.1: bytes=32 time=19ms TTL=57\nReply from 1.1.1.1: bytes=32 time=18ms TTL=57\n\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
      'nslookup portal.example.test': 'DNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  10.20.20.53\n\n*** Request to UnKnown timed-out',
      'nslookup portal.example.test 1.1.1.1': 'Server:  one.one.one.one\nAddress:  1.1.1.1\n\nNon-authoritative answer:\nName:    portal.example.test\nAddress:  203.0.113.80',
      'ipconfig /all': 'Ethernet adapter LAN:\n   IPv4 Address. . . . . . . . . : 10.20.20.44\n   Subnet Mask . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . : 10.20.20.1\n   DNS Servers . . . . . . . . . : 10.20.20.53',
      'tracert 1.1.1.1': 'Tracing route to 1.1.1.1 over a maximum of 30 hops\n  1    <1 ms    <1 ms    <1 ms  10.20.20.1\n  2     4 ms     4 ms     5 ms  198.51.100.1\n  3    18 ms    17 ms    18 ms  1.1.1.1\n\nTrace complete.',
      'help': 'Available commands: help, ipconfig /all, ping 1.1.1.1, nslookup portal.example.test, nslookup portal.example.test 1.1.1.1, tracert 1.1.1.1, clear',
    },
  },
  {
    id: 'gateway',
    title: 'One PC cannot reach anything outside its subnet',
    level: 'Beginner',
    brief: 'A newly installed PC can ping the printer next to it but cannot reach the internet or any server in another subnet. Its settings were typed in by hand.',
    objective: ['Read the PC\'s IP configuration.', 'Test local and remote reachability.', 'Find the wrong setting and give the correct value.'],
    hint: 'Check whether the default gateway is inside the same subnet as the PC\'s address.',
    solution: ['ipconfig /all shows 192.168.10.45 with mask 255.255.255.0 (subnet 192.168.10.0/24).', 'The default gateway is 192.168.1.1, which is outside that subnet, so the PC cannot deliver frames to it. ping 192.168.10.1 (the real router) succeeds.', 'Set the default gateway to 192.168.10.1, then confirm with ping 8.8.8.8.'],
    devices: ['PC-NEW'],
    topology: ['PC-NEW', 'SWITCH', 'R1 192.168.10.1', 'INTERNET'],
    quick: ['ipconfig /all', 'ping 192.168.10.20', 'ping 192.168.10.1', 'ping 8.8.8.8'],
    outputs: {
      'ipconfig /all': 'Ethernet adapter LAN:\n   DHCP Enabled. . . . . . . . . : No\n   IPv4 Address. . . . . . . . . : 192.168.10.45\n   Subnet Mask . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . : 192.168.10.53',
      'ipconfig': 'Ethernet adapter LAN:\n   IPv4 Address. . . . . . . . . : 192.168.10.45\n   Subnet Mask . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . : 192.168.1.1',
      'ping 192.168.10.20': 'Pinging 192.168.10.20 (printer) with 32 bytes of data:\nReply from 192.168.10.20: bytes=32 time=1ms TTL=64\nReply from 192.168.10.20: bytes=32 time<1ms TTL=64\n\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
      'ping 192.168.10.1': 'Pinging 192.168.10.1 with 32 bytes of data:\nReply from 192.168.10.1: bytes=32 time<1ms TTL=255\n\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
      'ping 192.168.1.1': 'Pinging 192.168.1.1 with 32 bytes of data:\nPING: transmit failed. General failure.\n\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)',
      'ping 8.8.8.8': 'Pinging 8.8.8.8 with 32 bytes of data:\nPING: transmit failed. General failure.\nPING: transmit failed. General failure.\n\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)',
      'route print': 'IPv4 Route Table\nNetwork Destination        Netmask          Gateway       Interface  Metric\n          0.0.0.0          0.0.0.0      192.168.1.1    192.168.10.45    281\n     192.168.10.0    255.255.255.0         On-link    192.168.10.45    281',
      'help': 'Available commands: help, ipconfig, ipconfig /all, route print, ping 192.168.10.20, ping 192.168.10.1, ping 192.168.1.1, ping 8.8.8.8, clear',
    },
  },
  {
    id: 'route',
    title: 'Two offices: pings go out but never come back',
    level: 'Intermediate',
    brief: 'R1 (office A, 192.168.1.0/24) and R2 (office B, 192.168.2.0/24) are joined by link 10.0.0.0/30 and use static routes. PCs in office A cannot reach office B.',
    objective: ['Check R1\'s route to office B.', 'Trace the path from office A.', 'Find the missing route and write the command that fixes it.'],
    hint: 'Routing must work in both directions. Look at R2\'s routing table, not only R1\'s.',
    solution: ['R1 has S 192.168.2.0/24 via 10.0.0.2, so requests reach R2 and office B.', 'R2 has only connected routes: there is no route back to 192.168.1.0/24, so replies are dropped.', 'On R2: ip route 192.168.1.0 255.255.255.0 10.0.0.1. Then ping again from office A.'],
    devices: ['R1', 'R2', 'PC-A'],
    topology: ['PC-A', 'R1', 'R2', 'PC-B'],
    quick: ['show ip route', 'tracert 192.168.2.10', 'ping 192.168.2.10'],
    outputs: {
      'R1|show ip route': 'Codes: C - connected, S - static\n\nC    10.0.0.0/30 is directly connected, Gi0/1\nC    192.168.1.0/24 is directly connected, Gi0/0\nS    192.168.2.0/24 [1/0] via 10.0.0.2',
      'R2|show ip route': 'Codes: C - connected, S - static\n\nC    10.0.0.0/30 is directly connected, Gi0/1\nC    192.168.2.0/24 is directly connected, Gi0/0\n\n(no other routes)',
      'PC-A|show ip route': 'Use route print on a Windows PC.',
      'PC-A|route print': 'IPv4 Route Table\n          0.0.0.0          0.0.0.0      192.168.1.1     192.168.1.10    281\n      192.168.1.0    255.255.255.0         On-link     192.168.1.10    281',
      'tracert 192.168.2.10': 'Tracing route to 192.168.2.10 over a maximum of 30 hops\n  1    <1 ms    <1 ms    <1 ms  192.168.1.1\n  2     *        *        *     Request timed out.\n  3     *        *        *     Request timed out.\n\n(the request reaches R2, but R2 has no route to send the reply back to 192.168.1.0/24)',
      'ping 192.168.2.10': 'Pinging 192.168.2.10 with 32 bytes of data:\nRequest timed out.\nRequest timed out.\n\nPackets: Sent = 4, Received = 0, Lost = 4 (100% loss)',
      'R1|ping 10.0.0.2': 'Sending 5, 100-byte ICMP Echos to 10.0.0.2:\n!!!!!\nSuccess rate is 100 percent (5/5)',
      'help': 'Available commands: help, show ip route (choose R1 or R2), route print (PC-A), tracert 192.168.2.10, ping 192.168.2.10, ping 10.0.0.2 (R1), clear',
    },
  },
];

export const labById = new Map(LABS.map((l) => [l.id, l]));

// Lessons that get a lab beside their questions.
export const LESSON_LABS: Record<string, string> = {
  'm7-vlan': 'vlan', 'm7-trunking': 'vlan', 'm11-vlan-problems': 'vlan', 'm12-configure-vlans': 'vlan',
  'm6-dhcp': 'dhcp', 'm10-dhcp-servers': 'dhcp', 'm12-configure-dhcp': 'dhcp', 'm4-static-and-dynamic-ip': 'dhcp',
  'm7-ospf': 'ospf', 'm13-advanced-ospf': 'ospf', 'm12-configure-ospf': 'ospf',
  'm6-dns': 'dns', 'm10-dns-servers': 'dns', 'm11-dns-issues': 'dns', 'm11-nslookup': 'dns',
  'm4-default-gateway': 'gateway', 'm11-connectivity-problems': 'gateway', 'm11-ping': 'gateway', 'm11-ipconfig': 'gateway',
  'm7-static-routing': 'route', 'm11-routing-problems': 'route', 'm12-configure-static-routing': 'route', 'm11-tracert': 'route', 'm11-route': 'route', 'm12-troubleshoot-network-topologies': 'route',
};

// Practice and interview questions that get a lab, matched by a phrase in the question.
const QUESTION_LABS: [RegExp, string][] = [
  [/169\.254|get no ip address|not getting an address|dhcp relay|ip helper|receive no ip/i, 'dhcp'],
  [/vlan 40 does not|same vlan on different switches|vlans allowed/i, 'vlan'],
  [/ospf routers.*(remain|not becoming)|not becoming neighbours|ospf neighbour|ospf parameter must match/i, 'ospf'],
  [/cannot open any website by name|ping 8\.8\.8\.8 but|confirm a problem is dns|names fail|hostnames fail/i, 'dns'],
  [/no default gateway|gateway 192\.168\.40\.1|internet is not working|cannot access the internet\. how/i, 'gateway'],
  [/never reply to site a|ping fails between two sites|return route/i, 'route'],
];

export function labForQuestion(text: string): string | undefined {
  for (const [re, id] of QUESTION_LABS) if (re.test(text)) return id;
  return undefined;
}
