import { Component, useEffect, useMemo, useState, type ReactNode } from 'react';
import { scenes } from '../content/scenes';
import type { Scene, SceneNode } from '../types';
import { Icon } from './ui';

const W = 640, H = 270;
const arr = (v?: string | string[]) => (v == null ? [] : Array.isArray(v) ? v : [v]);

export function NodeIcon({ kind }: { kind: string }) {
  switch (kind) {
    case 'pc': return <><rect x="-19" y="-15" width="38" height="25" rx="3" /><path d="M-11 16h22M0 10v6" /></>;
    case 'server': return <><rect x="-14" y="-18" width="28" height="36" rx="3" /><path d="M-14 -6h28M-14 6h28M-8 -12h4M-8 0h4M-8 12h4" /></>;
    case 'router': return <><circle r="18" /><path d="M-10 0h20M0 -10v20M6 -4l4 4-4 4M-6 4l-4-4 4-4" /></>;
    case 'switch': return <><rect x="-23" y="-13" width="46" height="26" rx="4" /><path d="M-13 -4h24m-4-4 4 4M13 5h-24m4 4-4-4" /></>;
    case 'hub': return <><rect x="-23" y="-11" width="46" height="22" rx="3" /><path d="M-14 0h.1M-5 0h.1M5 0h.1M14 0h.1" strokeWidth="4" /></>;
    case 'fw': return <><rect x="-18" y="-16" width="36" height="32" rx="2" /><path d="M-18 -5h36M-18 6h36M-6 -16v11M6 -5v11M-6 6v10" /></>;
    case 'cloud': return <path d="M-20 12a11 11 0 0 1-2-21 15 15 0 0 1 29-3 11 11 0 0 1 13 12 8 8 0 0 1-3 12z" />;
    case 'ap': return <><circle cy="8" r="5" /><path d="M-11 -1a16 16 0 0 1 22 0M-18 -9a26 26 0 0 1 36 0" fill="none" /></>;
    case 'phone': return <><rect x="-10" y="-18" width="20" height="36" rx="4" /><path d="M-3 12h6" /></>;
    default: return <rect x="-82" y="-20" width="164" height="40" rx="4" />;
  }
}

function clampDx(x: number, text: string) {
  const half = (text.length * 6.6) / 2 + 4;
  if (x - half < 0) return half - x;
  if (x + half > W) return W - half - x;
  return 0;
}

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { bad: boolean }> {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  render() { return this.state.bad ? this.props.fallback : this.props.children; }
}

function StepsText({ sc }: { sc: Scene }) {
  return <ol className="scene-steps">{sc.steps.map((s, i) => <li key={i}>{s.text}</li>)}</ol>;
}

function Player({ sc, id, autoplay }: { sc: Scene; id: string; autoplay: boolean }) {
  const reduce = useMemo(() => {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  }, []);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(autoplay && !reduce);
  const [moved, setMoved] = useState(reduce);
  const last = sc.steps.length - 1;
  const loop = autoplay || sc.steps.length <= 3; // short scenes loop, long ones stop at the end

  useEffect(() => { setI(0); setPlaying(autoplay && !reduce); }, [id]);
  useEffect(() => {
    if (reduce) { setMoved(true); return; }
    setMoved(false);
    const t = setTimeout(() => setMoved(true), 40);
    return () => clearTimeout(t);
  }, [i, id]);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (i < last) setI(i + 1);
      else if (loop) setI(0);
      else setPlaying(false);
    }, 2800);
    return () => clearTimeout(t);
  }, [playing, i, id]);

  const pos: Record<string, SceneNode> = {};
  sc.nodes.forEach((n) => { pos[n.id] = n; });
  const step = sc.steps[Math.min(i, last)];
  const targets = arr(step.to);
  const active = new Set([...(step.from ? [step.from] : []), ...targets, ...arr(step.at)]);
  const linkOn = (a: string, b: string) => !!step.from && targets.some((t) => (a === step.from && b === t) || (b === step.from && a === t));
  const go = (n: number) => { setPlaying(false); setI(Math.max(0, Math.min(last, n))); };

  return (
    <figure className="scene">
      <figcaption className="scene-title">{sc.title}</figcaption>
      <div className="scene-canvas">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={sc.title + '. ' + sc.desc}>
          {sc.links.map(([a, b], k) => (
            <line key={k} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} className={linkOn(a, b) ? 'link on' : 'link'} />
          ))}
          {sc.nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x} ${n.y})`} className={'node k-' + n.kind + (active.has(n.id) ? ' on' : '')}>
              <NodeIcon kind={n.kind} />
              <text className="node-label" y={n.kind === 'layer' ? 4 : 36} x={n.kind === 'layer' ? 0 : clampDx(n.x, n.label)} textAnchor="middle">{n.label}</text>
            </g>
          ))}
          {step.from && targets.map((t) => {
            const a = pos[step.from!], b = pos[t];
            const p = moved ? b : a;
            const label = step.label ?? '';
            return (
              <g key={i + '-' + t} className="pkt"
                style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: moved && !reduce ? 'transform 1.3s ease-in-out' : 'none' }}>
                <rect x="-9" y="-7" width="18" height="14" rx="3" />
                <text className="pkt-label" y="-13" x={clampDx(b.x, label)} textAnchor="middle">{label}</text>
                {step.drop && (
                  <path className="drop-x" d="M-9 -9l18 18M9 -9l-18 18" style={{ animationDelay: reduce ? '0s' : '1.3s' }} />
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="scene-caption" aria-live="polite">
        <span className="mono">Step {i + 1} of {last + 1}</span> {step.text}
      </p>
      <div className="scene-controls">
        <button type="button" className="btn small" onClick={() => { if (!playing && i === last) setI(0); setPlaying(!playing); }}>
          <Icon name={playing ? 'pause' : 'play'} fill={!playing} /> {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="btn small ghost" onClick={() => go(i - 1)} disabled={i === 0}><Icon name="prev" /> Back</button>
        <button type="button" className="btn small ghost" onClick={() => go(i + 1)} disabled={i === last}>Next step <Icon name="next" /></button>
        <button type="button" className="btn small ghost" onClick={() => { setI(0); setPlaying(!reduce); }}><Icon name="replay" /> Replay</button>
      </div>
      <details className="scene-text">
        <summary>Read every step as text</summary>
        <StepsText sc={sc} />
      </details>
    </figure>
  );
}

/** Animated network diagram with Play, Pause, Replay and step controls. Falls back to text if drawing fails. */
export function SceneAnimation({ id, autoplay = false }: { id: string; autoplay?: boolean }) {
  const key = scenes[id] ? id : 'packet';
  const sc = scenes[key];
  return (
    <Boundary fallback={<div className="scene"><p className="scene-title">{sc.title}</p><StepsText sc={sc} /></div>}>
      <Player sc={sc} id={key} autoplay={autoplay} />
    </Boundary>
  );
}
