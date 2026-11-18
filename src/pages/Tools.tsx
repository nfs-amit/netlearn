import { useState, type ReactNode } from 'react';
import { FreeNote, PageHead } from '../components/ui';
import { COMMANDS, OSI, PORTS } from '../content/reference';
import { classOf, kindOf, parseIp, prefixOfMask, subnetOf, toBin, toIp, type Subnet } from '../ipmath';

const TOOLS: [string, string][] = [
  ['subnet', 'IPv4 Subnet Calculator'], ['cidr', 'CIDR Calculator'], ['b2d', 'Binary to Decimal'], ['d2b', 'Decimal to Binary'],
  ['class', 'IP Address Class Checker'], ['ports', 'Common Port Reference'], ['osi', 'OSI Layer Reference'], ['cmd', 'Networking Command Reference'],
];

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return <dl className="result">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="mono">{v}</dd></div>)}</dl>;
}

function subnetRows(ip: number, s: Subnet): [string, ReactNode][] {
  return [
    ['Network address', `${toIp(s.network)}/${s.prefix}`],
    ['Subnet mask', toIp(s.mask)],
    ['Wildcard mask', toIp(s.wildcard)],
    ['Broadcast address', s.prefix >= 31 ? 'None (/' + s.prefix + ')' : toIp(s.broadcast)],
    ['Usable host range', `${toIp(s.first)} to ${toIp(s.last)}`],
    ['Total addresses', s.total.toLocaleString('en')],
    ['Usable hosts', s.usable.toLocaleString('en')],
    ['Address type', kindOf(ip)],
    ['IP in binary', toBin(ip)],
    ['Mask in binary', toBin(s.mask)],
  ];
}

function SubnetCalc() {
  const [ip, setIp] = useState('192.168.10.77');
  const [mask, setMask] = useState('255.255.255.192');
  const n = parseIp(ip);
  const m = mask.trim().startsWith('/') || /^\d{1,2}$/.test(mask.trim())
    ? (() => { const p = Number(mask.trim().replace('/', '')); return p >= 0 && p <= 32 ? p : null; })()
    : (() => { const mm = parseIp(mask); return mm === null ? null : prefixOfMask(mm); })();
  return (
    <>
      <p>Enter an IP address and a subnet mask (dotted, or a prefix such as /26).</p>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <p><label htmlFor="sc-ip">IP address</label><input id="sc-ip" className="input mono" value={ip} onChange={(e) => setIp(e.target.value)} inputMode="decimal" autoComplete="off" /></p>
        <p><label htmlFor="sc-mask">Subnet mask or prefix</label><input id="sc-mask" className="input mono" value={mask} onChange={(e) => setMask(e.target.value)} autoComplete="off" /></p>
      </form>
      <div aria-live="polite">
        {n === null ? <p className="err">Enter a valid IPv4 address: four numbers from 0 to 255 separated by dots.</p>
          : m === null ? <p className="err">Enter a valid mask such as 255.255.255.0, or a prefix from /0 to /32. Mask bits must be continuous.</p>
          : <Rows rows={subnetRows(n, subnetOf(n, m))} />}
      </div>
    </>
  );
}

