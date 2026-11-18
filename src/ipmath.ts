// IPv4 helpers. Everything runs locally in the browser.

export function parseIp(s: string): number | null {
  const p = s.trim().split('.');
  if (p.length !== 4) return null;
  let n = 0;
  for (const part of p) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const v = Number(part);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n >>> 0;
}

export const toIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');
export const maskOf = (prefix: number) => (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);
export const toBin = (n: number) => [24, 16, 8, 0].map((s) => ((n >>> s) & 255).toString(2).padStart(8, '0')).join('.');

export function prefixOfMask(mask: number): number | null {
  for (let p = 0; p <= 32; p++) if (maskOf(p) === mask) return p;
  return null;
}

export function classOf(ip: number): { cls: string; note: string; defMask: string } {
  const o = ip >>> 24;
  if (o === 0) return { cls: 'Reserved', note: '0.0.0.0/8 means "this network"', defMask: 'none' };
  if (o === 127) return { cls: 'A (loopback)', note: '127.0.0.0/8 is reserved for loopback', defMask: '255.0.0.0 (/8)' };
  if (o < 128) return { cls: 'A', note: 'First octet 1 to 126', defMask: '255.0.0.0 (/8)' };
  if (o < 192) return { cls: 'B', note: 'First octet 128 to 191', defMask: '255.255.0.0 (/16)' };
  if (o < 224) return { cls: 'C', note: 'First octet 192 to 223', defMask: '255.255.255.0 (/24)' };
  if (o < 240) return { cls: 'D (multicast)', note: 'First octet 224 to 239; not assigned to hosts', defMask: 'none' };
  return { cls: 'E (experimental)', note: 'First octet 240 to 255; reserved', defMask: 'none' };
}

export function kindOf(ip: number): string {
  const a = ip >>> 24, b = (ip >>> 16) & 255;
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return 'Private (RFC 1918)';
  if (a === 127) return 'Loopback';
  if (a === 169 && b === 254) return 'Link-local (APIPA)';
  if (a === 100 && b >= 64 && b <= 127) return 'Shared address space (carrier-grade NAT)';
  if (a >= 224 && a < 240) return 'Multicast';
  if (a >= 240 || a === 0) return 'Reserved';
  return 'Public';
}

export type Subnet = {
  network: number; broadcast: number; first: number; last: number;
  total: number; usable: number; mask: number; wildcard: number; prefix: number;
};

export function subnetOf(ip: number, prefix: number): Subnet {
  const mask = maskOf(prefix);
  const network = (ip & mask) >>> 0;
  const wildcard = (~mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = 2 ** (32 - prefix);
  // /31 (RFC 3021 point-to-point) and /32 (single host) have no separate network/broadcast address.
  const usable = prefix >= 31 ? total : total - 2;
  const first = prefix >= 31 ? network : network + 1;
  const last = prefix >= 31 ? broadcast : broadcast - 1;
  return { network, broadcast, first, last, total, usable, mask, wildcard, prefix };
}
