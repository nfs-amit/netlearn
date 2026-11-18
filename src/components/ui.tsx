import { useEffect, useState, type ReactNode } from 'react';
import type { Level } from '../types';

/** Current route, taken from the URL hash (works on any static host, no server rewrites needed). */
export function useRoute(): string {
  const read = () => decodeURIComponent(location.hash.replace(/^#/, '')) || 'home';
  const [r, setR] = useState(read);
  useEffect(() => {
    const on = () => setR(read());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return r;
}

const PATHS: Record<string, string> = {
  sun: 'M12 4V2m0 20v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  bookmark: 'M7 4h10v16l-5-4-5 4z',
  play: 'M8 5v14l11-7z',
  pause: 'M8 5v14M16 5v14',
  replay: 'M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5',
  prev: 'M14 6l-6 6 6 6',
  next: 'M10 6l6 6-6 6',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
};

export function Icon({ name, fill }: { name: string; fill?: boolean }) {
  return (
    <svg className="ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"
      fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  );
}

const LEVEL_N: Record<Level, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };

/** Difficulty shown as signal bars plus the word, so it never depends on colour alone. */
export function LevelTag({ level }: { level: Level | string }) {
  const n = LEVEL_N[level as Level] ?? 1;
  return (
    <span className="level">
      <svg viewBox="0 0 16 12" width="16" height="12" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <rect key={i} x={i * 6} y={8 - i * 4} width="4" height={4 + i * 4} rx="1" className={i < n ? 'bar on' : 'bar'} />
        ))}
      </svg>
      {level}
    </span>
  );
}

export function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className="progress-track"><div className="progress-fill" style={{ width: pct + '%' }} /></div>
      <span className="progress-text">{value} of {max} · {pct}%</span>
    </div>
  );
}

export function Crumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map(([t, href], i) => (
        <span key={i}>{href ? <a href={href}>{t}</a> : <span aria-current="page">{t}</span>}{i < items.length - 1 ? ' / ' : ''}</span>
      ))}
    </nav>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 tabIndex={-1} id="page-title">{title}</h1>
      {children && <div className="lede">{children}</div>}
    </header>
  );
}

export function FreeNote() {
  return <p className="free-note"><Icon name="check" /> Free. No login. No payment.</p>;
}
