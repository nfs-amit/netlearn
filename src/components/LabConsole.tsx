import { useState } from 'react';
import { labById } from '../content/labs';
import { toggle, useStore } from '../store';
import { Icon } from './ui';

const NORMALIZE = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** The simulated lab itself: scenario, objectives, hint, walkthrough and a read-only CLI. */
function Console({ id }: { id: string }) {
  const st = useStore();
  const lab = labById.get(id)!;
  const [device, setDevice] = useState(lab.devices[0]);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<{ cmd: string; output: string }[]>([]);
  const [hintOpen, setHintOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const done = !!st.labs['lab-' + lab.id];

  const lookup = (cmd: string) => lab.outputs[device + '|' + cmd] ?? lab.outputs[cmd];

  const run = (raw: string) => {
    const cmd = NORMALIZE(raw);
    if (!cmd) return;
    if (cmd === 'clear' || cmd === 'cls') { setHistory([]); setCommand(''); return; }
    let output = cmd === '?' ? lab.outputs.help : lookup(cmd);
    if (!output) {
      if (/^(ping|tracert|traceroute|nslookup|dig) /.test(cmd)) output = 'This destination is not part of the simulated network. Type help to see the commands and addresses used in this scenario.';
      else if (cmd.startsWith('show ') || cmd.startsWith('sh ')) output = 'That show command is not modelled on ' + device + ' in this scenario. Type help for the supported commands.';
      else if (/^(conf|configure|interface|int |ip |switchport|router |no )/.test(cmd)) output = 'This lab is read-only, so configuration commands are not applied. Write down your fix, then compare it with the solution walkthrough.';
      else output = '% Unrecognised command: ' + raw.trim() + '\nType help to list supported commands.';
    }
    setHistory((h) => [...h, { cmd: device + '> ' + raw.trim(), output }]);
    setCommand('');
  };

  return (
    <div className="lab-layout">
      <div className="lab-sidebar">
        <p className="row"><span className="chip">{lab.level}</span>{done && <span className="state"><Icon name="check" /> Reviewed</span>}</p>
        <h3 className="lab-title">{lab.title}</h3>
        <p className="muted">{lab.brief}</p>
        <h4>Your task</h4>
        <ol className="lab-objectives">{lab.objective.map((o) => <li key={o}>{o}</li>)}</ol>
        <div className="row">
          <button className="btn ghost small" type="button" aria-expanded={hintOpen} onClick={() => setHintOpen(!hintOpen)}>{hintOpen ? 'Hide hint' : 'Show a hint'}</button>
          <button className="btn ghost small" type="button" aria-expanded={solutionOpen} onClick={() => setSolutionOpen(!solutionOpen)}>{solutionOpen ? 'Hide solution' : 'Show solution'}</button>
        </div>
        {hintOpen && <p className="lab-hint">{lab.hint}</p>}
        {solutionOpen && <ol className="lab-solution">{lab.solution.map((s) => <li key={s}>{s}</li>)}</ol>}
        <button className={'btn small' + (done ? ' ghost' : '')} type="button" aria-pressed={done} onClick={() => toggle('labs', 'lab-' + lab.id)}>
          <Icon name="check" /> {done ? 'Reviewed. Click to undo' : 'Mark lab as reviewed'}
        </button>
      </div>
      <div className="lab-console-panel" aria-label="Simulated network console">
        <div className="lab-console-top">
          <div><span className="lab-live-dot" /> SIMULATED NETWORK</div>
          {lab.devices.length > 1 && (
            <label>Device
              <select value={device} onChange={(e) => setDevice(e.target.value)}>
                {lab.devices.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
          )}
        </div>
        <div className="lab-topology" aria-label={'Topology: ' + lab.topology.join(' to ')}>
          {lab.topology.map((n, i) => (
            <div className="lab-node-wrap" key={n}><div className="lab-node"><span aria-hidden="true">{i === 0 ? '▣' : i === lab.topology.length - 1 ? '◎' : '◇'}</span>{n}</div>{i < lab.topology.length - 1 && <div className="lab-link" />}</div>
          ))}
        </div>
        <div className="lab-terminal" aria-live="polite">
          <div className="lab-terminal-welcome">NetLearn Virtual Lab · Type <code>help</code> to list commands. Output is simulated.</div>
          {history.map((h, i) => <div className="lab-output" key={i}><div className="lab-command">{h.cmd}</div><pre>{h.output}</pre></div>)}
          <form className="lab-command-form" onSubmit={(e) => { e.preventDefault(); run(command); }}>
            <span>{device}&gt;</span>
            <input aria-label={'Command for ' + device} autoComplete="off" autoCapitalize="off" spellCheck={false} value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Type a command" />
            <button className="btn small" type="submit">Run</button>
          </form>
        </div>
        <div className="lab-quick-commands">
          <span>Try:</span>
          {['help', ...lab.quick, 'clear'].map((c) => <button type="button" key={c} className="chip lab-cmd-chip" onClick={() => run(c)}>{c}</button>)}
        </div>
      </div>
    </div>
  );
}

/** A lab placed next to a question. Closed by default so the page stays light; opens in place. */
export function LabInline({ id, label }: { id: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const lab = labById.get(id);
  if (!lab) return null;
  return (
    <section className={'lab-inline' + (open ? ' open' : '')} aria-label={'Virtual lab: ' + lab.title}>
      <div className="lab-inline-head">
        <div>
          <p className="eyebrow">Virtual lab · free, in your browser</p>
          <p className="lab-inline-title"><strong>{label ?? 'Practise this in the virtual lab'}:</strong> {lab.title}</p>
        </div>
        <button type="button" className={'btn small' + (open ? ' ghost' : '')} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Close lab' : 'Open lab'}
        </button>
      </div>
      {open && <Console id={id} />}
    </section>
  );
}
