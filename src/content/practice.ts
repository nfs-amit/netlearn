export type PQ =
  | { t: 'mcq'; kind: string; q: string; o: string[]; a: number; e: string }
  | { t: 'fill'; kind: string; q: string; a: string[]; e: string }
  | { t: 'match'; kind: string; q: string; l: string[]; r: string[]; e: string };

export type PracticeSet = { id: string; title: string; level: string; blurb: string; qs: PQ[] };

const mc = (kind: string, q: string, o: string[], a: number, e: string): PQ => ({ t: 'mcq', kind, q, o, a, e });
const tf = (q: string, a: boolean, e: string): PQ => ({ t: 'mcq', kind: 'True / False', q, o: ['True', 'False'], a: a ? 0 : 1, e });
const fill = (kind: string, q: string, a: string[], e: string): PQ => ({ t: 'fill', kind, q, a, e });
const match = (q: string, pairs: [string, string][], e: string): PQ => ({ t: 'match', kind: 'Match the following', q, l: pairs.map((p) => p[0]), r: pairs.map((p) => p[1]), e });

const foundationPracticeSets: PracticeSet[] = [
  { id: 'basics', title: 'Networking basics', level: 'Beginner', blurb: 'Multiple-choice questions on fundamentals, devices and models.', qs: [
    mc('Multiple choice', 'Which device forwards frames using MAC addresses?', ['Router', 'Switch', 'Hub', 'Modem'], 1, 'A switch is a Layer 2 device and uses its MAC address table.'),
    mc('Multiple choice', 'Which network type covers a single building?', ['WAN', 'MAN', 'LAN', 'PAN'], 2, 'A local area network covers a room, floor or building.'),
    mc('Multiple choice', 'What is the PDU at the Network layer?', ['Frame', 'Packet', 'Segment', 'Bit'], 1, 'Layer 3 carries packets; Layer 2 carries frames; TCP uses segments.'),
    mc('Multiple choice', 'Which protocol resolves an IPv4 address to a MAC address?', ['DNS', 'DHCP', 'ARP', 'ICMP'], 2, 'ARP broadcasts a request and the owner replies with its MAC.'),
    mc('Multiple choice', 'Which topology connects every device to a central switch?', ['Bus', 'Ring', 'Star', 'Mesh'], 2, 'Star topology.'),
    mc('Multiple choice', 'Which layer is responsible for end-to-end delivery between applications?', ['Network', 'Transport', 'Session', 'Data Link'], 1, 'The Transport layer uses port numbers and TCP or UDP.'),
    mc('Multiple choice', 'Which address is used to reach every device in a subnet?', ['Network address', 'Broadcast address', 'Loopback address', 'Gateway address'], 1, 'The broadcast address has all host bits set to 1.'),
    mc('Multiple choice', 'Which of these is a private IPv4 address?', ['11.0.0.1', '172.31.255.1', '192.169.1.1', '9.9.9.9'], 1, '172.16.0.0 to 172.31.255.255 is private.'),
  ] },
  { id: 'truefalse', title: 'True or false', level: 'Beginner', blurb: 'Quick statements to confirm or reject.', qs: [
    tf('A hub forwards frames only to the destination port.', false, 'A hub repeats signals to all ports. A switch forwards to one port.'),
    tf('UDP provides guaranteed delivery.', false, 'UDP has no acknowledgements or retransmission.'),
    tf('A router separates broadcast domains.', true, 'Routers do not forward broadcasts between networks.'),
    tf('IPv6 addresses are 128 bits long.', true, 'IPv6 uses 128-bit addresses written in hexadecimal.'),
    tf('The source and destination IP addresses change at every router hop.', false, 'MAC addresses change at each hop. IP addresses stay the same unless NAT is applied.'),
    tf('HTTPS uses TCP port 443 by default.', true, 'HTTP uses 80; HTTPS uses 443.'),
    tf('A /30 subnet has two usable host addresses.', true, '4 addresses in total, minus network and broadcast.'),
    tf('Telnet encrypts the session.', false, 'Telnet is clear text. SSH encrypts.'),
    tf('DNS can use both UDP and TCP on port 53.', true, 'UDP for most queries; TCP for large responses and zone transfers.'),
    tf('STP is used to prevent Layer 3 routing loops.', false, 'STP prevents Layer 2 switching loops.'),
  ] },
  { id: 'matchfill', title: 'Match and fill in', level: 'Beginner', blurb: 'Pair related items and complete the sentence.', qs: [
    match('Match each OSI layer to its data unit or example.', [['Transport', 'Segment'], ['Network', 'Packet'], ['Data Link', 'Frame'], ['Physical', 'Bits']], 'Segment (L4), packet (L3), frame (L2), bits (L1).'),
    match('Match each protocol to its default port.', [['SSH', '22'], ['DNS', '53'], ['HTTP', '80'], ['HTTPS', '443'], ['SMTP', '25']], 'SSH 22, DNS 53, HTTP 80, HTTPS 443, SMTP 25.'),
    match('Match each device to the layer where it mainly works.', [['Hub', 'Layer 1'], ['Switch', 'Layer 2'], ['Router', 'Layer 3']], 'Hub repeats bits, switch forwards frames, router forwards packets.'),
    match('Match each DHCP message to its sender.', [['Discover', 'Client (first message)'], ['Offer', 'Server (proposes an address)'], ['Acknowledge', 'Server (confirms the lease)']], 'Discover and Request come from the client; Offer and Acknowledge from the server.'),
    fill('Fill in the blank', 'The protocol that automatically assigns IP addresses to hosts is ____.', ['dhcp'], 'Dynamic Host Configuration Protocol.'),
    fill('Fill in the blank', 'The OSI model has ____ layers. (Type a number.)', ['7', 'seven'], 'Seven layers.'),
    fill('Fill in the blank', 'The TCP handshake consists of SYN, SYN-ACK and ____.', ['ack'], 'The final ACK completes the handshake.'),
    fill('Fill in the blank', 'The command used to test reachability with ICMP echo is ____.', ['ping'], 'ping sends Echo Request and waits for Echo Reply.'),
  ] },
  { id: 'subnetting', title: 'Subnetting calculations', level: 'Intermediate', blurb: 'Work each answer out on paper, then type it.', qs: [
    fill('Subnetting', 'How many usable hosts are in a /26 network?', ['62'], '6 host bits: 2^6 - 2 = 62.'),
    fill('Subnetting', 'What is the subnet mask for /27? (dotted decimal)', ['255.255.255.224'], '27 bits: 255.255.255.224.'),
    fill('Subnetting', 'What is the network address of 192.168.10.77/26?', ['192.168.10.64'], '/26 blocks start at 0, 64, 128, 192. 77 is in the 64 block.'),
    fill('Subnetting', 'What is the broadcast address of 192.168.10.64/26?', ['192.168.10.127'], 'Next network is .128, so the broadcast is .127.'),
    fill('Subnetting', 'What is the first usable host of 10.0.5.32/28?', ['10.0.5.33'], 'Network address plus one.'),
    fill('Subnetting', 'What is the last usable host of 10.0.5.32/28?', ['10.0.5.46'], 'Block size 16: broadcast is .47, last host is .46.'),
    fill('Subnetting', 'Which prefix length gives exactly 2 usable hosts? (for example /24)', ['/30', '30'], '/30 has 4 addresses, 2 usable.'),
    fill('Subnetting', 'What is the network address of 172.16.45.200/20?', ['172.16.32.0'], 'Block size 16 in the third octet; 45 falls in the 32 block.'),
    fill('Subnetting', 'How many /28 subnets fit in one /24? (Type a number.)', ['16'], '4 borrowed bits: 2^4 = 16.'),
    fill('Subnetting', 'Summarise 192.168.0.0/24 to 192.168.3.0/24 as one prefix.', ['192.168.0.0/22'], 'Four /24 networks from 0 to 3 share the first 22 bits.'),
  ] },
  { id: 'commands', title: 'Command identification', level: 'Intermediate', blurb: 'Pick the right command for the job.', qs: [
    mc('Command', 'Which Windows command shows the IP address, mask, gateway, DNS servers and MAC address?', ['ping', 'ipconfig /all', 'tracert', 'netstat'], 1, 'ipconfig /all prints full adapter details.'),
    mc('Command', 'Which command shows the path packets take to a destination on Linux?', ['traceroute', 'nslookup', 'arp', 'ss'], 0, 'traceroute (tracert on Windows).'),
    mc('Command', 'Which command queries DNS for a name?', ['route', 'nslookup', 'ping -t', 'arp -a'], 1, 'nslookup (and dig) query DNS servers.'),
    mc('Command', 'Which command displays the ARP cache?', ['arp -a', 'ip route', 'dig', 'curl'], 0, 'arp -a lists IP-to-MAC mappings.'),
    mc('Command', 'Which Linux command lists listening TCP and UDP sockets?', ['ss -tuln', 'ifconfig', 'pathping', 'dig'], 0, 'ss -tuln: TCP, UDP, listening, numeric.'),
    mc('Command', 'Which Windows command combines ping and tracert and reports loss per hop?', ['netstat', 'pathping', 'route print', 'ipconfig'], 1, 'pathping.'),
    mc('Command', 'Which command fetches only the HTTP response headers of a URL?', ['curl -I', 'ping', 'arp', 'ip addr'], 0, 'curl -I sends a HEAD request and prints the headers.'),
    mc('Command', 'Which Cisco command shows interfaces with their IP address and status in one table?', ['show vlan brief', 'show ip interface brief', 'show version', 'show ip route'], 1, 'show ip interface brief.'),
    mc('Command', 'Which command shows the routing table on Linux?', ['ip route', 'ip link', 'ss', 'dig'], 0, 'ip route (route print on Windows).'),
  ] },
  { id: 'devices', title: 'Device identification', level: 'Beginner', blurb: 'Read the description and name the device.', qs: [
    mc('Device', 'It connects different IP networks and chooses paths using a routing table.', ['Switch', 'Router', 'Repeater', 'Access point'], 1, 'Router.'),
    mc('Device', 'It regenerates a weak signal so that it can travel further and has only two ports.', ['Repeater', 'Bridge', 'Firewall', 'Gateway'], 0, 'Repeater, a Layer 1 device.'),
    mc('Device', 'It lets Wi-Fi clients join a wired LAN.', ['Modem', 'Access point', 'Hub', 'Load balancer'], 1, 'Access point.'),
    mc('Device', 'It allows or denies traffic according to rules and tracks connection state.', ['Firewall', 'Switch', 'NIC', 'Repeater'], 0, 'A stateful firewall.'),
    mc('Device', 'It spreads incoming requests across several servers and checks their health.', ['Router', 'Proxy', 'Load balancer', 'Bridge'], 2, 'Load balancer.'),
    mc('Device', 'It converts between the signalling of the ISP line and your local Ethernet.', ['Modem', 'Hub', 'Switch', 'Firewall'], 0, 'Modem (or ONT on fibre).'),
    mc('Device', 'It is the hardware inside a PC that has a MAC address and connects to the medium.', ['NIC', 'Gateway', 'Bridge', 'AP'], 0, 'Network interface card.'),
    mc('Device', 'It repeats every incoming signal to all other ports and creates one collision domain.', ['Switch', 'Hub', 'Router', 'Bridge'], 1, 'Hub.'),
  ] },
  { id: 'scenarios', title: 'Troubleshooting scenarios', level: 'Advanced', blurb: 'Realistic situations. Choose the most likely cause or the best next step.', qs: [
    mc('Scenario', 'A PC has the address 169.254.23.9 and cannot reach anything. What is the most likely cause?', ['DNS server is down', 'The PC could not reach a DHCP server', 'The default gateway is wrong', 'A firewall is blocking port 80'], 1, '169.254.0.0/16 is self-assigned (APIPA) when DHCP fails. Check the cable, VLAN and DHCP server.'),
    mc('Scenario', 'A user can ping 8.8.8.8 but cannot open any website by name. What do you check first?', ['Switch port speed', 'DNS settings', 'Subnet mask', 'STP state'], 1, 'IP connectivity works, so name resolution is the suspect.'),
    mc('Scenario', 'Two PCs on the same switch, in the same subnet, cannot ping each other. Both can ping nothing else either. One port shows VLAN 10 and the other VLAN 20. What is the fix?', ['Add a static route', 'Place both ports in the same VLAN', 'Restart DNS', 'Change the MAC address'], 1, 'Same subnet but different VLANs means separate broadcast domains. Put the ports in the same VLAN.'),
    mc('Scenario', 'Site A can ping the router at site B, but hosts at site B never reply to site A hosts. Routes at site A are correct. What is likely missing?', ['A return route at site B', 'A DNS record', 'A DHCP reservation', 'An NTP server'], 0, 'One-way routing: the reply has no route back.'),
    mc('Scenario', 'After a new switch is connected with two cables to the existing switch, the whole LAN becomes extremely slow and switch LEDs flash constantly. What happened?', ['DHCP pool exhausted', 'A Layer 2 loop caused a broadcast storm', 'DNS cache poisoning', 'IP conflict'], 1, 'Redundant links without working STP create a loop. Remove one cable or enable STP.'),
    mc('Scenario', 'An interface shows many CRC errors and the link runs at 100 Mbps half-duplex although both devices support 1 Gbps. What do you do first?', ['Change the IP address', 'Replace or re-terminate the cable and check speed/duplex settings', 'Reboot the DNS server', 'Add a VLAN'], 1, 'CRC errors and a low negotiated speed point to cabling or a duplex mismatch.'),
    mc('Scenario', 'Users in VLAN 30 get no IP address. The DHCP server is in VLAN 10 and works for VLAN 10 users. What is missing?', ['A trunk native VLAN', 'DHCP relay (ip helper-address) on the VLAN 30 gateway', 'A DNS forwarder', 'Port security'], 1, 'DHCP broadcasts do not cross routers. The gateway must relay them.'),
    mc('Scenario', 'A website works from the office but customers outside report certificate warnings since this morning. What is the most likely cause?', ['Expired TLS certificate', 'Wrong subnet mask', 'STP reconvergence', 'ARP cache timeout'], 0, 'Certificates have a validity period. Check the expiry date and renew.'),
  ] },
  { id: 'protocols', title: 'Protocols and ports', level: 'Intermediate', blurb: 'Mixed question types on protocols.', qs: [
    mc('Multiple choice', 'Which protocol does HTTP/3 run on?', ['TCP', 'QUIC over UDP', 'SCTP', 'ICMP'], 1, 'HTTP/3 uses QUIC, which runs over UDP.'),
    mc('Multiple choice', 'Which protocol sends email between mail servers?', ['IMAP', 'POP3', 'SMTP', 'SNMP'], 2, 'SMTP on port 25.'),
    match('Match each protocol to what it does.', [['NTP', 'Synchronises clocks'], ['SNMP', 'Monitors devices'], ['ICMP', 'Reports errors and tests reachability'], ['DHCP', 'Assigns IP settings']], 'NTP time, SNMP monitoring, ICMP diagnostics, DHCP addressing.'),
    match('Match each routing protocol to its type.', [['RIP', 'Distance vector'], ['OSPF', 'Link state'], ['BGP', 'Path vector']], 'RIP distance vector, OSPF link state, BGP path vector.'),
    fill('Fill in the blank', 'BGP runs over TCP port ____.', ['179'], 'TCP 179.'),
    fill('Fill in the blank', 'The maximum hop count of RIP is ____.', ['15'], '16 means unreachable.'),
    mc('Multiple choice', 'Which Wi-Fi security standard introduced SAE?', ['WEP', 'WPA', 'WPA2', 'WPA3'], 3, 'WPA3-Personal uses Simultaneous Authentication of Equals.'),
    mc('Multiple choice', 'Which ICMP message does traceroute rely on from intermediate routers?', ['Echo Reply', 'Time Exceeded', 'Redirect', 'Timestamp'], 1, 'Time Exceeded (type 11) when TTL reaches 0.'),
  ] },
];

