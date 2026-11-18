import { useState } from 'react';
import { LabInline } from '../components/LabConsole';
import { Runner } from '../components/Runner';
import { NodeIcon, SceneAnimation } from '../components/SceneAnimation';
import { Crumbs, FreeNote, Icon, LevelTag, PageHead, Progress } from '../components/ui';
import { lessonById } from '../content';
import type { PQ } from '../content/practice';
import { PT_LABS, ptById, type PTLab } from '../content/ptlabs';
import { toggle, useStore } from '../store';
import { Missing } from './Learn';
import { PracticeTabs } from './Practice';

const stepKey = (lab: string, i: number) => `pt-${lab}-s${i}`;

export function PTLabList() {
  const st = useStore();
  const [level, setLevel] = useState('All');
  const list = PT_LABS.filter((l) => level === 'All' || l.level === level);
  return (
    <>
      <PracticeTabs current="ptlabs" />
      <PageHead eyebrow="Practice & Interview · Packet Tracer labs" title="Build it yourself in Cisco Packet Tracer">
        <p>Step-by-step lab sheets. Each one shows the topology, the devices and cables, an addressing table, every command to type, why it works, what to watch in Simulation mode, how to check your result and the mistakes people usually make.</p>
      </PageHead>
      <FreeNote />
      <div className="notice">
        <p><strong>Before you start:</strong> download Cisco Packet Tracer from Cisco Networking Academy (netacad.com). It is free, but Cisco asks you to sign in with a free Cisco account to download and open it. NetLearn itself needs no account. The sheets are written for Packet Tracer 8 with its default 2911 routers and 2960 switches.</p>
      </div>
      <form className="filters narrow" onSubmit={(e) => e.preventDefault()}>
        <p><label htmlFor="pt-level">Difficulty</label>
          <select id="pt-level" className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((x) => <option key={x}>{x}</option>)}
          </select></p>
      </form>
      <ol className="pt-list">
        {list.map((l) => {
          const done = l.steps.filter((_, i) => st.labs[stepKey(l.id, i)]).length;
          const finished = !!st.labs['pt-' + l.id];
          return (
            <li key={l.id}>
              <a className="card lift" href={'#ptlab-' + l.id}>
                <span className="mono muted">Lab {PT_LABS.indexOf(l) + 1} · about {l.mins} min</span>
                <h3>{l.title}</h3>
                <p>{l.goal}</p>
                <Progress value={done} max={l.steps.length} label={'Steps done in ' + l.title} />
                <span className="card-foot"><LevelTag level={l.level} /><span>{finished ? '✓ Completed' : l.steps.length + ' steps'}</span></span>
              </a>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/** Keep node labels inside the 640-wide drawing. */
function labelShift(x: number, text: string) {
  const half = (text.length * 6.6) / 2 + 4;
  if (x - half < 0) return half - x;
  if (x + half > 640) return 640 - half - x;
  return 0;
}

function Topology({ lab }: { lab: PTLab }) {
  const pos = Object.fromEntries(lab.topo.n.map((n) => [n[0], n]));
  return (
    <div className="scene-canvas pt-topo">
      <svg viewBox="0 0 640 270" role="img" aria-label={'Topology: ' + lab.topo.l.map(([a, b, t]) => `${a} to ${b}${t ? ' (' + t + ')' : ''}`).join(', ')}>
        {lab.topo.l.map(([a, b, t], i) => {
          const A = pos[a], B = pos[b];
          const mx = (A[3] + B[3]) / 2, my = (A[4] + B[4]) / 2;
          const vertical = Math.abs(B[3] - A[3]) < Math.abs(B[4] - A[4]);
          return (
            <g key={i}>
              <line x1={A[3]} y1={A[4]} x2={B[3]} y2={B[4]} className="link" />
              {t && (vertical
                ? <text x={mx + 10} y={my + 4} textAnchor="start" className="pkt-label pt-link-label">{t}</text>
                : <text x={mx} y={my - 7} textAnchor="middle" className="pkt-label pt-link-label">{t}</text>)}
            </g>
          );
        })}
        {lab.topo.n.map(([id, label, kind, x, y]) => (
          <g key={id} transform={`translate(${x} ${y})`} className={'node k-' + kind}>
            <NodeIcon kind={kind} />
            <text className="node-label" y={36} x={labelShift(x, label)} textAnchor="middle">{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CopyBlock({ code, label }: { code: string; label: string }) {
  const [msg, setMsg] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setMsg('Copied'); }
    catch { setMsg('Copy blocked: select the text and copy it'); }
    setTimeout(() => setMsg(''), 2500);
  };
  return (
    <div className="codeblock">
      <div className="codeblock-head"><span className="mono">{label}</span>
        <button type="button" className="btn small ghost" onClick={copy}>Copy</button>
        {msg && <span role="status" className="muted small">{msg}</span>}
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function Checkpoint({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="checkpoint">
      <p><strong>Checkpoint:</strong> {q}</p>
      <button type="button" className="btn small ghost" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Hide answer' : 'Show answer'}</button>
      {open && <p className="answer">{a}</p>}
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap"><table>
      <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j > 1 ? 'mono' : ''}>{c}</td>)}</tr>)}</tbody>
    </table></div>
  );
}

export function PTLabPage({ id }: { id: string }) {
  const st = useStore();
  const lab = ptById.get(id);
  if (!lab) return <Missing />;
  const n = PT_LABS.indexOf(lab);
  const prev = PT_LABS[n - 1], next = PT_LABS[n + 1];
  const done = lab.steps.filter((_, i) => st.labs[stepKey(lab.id, i)]).length;
  const finished = !!st.labs['pt-' + lab.id];
  const qs: PQ[] = lab.quiz.map(([q, o, a, e]) => ({ t: 'mcq', kind: 'Lab check', q, o, a, e }));
  const addrRows = lab.addr.map((r) => r.map((c) => c || '–'));
  return (
    <article className="ptlab">
      <PracticeTabs current="ptlabs" />
      <Crumbs items={[['Practice & Interview', '#practice'], ['Packet Tracer labs', '#ptlabs'], [lab.title]]} />
      <PageHead eyebrow={`Packet Tracer lab ${n + 1} of ${PT_LABS.length} · about ${lab.mins} minutes`} title={lab.title}><p>{lab.goal}</p></PageHead>
      <div className="row"><LevelTag level={lab.level} /><FreeNote /></div>

      <h2>How it works</h2>
      <ul className="pt-learn">{lab.learn.map((x) => <li key={x}>{x}</li>)}</ul>
      <SceneAnimation id={lab.scene} />

      <h2>Topology</h2>
      <Topology lab={lab} />
      <h3>Devices</h3>
      <Table head={['Name', 'Packet Tracer device']} rows={lab.devices} />
      <h3>Cabling</h3>
      <Table head={['From', 'To', 'Cable']} rows={lab.cables} />
      <h3>Addressing table</h3>
      <Table head={['Device', 'Interface', 'Address', 'Mask / prefix', 'Default gateway']} rows={addrRows} />

      <h2>Step by step</h2>
      <Progress value={done} max={lab.steps.length} label="Steps done" />
      <ol className="pt-steps">
        {lab.steps.map((s, i) => {
          const k = stepKey(lab.id, i);
          return (
            <li key={i} className={st.labs[k] ? 'done' : ''}>
              <div className="pt-step-head">
                <span className="pt-num mono">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.t}</h3>
                <span className="chip">{s.where}</span>
              </div>
              <p>{s.do}</p>
              {s.cmd && <CopyBlock code={s.cmd} label={s.where} />}
              {s.why && <p className="pt-why"><strong>Why it works:</strong> {s.why}</p>}
              {s.check && <Checkpoint q={s.check[0]} a={s.check[1]} />}
              <label className="check pt-done"><input type="checkbox" checked={!!st.labs[k]} onChange={() => toggle('labs', k)} /> I have done this step</label>
            </li>
          );
        })}
      </ol>

      <h2>Watch it in Simulation mode</h2>
      <p className="muted">Click Simulation (bottom right of Packet Tracer), use Edit Filters to show only the protocols named, then press Capture/Forward to move one event at a time. Click any envelope to open its layers.</p>
      <ul>{lab.sim.map((x) => <li key={x}>{x}</li>)}</ul>

      <h2>Check your result</h2>
      <Table head={['Command or action', 'Where', 'What you should see']} rows={lab.verify} />

      <h2>Common mistakes</h2>
      <Table head={['What you see', 'Fix']} rows={lab.mistakes} />

      {lab.lab && <LabInline id={lab.lab} label="No Packet Tracer at hand? Try the troubleshooting lab" />}

      <h2>Lab quiz</h2>
      <Runner key={lab.id} id={'practice-pt-' + lab.id} qs={qs} />

      <h2>Related lessons</h2>
      <ul className="related">{lab.related.map((r) => lessonById.get(r)).filter(Boolean).map((l) => <li key={l!.id}><a href={'#lesson-' + l!.id}>{l!.title}</a></li>)}</ul>

      <div className="complete">
        <button type="button" className={'btn big' + (finished ? ' ghost' : '')} aria-pressed={finished} onClick={() => toggle('labs', 'pt-' + lab.id)}>
          <Icon name="check" /> {finished ? 'Lab completed. Click to undo' : 'Mark lab as completed'}
        </button>
      </div>
      <nav className="prevnext" aria-label="Lab navigation">
        {prev ? <a href={'#ptlab-' + prev.id}><span className="muted"><Icon name="prev" /> Previous lab</span><strong>{prev.title}</strong></a> : <span />}
        {next ? <a className="nx" href={'#ptlab-' + next.id}><span className="muted">Next lab <Icon name="next" /></span><strong>{next.title}</strong></a> : <span />}
      </nav>
    </article>
  );
}
