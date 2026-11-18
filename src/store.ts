import { useSyncExternalStore } from 'react';

// All learner data stays in this browser (localStorage). Nothing is sent anywhere.
export type State = {
  done: Record<string, true>;                       // completed lesson ids
  scores: Record<string, { s: number; t: number; b?: number }>; // quiz and practice scores (b = best score)
  marks: Record<string, true>;                      // bookmarked interview questions
  idone: Record<string, true>;                      // interview questions marked completed
  labs: Record<string, true>;                       // virtual labs marked reviewed
  certs: Record<string, string>;                    // certificates earned: course id -> ISO date
  name: string;                                     // name printed on certificates (this browser only)
  theme: '' | 'light' | 'dark';
  track: boolean;                                   // false = do not save progress
};

const KEY = 'netlearn.v1';
const blank = (): State => ({ done: {}, scores: {}, marks: {}, idone: {}, labs: {}, certs: {}, name: '', theme: '', track: true });

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blank(), ...JSON.parse(raw) };
  } catch { /* storage unavailable: run in memory */ }
  return blank();
}

let state = load();
const subs = new Set<() => void>();

function save() {
  try {
    const out = state.track ? state : { theme: state.theme, track: false };
    localStorage.setItem(KEY, JSON.stringify(out));
  } catch { /* ignore */ }
}

export function update(fn: (s: State) => State) {
  state = fn(state);
  save();
  subs.forEach((f) => f());
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => state,
  );
}

export const toggle = (k: 'done' | 'marks' | 'idone' | 'labs', id: string) =>
  update((s) => {
    const c = { ...s[k] };
    if (c[id]) delete c[id]; else c[id] = true;
    return { ...s, [k]: c };
  });

export const setScore = (id: string, s: number, t: number) =>
  update((st) => {
    const prev = st.scores[id];
    const best = prev && prev.t === t ? Math.max(prev.b ?? prev.s, s) : s;
    return { ...st, scores: { ...st.scores, [id]: { s, t, b: best } } };
  });

export const resetProgress = () => update((s) => ({ ...blank(), theme: s.theme, track: s.track }));

export function effectiveTheme(t: State['theme']): 'light' | 'dark' {
  if (t) return t;
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
}

export function applyTheme(t: State['theme']) {
  const el = document.documentElement;
  if (t) el.setAttribute('data-theme', t);
}