const advancedPracticeSets: PracticeSet[] = [
  { id: 'subnet-design-lab', title: 'Subnetting & IP design lab', level: 'Advanced', blurb: 'Plan address space for departments, point-to-point links and growth. Includes design decisions and CIDR calculations.', qs: [
    mc('Network design', 'A company needs at least 50 usable IPv4 addresses in one subnet. Which is the smallest suitable prefix?', ['/27', '/26', '/28', '/29'], 1, '/26 provides 64 total addresses and normally 62 usable host addresses. /27 provides only 30 usable addresses.'),
    mc('Subnetting', 'You must divide 10.20.0.0/16 into at least 100 equal-sized subnets. Which prefix is the smallest that meets the requirement?', ['/22', '/23', '/24', '/25'], 2, 'Borrow 7 bits to create 128 subnets. /16 plus 8 bits gives /24 and 256 equal-sized subnets.'),
    mc('Subnetting', 'What is the broadcast address for 192.168.14.64/27?', ['192.168.14.95', '192.168.14.96', '192.168.14.79', '192.168.14.127'], 0, '/27 has blocks of 32. The .64 block spans .64–.95, so .95 is broadcast.'),
    mc('Network design', 'A branch has 3 departments requiring 100, 45 and 20 hosts. Which design is most address-efficient?', ['Give every department a /24', 'Use VLSM with /25, /26 and /27', 'Put all devices in one /24', 'Use /30 for each department'], 1, 'VLSM allocates different subnet sizes: /25 gives 126 usable, /26 gives 62, and /27 gives 30.'),
    mc('Subnetting', 'A router has 172.20.8.1/21. Which address is the network address?', ['172.20.8.0', '172.20.0.0', '172.20.8.1', '172.20.15.255'], 0, '/21 uses a block size of 8 in the third octet. The third octet 8 begins the 8–15 range.'),
    mc('Routing design', 'Two routers are connected by a point-to-point IPv4 link. Which prefix is commonly used when conserving addresses and both ends support it?', ['/24', '/29', '/31', '/16'], 2, 'RFC 3021 permits /31 on point-to-point links, using both addresses as endpoint addresses.'),
    mc('Troubleshooting', 'A host is configured as 192.168.40.130/25 with gateway 192.168.40.1. What is the likely issue?', ['The host and gateway are in different /25 subnets', 'The DNS server must be changed', 'The host address is the network address', 'The mask is equivalent to /24'], 0, '192.168.40.130/25 belongs to 192.168.40.128/25, while 192.168.40.1 belongs to 192.168.40.0/25. The gateway is off-subnet.'),
    fill('Subnetting', 'How many usable host addresses are available in a conventional IPv4 /27 subnet?', ['30'], 'A /27 leaves 5 host bits: 2^5 = 32 total addresses. Subtract network and broadcast: 30 usable.'),
    fill('Subnetting', 'Write the wildcard mask for 255.255.255.240.', ['0.0.0.15'], 'A wildcard mask is the inverse of the subnet mask: 0.0.0.15.'),
  ] },
  { id: 'switching-vlan-lab', title: 'Switching, VLANs & STP lab', level: 'Advanced', blurb: 'Solve campus-LAN design and Layer 2 incidents involving trunks, spanning tree, EtherChannel and port security.', qs: [
    mc('Scenario', 'A switch port connects to a PC that should belong to VLAN 20 only. Which port mode is normally appropriate?', ['Access', 'Trunk', 'Routed', 'Dynamic desirable'], 0, 'An access port carries one data VLAN for an end device. A trunk carries multiple VLANs between network devices.'),
    mc('Scenario', 'Two switches are connected by a trunk. VLAN 30 works across it, but VLAN 40 does not. What should you verify first?', ['Whether VLAN 40 is allowed on the trunk', 'Whether the DNS TTL is low', 'Whether the access point uses WPA3', 'Whether the WAN has a default route'], 0, 'Check the trunk allowed-VLAN list at both ends and confirm VLAN 40 exists and is active.'),
    mc('Scenario', 'A Layer 2 loop appears after a redundant switch link is added. Which technology should prevent the loop while retaining redundancy?', ['STP/RSTP', 'DHCP snooping', 'NAT', 'OSPF'], 0, 'Spanning Tree Protocol blocks selected redundant Layer 2 paths and recalculates when topology changes.'),
    mc('Switching', 'What is the main purpose of an EtherChannel?', ['Bundle physical links into one logical link', 'Encrypt Ethernet frames', 'Assign IP addresses to clients', 'Replace the default gateway'], 0, 'Link aggregation increases available bandwidth and provides link redundancy while STP sees a logical link.'),
    mc('Scenario', 'Users report intermittent connectivity after a switch port security violation. The port status indicates it was shut down. What is the correct operational response?', ['Investigate the unexpected MAC/device, then recover the port according to policy', 'Disable all switch security permanently', 'Change the DNS zone', 'Increase the DHCP lease time'], 0, 'A violation may indicate an unauthorised device or a legitimate device change. Verify the MAC and policy before restoring service.'),
    mc('Switching', 'Which statement about a native VLAN on an 802.1Q trunk is correct?', ['Frames in the native VLAN are sent untagged by default', 'Every frame is always double-tagged', 'It is the same thing as the management IP', 'It disables STP'], 0, 'The native VLAN carries untagged frames by default. Configure matching native VLANs and avoid using the default VLAN where policy recommends otherwise.'),
    mc('Troubleshooting', 'A switch learns the same source MAC address alternately on two ports many times per second. What should you suspect?', ['A Layer 2 loop or a device connected through multiple paths', 'An expired DNS record', 'A missing default route only', 'An incorrect NTP timezone'], 0, 'MAC flapping often points to a Layer 2 loop, miswiring, or an unexpected multi-homed device. Trace the MAC and inspect topology.'),
    mc('Design', 'Why should voice traffic often use a dedicated voice VLAN?', ['To separate voice traffic and apply suitable QoS and policy', 'To make phones use public IP addresses', 'To remove the need for DHCP', 'To prevent all routing'], 0, 'A voice VLAN separates phone traffic for policy, management and quality-of-service treatment.'),
    mc('Troubleshooting', 'A trunk is up, but one side uses native VLAN 10 and the other uses native VLAN 99. What risk does this create?', ['Native VLAN mismatch and possible traffic leakage or spanning-tree inconsistencies', 'Automatic encryption', 'Faster DNS resolution', 'A /31 address conflict'], 0, 'Native VLANs should match on both ends. A mismatch can cause untagged traffic to be placed into different VLANs.'),
  ] },
  { id: 'routing-ospf-bgp-lab', title: 'Routing, OSPF & BGP challenges', level: 'Advanced', blurb: 'Interpret routing tables, choose next hops and troubleshoot dynamic routing and path selection.', qs: [
    mc('Routing', 'A router has routes for 10.0.0.0/8 and 10.10.10.0/24. A packet is destined for 10.10.10.25. Which route is selected?', ['10.0.0.0/8', '10.10.10.0/24', 'The route with the lower network address', 'Both routes equally'], 1, 'Routers use longest-prefix match. /24 is more specific than /8.'),
    mc('OSPF', 'Two OSPF routers on an Ethernet segment remain in INIT state. What does this commonly indicate?', ['Hello packets are received one-way, but the neighbour relationship is not bidirectional', 'The BGP AS numbers match', 'The DNS server is unavailable', 'The interface has no MAC address'], 0, 'INIT means a Hello was seen, but the local router has not been seen in the neighbour’s Hello. Check multicast, ACLs and one-way reachability.'),
    mc('OSPF', 'Which OSPF parameter must match between neighbours on the same link for adjacency to form?', ['Area ID', 'Hostname', 'SNMP community', 'DNS search suffix'], 0, 'Area ID must match, along with key interface/network parameters such as timers, authentication and subnet compatibility.'),
    mc('BGP', 'What is the primary purpose of the BGP AS_PATH attribute?', ['Record autonomous systems a route has traversed and help prevent loops', 'Encrypt BGP updates', 'Assign VLAN IDs', 'Measure Wi-Fi signal strength'], 0, 'AS_PATH records AS numbers along the route; a router rejects a path containing its own AS to prevent loops.'),
    mc('Routing', 'A router has a static route and an OSPF route to the same prefix. Which route is normally preferred on Cisco IOS when the static route has default administrative distance?', ['Static route', 'OSPF route', 'Both always load-balance', 'Neither route'], 0, 'A standard static route has administrative distance 1; OSPF has 110. Lower administrative distance is preferred.'),
    mc('Scenario', 'After a WAN circuit fails, the routing table still points to the failed next hop because the static route remains installed. What design can improve failover?', ['Use tracked static routes or a dynamic routing protocol with failure detection', 'Increase DNS cache duration', 'Disable ICMP everywhere', 'Move users to another VLAN only'], 0, 'IP SLA/object tracking or a dynamic routing protocol can withdraw or replace routes when reachability fails.'),
    mc('Routing', 'What does a default route represent?', ['A route used when no more-specific route matches', 'A route only for multicast', 'A route to the local loopback', 'A route that overrides every specific route'], 0, 'The IPv4 default route is 0.0.0.0/0. It is the least-specific route and is used only when no better match exists.'),
    mc('Troubleshooting', 'A traceroute reaches the destination, but one intermediate hop displays asterisks. What is a reasonable interpretation?', ['That hop may be filtering or rate-limiting TTL-expired replies; forwarding may still work', 'The destination is definitely compromised', 'The route cannot exist', 'The source IP must be private'], 0, 'Some routers do not answer traceroute probes or rate-limit ICMP. Missing hop responses alone do not prove packet forwarding is broken.'),
    fill('Routing', 'What is the IPv4 prefix length of the default route?', ['0'], 'The IPv4 default route is 0.0.0.0/0.'),
  ] },
  { id: 'noc-real-world', title: 'NOC engineer: real-world incident desk', level: 'Advanced', blurb: 'Work through realistic NOC tickets: outage triage, evidence gathering, escalation, monitoring and clear customer updates.', qs: [
    mc('Incident triage', 'A monitoring alert reports that a branch router is unreachable. What is the best first action?', ['Check alert scope and monitoring evidence, then test reachability from an independent point', 'Immediately factory-reset the router', 'Close the ticket as false positive', 'Change every user password'], 0, 'Validate the alert and scope before making changes. Check multiple probes, site impact and last-known status.'),
    mc('Incident triage', 'A customer reports “the internet is slow.” Which question gives the most useful initial scope?', ['Is it affecting one device, one application, one VLAN or the whole site, and when did it start?', 'What colour is the router?', 'Can you reinstall the operating system?', 'Can you change your email signature?'], 0, 'Good triage identifies affected users/services, location, start time, recent changes and whether the issue is intermittent.'),
    mc('Troubleshooting', 'CPU on a firewall rises to 95% at the same time traffic increases sharply. What should you investigate?', ['Traffic volume, session count, top talkers and security/event logs', 'Only the monitor resolution', 'The DHCP lease duration first', 'The printer toner level'], 0, 'Correlate resource usage with traffic and session patterns. Look for legitimate peaks, loops, scans or denial-of-service indicators.'),
    mc('Monitoring', 'An interface has 0% packet loss but latency jumps from 15 ms to 450 ms during business hours. What is the most useful next check?', ['Compare link utilisation, queue drops, interface errors and path latency during the same period', 'Replace all endpoint keyboards', 'Delete the routing table', 'Disable monitoring'], 0, 'High latency with no loss can be caused by congestion, queueing, shaping or path changes. Correlate interface and path metrics.'),
    mc('Change management', 'A planned router change causes a wider outage. What should the engineer do first?', ['Follow the rollback/escalation plan, communicate impact and preserve evidence', 'Continue making unrelated changes', 'Delete the change record', 'Wait silently until users call'], 0, 'Use the approved rollback criteria, incident process and communications channel. Record timestamps and actions.'),
    mc('Incident response', 'Several endpoints suddenly make DNS requests to an unfamiliar external resolver. What is the safest first response?', ['Validate the change against approved configuration and security telemetry; escalate if unauthorised', 'Assume it is harmless and ignore it', 'Publish the resolver address publicly', 'Disable all DNS permanently'], 0, 'Unexpected DNS configuration can indicate rogue DHCP, endpoint changes or malicious activity. Verify evidence and follow security escalation procedures.'),
    mc('Service desk', 'A link is down and the carrier asks for evidence. Which information is most useful?', ['Circuit ID, timestamps, interface status/errors, test results and affected sites', 'Only the employee names', 'A screenshot of the desktop wallpaper', 'The office Wi-Fi password'], 0, 'A concise carrier ticket includes circuit identifiers, outage start, local interface state, light/LOS where applicable, tests and business impact.'),
    mc('Documentation', 'Why should a NOC handover include current impact, actions taken, results and next steps?', ['So the next shift can continue safely without repeating work or missing risk', 'To make tickets longer', 'To avoid recording timestamps', 'Because monitoring tools require prose'], 0, 'A structured handover preserves operational context, ownership, pending actions and escalation status.'),
    mc('Troubleshooting', 'A site is reachable by IP but internal hostnames fail only for users on the guest Wi-Fi. What should you compare?', ['Guest VLAN DNS settings, DHCP options and DNS/firewall policy against the working VLAN', 'The office chair height', 'The WAN MTU only', 'The switch hostname only'], 0, 'Because IP reachability works and only one VLAN has name-resolution failure, compare DNS assignment and policy for that VLAN.'),
  ] },
  { id: 'network-security-cloud', title: 'Network security & hybrid cloud scenarios', level: 'Advanced', blurb: 'Apply segmentation, firewall policy, VPN, secure management, cloud connectivity and incident-response fundamentals.', qs: [
    mc('Security design', 'A finance team must be isolated from guest devices while still accessing an approved application. What is the best baseline design?', ['Separate VLANs/subnets with firewall rules allowing only required application flows', 'Put both groups in one flat LAN', 'Use a hub instead of a switch', 'Disable all logging'], 0, 'Segmentation limits lateral movement. Enforce least privilege with explicit source, destination, protocol and port rules.'),
    mc('Firewall', 'A stateful firewall permits outbound HTTPS. Return packets for the established session are normally handled how?', ['By connection state, without needing a separate broad inbound allow rule', 'By opening every inbound port', 'By changing the client MAC address', 'By disabling TCP'], 0, 'A stateful firewall tracks connection state and permits valid return traffic for an allowed session, subject to policy.'),
    mc('VPN', 'A site-to-site IPsec VPN is up, but hosts cannot communicate. What should you verify first?', ['Phase 2 traffic selectors/proxy IDs, routes and firewall policies at both ends', 'The monitor refresh rate', 'The public DNS TTL only', 'The switch LED colour'], 0, 'An established tunnel does not guarantee correct protected subnets or routing. Compare selectors, routes, NAT exemption and security policy.'),
    mc('Cloud networking', 'A virtual machine in a private cloud subnet needs outbound software updates without accepting unsolicited inbound internet connections. Which pattern is appropriate?', ['NAT gateway or controlled egress proxy', 'Public IP on every VM with all ports open', 'Disable the route table', 'Use a Layer 2 hub'], 0, 'A NAT gateway enables outbound-initiated connectivity while avoiding direct unsolicited inbound access to private instances.'),
    mc('Security', 'Which management practice most reduces risk when administering switches and routers?', ['Use SSH/HTTPS, individual accounts, MFA where supported, least privilege and central logging', 'Use Telnet with a shared password', 'Expose management interfaces to the whole internet', 'Disable configuration backups'], 0, 'Secure management uses encrypted protocols, strong identity controls, restricted management networks and audit logs.'),
    mc('Cloud connectivity', 'A cloud subnet route table sends 0.0.0.0/0 to an internet gateway, but the VM has no public address. Why may it still lack direct internet access?', ['A public route alone does not provide a public source address or required security rules', 'DNS always blocks cloud VMs', 'An internet gateway assigns a private IP', 'The subnet mask becomes /32'], 0, 'Direct internet connectivity generally requires a public address/translation path and permitted network/security rules.'),
    mc('Incident response', 'A firewall log shows repeated denied connections from one internal host to many unusual destinations. What should you do?', ['Preserve logs, identify the host and owner, check endpoint/security telemetry and follow incident escalation', 'Delete the logs immediately', 'Allow all destinations to stop alerts', 'Ignore it because the source is internal'], 0, 'Internal sources can be compromised. Preserve evidence, validate scope and coordinate containment through the incident process.'),
    mc('Resilience', 'A business-critical application is reachable through one ISP only. What is the most direct network availability improvement?', ['Add a diverse secondary circuit and test routing/failover', 'Increase the DNS record length', 'Move the application to a different VLAN only', 'Disable interface monitoring'], 0, 'A second diverse path reduces single-circuit dependency. Verify physical diversity, routing policy, failover time and return-path behaviour.'),
    mc('Security architecture', 'What is the principle of least privilege in firewall design?', ['Permit only the minimum required traffic between defined sources and destinations', 'Allow all traffic by default', 'Use one shared rule for every department', 'Disable rule reviews'], 0, 'Least privilege reduces attack surface. Document owners, purpose, expiry/review and log important denies.'),
  ] },
];