function CidrCalc() {
  const [cidr, setCidr] = useState('10.0.0.0/22');
  const [np, setNp] = useState('24');
  const mt = cidr.trim().match(/^(.+)\/(\d{1,2})$/);
  const ip = mt ? parseIp(mt[1]) : null;
  const p = mt ? Number(mt[2]) : -1;
  const ok = ip !== null && p >= 0 && p <= 32;
  const s = ok ? subnetOf(ip!, p) : null;
  const newP = Number(np);
  const count = s && newP >= p && newP <= 32 ? 2 ** (newP - p) : 0;
  const size = 2 ** (32 - newP);
  const list = s && count ? Array.from({ length: Math.min(count, 64) }, (_, i) => subnetOf(s.network + i * size, newP)) : [];
  return (
    <>
      <p>Enter a network in CIDR notation. Optionally split it into smaller subnets.</p>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <p><label htmlFor="cc-cidr">CIDR block</label><input id="cc-cidr" className="input mono" value={cidr} onChange={(e) => setCidr(e.target.value)} autoComplete="off" /></p>
        <p><label htmlFor="cc-np">Split into subnets of prefix</label>
          <select id="cc-np" className="input mono" value={np} onChange={(e) => setNp(e.target.value)}>
            {Array.from({ length: 33 }, (_, i) => i).filter((i) => i >= Math.max(p, 0)).map((i) => <option key={i} value={i}>/{i}</option>)}
          </select></p>
      </form>
      <div aria-live="polite">
        {!s ? <p className="err">Enter a block such as 192.168.1.0/24.</p> : (
          <>
            <Rows rows={subnetRows(ip!, s)} />
            {count > 0 && (
              <>
                <h3>{count.toLocaleString('en')} {count === 1 ? 'subnet' : 'subnets'} of /{newP}{count > 64 ? ' (first 64 shown)' : ''}</h3>
                <div className="table-wrap"><table>
                  <thead><tr><th>Subnet</th><th>Usable range</th><th>Broadcast</th><th>Usable hosts</th></tr></thead>
                  <tbody>{list.map((x) => (
                    <tr key={x.network}><td className="mono">{toIp(x.network)}/{newP}</td><td className="mono">{toIp(x.first)} to {toIp(x.last)}</td><td className="mono">{newP >= 31 ? 'none' : toIp(x.broadcast)}</td><td className="mono">{x.usable.toLocaleString('en')}</td></tr>
                  ))}</tbody>
                </table></div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

function BinToDec() {
  const [v, setV] = useState('11000000.10101000.00000001.00001010');
  const parts = v.trim().split('.');
  const valid = v.trim() !== '' && parts.every((p) => /^[01]{1,32}$/.test(p)) && (parts.length === 1 || parts.every((p) => p.length <= 8));
  const out = valid ? parts.map((p) => parseInt(p, 2)).join('.') : '';
  const one = valid && parts.length === 1 ? parts[0] : '';
  return (
    <>
      <p>Enter binary digits. Use dots between octets to convert a whole address.</p>
      <p><label htmlFor="b2d">Binary</label><input id="b2d" className="input mono" value={v} onChange={(e) => setV(e.target.value)} autoComplete="off" /></p>
      <div aria-live="polite">
        {!valid ? <p className="err">Use only 0 and 1. With dots, each group may have up to 8 bits.</p> : (
          <>
            <Rows rows={[['Decimal', out]]} />
            {one && one.length <= 8 && <p className="muted">Working: {[...one.padStart(8, '0')].map((b, i) => (b === '1' ? 2 ** (7 - i) : null)).filter((x) => x !== null).join(' + ') || '0'} = {out}</p>}
          </>
        )}
      </div>
    </>
  );
}

function DecToBin() {
  const [v, setV] = useState('172.16.5.1');
  const t = v.trim();
  const ip = t.includes('.') ? parseIp(t) : null;
  const num = /^\d{1,10}$/.test(t) && Number(t) <= 4294967295 ? Number(t) : null;
  return (
    <>
      <p>Enter a decimal number (0 to 4294967295) or a dotted IPv4 address.</p>
      <p><label htmlFor="d2b">Decimal</label><input id="d2b" className="input mono" value={v} onChange={(e) => setV(e.target.value)} autoComplete="off" /></p>
      <div aria-live="polite">
        {ip !== null ? <Rows rows={[['Binary', toBin(ip)], ['Hexadecimal', ip.toString(16).toUpperCase().padStart(8, '0')]]} />
          : num !== null ? <Rows rows={[['Binary', num.toString(2).padStart(num < 256 ? 8 : 0, '0')], ['Hexadecimal', num.toString(16).toUpperCase()]]} />
          : <p className="err">Enter a whole number or an address such as 192.168.1.10.</p>}
      </div>
    </>
  );
}

function ClassCheck() {
  const [v, setV] = useState('172.20.4.1');
  const ip = parseIp(v);
  const c = ip !== null ? classOf(ip) : null;
  return (
    <>
      <p>Classes are the original (classful) system. Modern networks use CIDR, but classes still appear in exams and interviews.</p>
      <p><label htmlFor="cls">IPv4 address</label><input id="cls" className="input mono" value={v} onChange={(e) => setV(e.target.value)} autoComplete="off" /></p>
      <div aria-live="polite">
        {!c ? <p className="err">Enter a valid IPv4 address.</p>
          : <Rows rows={[['Class', c.cls], ['Rule', c.note], ['Default mask', c.defMask], ['Address type', kindOf(ip!)], ['First octet in binary', (ip! >>> 24).toString(2).padStart(8, '0')]]} />}
      </div>
    </>
  );
}

function FilterTable({ id, head, rows, mono }: { id: string; head: string[]; rows: string[][]; mono: number[] }) {
  const [q, setQ] = useState('');
  const n = q.trim().toLowerCase();
  const list = rows.filter((r) => !n || r.join(' ').toLowerCase().includes(n));
  return (
    <>
      <p><label htmlFor={id}>Filter</label><input id={id} className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} /></p>
      <div className="table-wrap"><table>
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{list.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={mono.includes(j) ? 'mono' : ''}>{c}</td>)}</tr>)}</tbody>
      </table></div>
      {!list.length && <p>No rows match.</p>}
    </>
  );
}

export function Tools() {
  const [tab, setTab] = useState('subnet');
  return (
    <>
      <PageHead eyebrow="Networking Tools" title="Calculators and quick references">
        <p>Every calculation runs in your browser. Nothing is sent to a server.</p>
      </PageHead>
      <FreeNote />
      <div className="tabs" role="tablist" aria-label="Tools">
        {TOOLS.map(([id, name]) => (
          <button key={id} type="button" role="tab" id={'tab-' + id} aria-selected={tab === id} aria-controls="tool-panel" className={tab === id ? 'tab on' : 'tab'} onClick={() => setTab(id)}>{name}</button>
        ))}
      </div>
      <section id="tool-panel" role="tabpanel" aria-labelledby={'tab-' + tab} className="tool">
        <h2>{TOOLS.find((t) => t[0] === tab)![1]}</h2>
        {tab === 'subnet' && <SubnetCalc />}
        {tab === 'cidr' && <CidrCalc />}
        {tab === 'b2d' && <BinToDec />}
        {tab === 'd2b' && <DecToBin />}
        {tab === 'class' && <ClassCheck />}
        {tab === 'ports' && <FilterTable id="f-ports" head={['Port', 'Transport', 'Service', 'Notes']} rows={PORTS} mono={[0, 1]} />}
        {tab === 'osi' && (
          <div className="table-wrap"><table>
            <thead><tr><th>Layer</th><th>Name</th><th>Data unit</th><th>Job</th><th>Examples</th><th>Devices</th></tr></thead>
            <tbody>{OSI.map((r) => <tr key={r[0]}><td className="mono">{r[0]}</td><td><strong>{r[1]}</strong></td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td></tr>)}</tbody>
          </table></div>
        )}
        {tab === 'cmd' && <FilterTable id="f-cmd" head={['Command', 'Platform', 'What it does', 'Example']} rows={COMMANDS} mono={[0, 3]} />}
      </section>
    </>
  );
}
