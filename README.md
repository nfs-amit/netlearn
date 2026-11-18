# NetLearn – Free Computer Networking Academy

Networking Knowledge for Everyone. Learn Without Limits.

A static, free learning site: 14 modules, 156 lessons, 42 animated diagrams, 8 practice sets,
209 interview questions and 8 browser tools. No login, no backend, no database, no paid service.

## Run it

```
npm install
npm run dev        # local development
npm run build      # production build in dist/
```

The `dist/` folder is a ready-built copy of the current site, including the new lessons and the virtual labs. You can upload it to any static host as it is, or rebuild it with `npm run build`.

Stack: React 19, TypeScript, Vite, plain CSS, inline SVG. Animations are SVG plus CSS transitions.
Motion for React, Lucide and Tailwind are not used; the site has no runtime dependency other than React.

## Project structure

```
src/
  config.ts              site name, tagline, optional contact email
  store.ts               progress, bookmarks and theme in localStorage
  ipmath.ts              IPv4 calculations for the tools
  content/
    m01_03.ts … m13_14.ts  lessons, written with the L(...) helper
    scenes.ts              animation scenes (nodes, links, steps)
    practice.ts            practice sets
    interview.ts           curated interview questions
    reference.ts           ports, OSI layers, commands
    index.ts               module list (add new modules here)
  components/            SceneAnimation, Runner (quizzes), small UI parts
  pages/                 Home, Learn, Practice, Tools, Info
```

### Add a lesson

Open the module file and add one `L(...)` entry: title, scene id, introduction, what, why,
steps, real-world example, terms ("Term: definition"), advantages, limitations, practical example,
one interview question and one quiz question. The lesson page, search, module quiz and interview
bank pick it up automatically.

### Add an animation

Add a scene to `content/scenes.ts`: nodes with x/y positions on a 640 x 270 canvas, links, and steps
(`m` moves a labelled unit, `h` highlights nodes, `x` shows a dropped unit). Use its id in a lesson.

## Deploying for free

The site is plain static files and uses hash URLs (`#courses`), so it needs no server rewrites.

- **GitHub Pages**: push the repository, then publish `dist/` (for example with a Pages workflow or a `gh-pages` branch).
- **Cloudflare Pages**: build command `npm run build`, output directory `dist`.
- **Vercel (Hobby)**: import the repository; it detects Vite.