/** "Put these steps in order": shown as a matching question whose answers are Step 1, Step 2, ... */
function order(q: string, steps: string[], e: string): PQ {
  const n = steps.length;
  // Seeded shuffle (same order every visit) that is neither the correct order nor simply reversed.
  let seed = 0;
  for (const ch of q) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let idx = steps.map((_, i) => i);
  for (let tries = 0; tries < 50; tries++) {
    idx = steps.map((_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const same = idx.every((v, i) => v === i), rev = idx.every((v, i) => v === n - 1 - i);
    const fixed = idx.filter((v, i) => v === i).length;
    if (!same && !(rev && n > 3) && fixed <= Math.floor((n - 1) / 2)) break;
  }
  return { t: 'match', kind: 'Put in order', q, l: idx.map((i) => steps[i]), r: idx.map((i) => 'Step ' + (i + 1)), e };
}

const howItWorksSets: PracticeSet[] = [
  { id: 'how-web-page', title: 'How it works: loading a web page', level: 'Intermediate', blurb: 'Follow one click from the browser to the server and back. Put steps in order and explain why each one is needed.', qs: [
    order('Put these steps in the order they happen when you open https://www.example.com for the first time.', ['The browser asks the DNS resolver for the IP address of www.example.com', 'The PC uses ARP to find its default gateway\'s MAC address', 'TCP three-way handshake with the server on port 443', 'TLS handshake: certificate checked and session keys agreed', 'The browser sends an encrypted HTTP GET request'], 'Name first, then local delivery to the gateway, then the TCP connection, then TLS, then the HTTP request inside it. (The ARP step may happen before or during DNS if the resolver is remote; it is always needed before the first packet leaves the LAN.)'),
    mc('How it works', 'Why does the PC send the DNS query to its default gateway\'s MAC address when the DNS server is on the internet?', ['The gateway is the DNS server', 'Frames are delivered only on the local link; remote IP destinations are reached through the gateway', 'DNS uses broadcast', 'The switch requires it'], 1, 'The IP destination stays the DNS server; the frame goes to the next hop on the LAN, the gateway.'),
    order('Put the TCP three-way handshake in order.', ['Client sends SYN', 'Server replies SYN-ACK', 'Client sends ACK'], 'SYN, SYN-ACK, ACK. After this, data can flow in both directions.'),
    mc('How it works', 'In HTTPS, what does the browser check in the server\'s certificate?', ['Its MAC address', 'That a trusted authority signed it, it is in date and it matches the site name', 'Its TTL', 'Its port number'], 1, 'If any of these fail, the browser shows a warning.'),
    mc('How it works', 'A packet crosses three routers to reach the server. What changes at every router?', ['Source and destination IP', 'Source and destination MAC and the TTL', 'TCP port numbers', 'Nothing'], 1, 'Each router builds a new frame for the next link and lowers the TTL. IPs stay the same unless NAT is used.'),
    order('Put the HTTP exchange in order after the connection is ready.', ['Browser sends GET /index.html with a Host header', 'Server finds the resource', 'Server sends status 200 OK with the page', 'Browser requests the images and styles the page refers to'], 'The page is fetched first; the browser then discovers and requests the extra files.'),
    fill('Fill in the blank', 'HTTPS normally uses TCP port ____.', ['443'], 'HTTP uses 80, HTTPS uses 443.'),
    mc('How it works', 'The second time you open the same site a minute later, which step is usually skipped?', ['TCP handshake', 'The DNS query to the resolver, because the answer is cached', 'TLS', 'HTTP GET'], 1, 'The answer is cached for its TTL in the browser and operating system.'),
  ] },
  { id: 'how-lan', title: 'How it works: inside the LAN', level: 'Beginner', blurb: 'What happens inside a switch and between PCs: MAC learning, ARP, DHCP and loop prevention.', qs: [
    order('A new PC joins the network with DHCP. Put the messages in order.', ['Discover (broadcast from the client)', 'Offer (from the server)', 'Request (from the client)', 'Acknowledge (from the server)'], 'DORA: Discover, Offer, Request, Acknowledge.'),
    order('PC A pings PC B on the same switch for the first time. Put the steps in order.', ['PC A broadcasts an ARP request for PC B\'s IP address', 'The switch floods the broadcast to all other ports in the VLAN', 'PC B sends an ARP reply directly to PC A', 'PC A sends the ICMP Echo Request to PC B\'s MAC address'], 'ARP must finish before the ping can be addressed at Layer 2.'),
    order('A switch receives a frame. Put its decisions in order.', ['Record the source MAC address against the incoming port', 'Look up the destination MAC address in the table', 'If found, forward out of that one port; if not, flood'], 'Learn from the source first, then forward by the destination.'),
    mc('How it works', 'Why does the switch flood the first frame to an unknown destination?', ['To test the cable', 'It has not yet learned which port the destination is on', 'Flooding is faster', 'To update DHCP'], 1, 'Once the destination replies, the switch learns its port and stops flooding.'),
    order('Put the Spanning Tree decisions in order.', ['Elect the root bridge (lowest bridge ID)', 'Each other switch picks its root port (lowest cost to the root)', 'Each segment picks one designated port', 'All remaining ports are blocked'], 'Root first, then root ports, then designated ports, then blocking.'),
    mc('How it works', 'Why can a DHCP client not simply send a unicast to the server?', ['DHCP has no port number', 'It does not yet have an IP address or know the server\'s address', 'Unicast is blocked by switches', 'Servers only listen to broadcasts for security'], 1, 'With no address and no knowledge of the server, broadcast is the only option.'),
    tf('A switch uses IP addresses to decide which port to forward a frame to.', false, 'A Layer 2 switch uses MAC addresses.'),
    fill('Fill in the blank', 'The broadcast MAC address is FF:FF:FF:FF:FF:____.', ['ff'], 'All 48 bits set to 1.'),
  ] },
  { id: 'how-routing', title: 'How it works: routing, NAT and troubleshooting', level: 'Intermediate', blurb: 'Step through what routers do with each packet, how NAT rewrites it, how OSPF forms neighbours and how traceroute works.', qs: [
    order('A router receives a packet. Put its actions in order.', ['Check the frame and remove the Layer 2 header', 'Look up the destination IP using longest prefix match', 'Lower the TTL by one', 'Build a new frame for the outgoing link and send it'], 'Decapsulate, decide, update TTL, re-encapsulate.'),
    order('Put the OSPF neighbour states in order from first to last.', ['Down', 'Init', '2-Way', 'ExStart', 'Exchange', 'Loading', 'Full'], 'Full means the link-state databases are synchronised.'),
    order('A PC behind a PAT router opens a web page. Put the NAT steps in order.', ['The PC sends a packet from 192.168.1.10:51000', 'The router rewrites the source to its public address and a free port, and records the mapping', 'The server replies to the public address and port', 'The router looks up the mapping and restores 192.168.1.10:51000'], 'The table entry created on the way out is what makes the reply deliverable.'),
    order('Put traceroute\'s method in order.', ['Send a probe with TTL 1', 'The first router drops it and returns ICMP Time Exceeded', 'Send the next probe with TTL 2', 'Repeat until the destination itself replies'], 'Each Time Exceeded reveals one more hop.'),
    mc('How it works', 'A router has routes 10.0.0.0/8, 10.1.0.0/16 and 10.1.2.0/24. Which one does it use for 10.1.2.7?', ['10.0.0.0/8', '10.1.0.0/16', '10.1.2.0/24', 'The first one configured'], 2, 'Longest prefix match: /24 is the most specific.'),
    mc('How it works', 'Why does a ping fail when only one of two routers has a static route to the other side?', ['ICMP needs OSPF', 'The reply has no route back', 'Static routes block ICMP', 'The TTL is too low'], 1, 'Routing must work in both directions.'),
    order('Troubleshooting order for "the internet is not working" on one PC.', ['Check the link and the IP configuration (ipconfig)', 'Ping the default gateway', 'Ping a public IP address such as 8.8.8.8', 'Resolve a name (nslookup) and test the website'], 'Move outwards one layer and one hop at a time; the first failure shows where to look.'),
    fill('Fill in the blank', 'The OSPF Hello multicast address is 224.0.0.____.', ['5'], '224.0.0.5 is AllSPFRouters; 224.0.0.6 is AllDRRouters.'),
  ] },
];

export const practiceSets: PracticeSet[] = [...foundationPracticeSets, ...howItWorksSets, ...advancedPracticeSets];