Free tiers have limits, and providers change them. Before launch, read the current limits of the host you choose.
Typical things to check: monthly bandwidth, number of builds, site size, and whether commercial use is allowed
(Vercel's Hobby plan is for non-commercial use). None of these hosts promises unlimited traffic.
A custom domain is optional and costs money; the free subdomain from the host works.

## Before you publish

- Set `CONTACT_EMAIL` in `src/config.ts` if you want a contact address shown. The contact form never sends anything by itself.
- The site collects no personal data. Progress stays in each visitor's browser.
- Run `npm run typecheck` once after `npm install`. The content files were type-checked, but the React
  components were built and browser-tested without React's type package available.
## Visual refresh (November 2026)

The interface styling has been refreshed while preserving the existing lesson content, navigation, quiz logic, tools, and browser-local progress model. The update includes a cobalt/indigo and warm-orange palette, refined typography and spacing, softer cards, clearer navigation states, improved form focus states, responsive spacing, and link hover treatments that do not use traditional underlines. Light and dark themes are both supported.

To rebuild the production site after making changes:

```bash
npm install
npm run typecheck
npm run build
```

The deployable static site is generated in `dist/`.


## Expanded practice library

The Practice Sets section now includes five additional advanced worksheets:

- Subnetting & IP design lab
- Switching, VLANs & STP lab
- Routing, OSPF & BGP challenges
- NOC engineer: real-world incident desk
- Network security & hybrid cloud scenarios

These additions include scenario-based multiple-choice questions and answer explanations. The question runner provides immediate feedback, a final review, scoring and retakes.

After extracting the project, run `npm install`, then `npm run build` to regenerate the production `dist/` bundle with the updated practice content. `npm run typecheck` also checks the TypeScript project once dependencies are installed.


## Network Engineer Virtual Lab (November 2026)

The Virtual Lab is no longer a separate page. Each scenario now opens inline next to the lessons, practice questions and interview questions it relates to (see the update below). The scenarios are:

- VLAN trunk allowed-list mismatch
- DHCP relay / helper-address failure
- OSPF area mismatch and missing adjacency
- DNS resolution failure while IP connectivity works
- Wrong default gateway on a manually configured PC (added)
- Missing return static route between two offices (added)

Students can select a scenario and simulated device, run supported diagnostic commands, inspect curated command output, reveal hints, and review a step-by-step solution. The simulator is intentionally read-only: it does not connect to real routers, transmit packets, or execute Cisco IOS configuration. It is designed to teach troubleshooting workflow safely.

**Cost and privacy:** the lab runs entirely in the user's browser. It requires no account, backend, paid API, cloud lab, subscription, or additional runtime dependency. It does not send command input or student data to a server.

After extracting the project, run:

```bash
npm install
npm run typecheck
npm run build
npm run dev
```




## Topic coverage, navigation and labs (November 2026 update)

**Every topic in the brief now has its own lesson.** Module 11 previously combined the troubleshooting
commands and tools into two lessons. It now has one full lesson each for ping, ipconfig, ifconfig, ip,
tracert, traceroute, nslookup, dig, netstat, ss, arp, route, pathping, curl, Wireshark, Nmap and
Cisco Packet Tracer (171 lessons in total), with five new animations (ping, host settings, sockets,
packet capture and port scanning).

**Courses page.** Shows the 12 courses named in the brief (Networking Fundamentals, Networking Devices,
OSI Model, TCP/IP Fundamentals, IP Addressing, Subnetting, Networking Protocols, Routing and Switching,
Network Security, Advanced Routing, Enterprise Networking, Cloud Networking) plus Wireless Networking,
Network Services, Troubleshooting, Practical Labs and Career Preparation. Combined courses reuse
lessons from several modules, so progress is shared. Course definitions live in `src/content/courses.ts`.

**Navigation.** Home, Courses, Networking Tools, Practice & Interview, About. The Practice & Interview
section has three tabs: Practice sets, Course quizzes and Interview questions. Contact and My Progress
are in the footer.

**Virtual labs beside questions.** Labs are defined in `src/content/labs.ts`. `LESSON_LABS` lists the
lessons that show a lab; `QUESTION_LABS` matches practice and interview questions by phrase. A lab is
closed by default and opens in place. "Mark lab as reviewed" is saved with the rest of the progress.


## Free certificates (November 2026)

A **Certificates** page lists one free certificate per course plus a programme certificate for
finishing every course. A course certificate unlocks when:

1. every lesson in the course is marked completed, and
2. the learner's best course-quiz score is at least `CERT_PASS_PERCENT` (70% by default, in `src/config.ts`).

The learner types their name (stored only in their browser) and downloads the certificate as a PDF
(A4 landscape) or PNG. Both are drawn in the browser with no library or server. The date the
certificate first unlocked is saved, so it stays the same on later downloads.

Limits to be aware of: progress lives in the learner's browser, so certificates cannot be verified
online and a determined learner could mark lessons complete without studying. Each certificate says
it is a free certificate of completion, not an accredited qualification or vendor certification.
The certificate reference is an identifier, not a verification code. Code: `src/certs.ts`,
`src/pages/Certificates.tsx`.


## Packet Tracer lab sheets and "How it works" practice (November 2026)

**Packet Tracer labs** (Practice & Interview > Packet Tracer labs, `src/content/ptlabs.ts`): 16 guided
sheets for Cisco Packet Tracer 8 with default 2911 routers and 2960 switches. Each sheet has a
"how it works" summary and animation, a topology diagram, device, cabling and addressing tables,
numbered steps with copy-ready commands, a "why it works" note and checkpoint questions, what to
watch in Simulation mode, a verification table, common mistakes, a three-question quiz and links to
related lessons. Learners can tick off steps and mark a lab completed (saved in their browser).
Lessons that match a sheet link to it automatically.

Labs: basic LAN and ARP, switch security and SSH, router between two LANs, VLANs and trunking,
router-on-a-stick, Layer 3 switch, DHCP and DHCP relay, static and floating static routes,
single-area OSPF, NAT/PAT, standard and extended ACLs, STP and EtherChannel, wireless with WPA2,
DNS and web server, IPv6 static routing, port security.

**How it works practice sets**: "loading a web page", "inside the LAN" and "routing, NAT and
troubleshooting". They use a new question style, "Put in order", built on the matching question
type (`order()` in `src/content/practice.ts`).

Packet Tracer is free from Cisco Networking Academy but Cisco requires a free Cisco account to
download it. NetLearn itself still needs no account.
