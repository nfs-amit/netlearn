import { useState } from 'react';
import type { PQ } from '../content/practice';
import { setScore } from '../store';
import { Icon } from './ui';
import { LabInline } from './LabConsole';
import { labForQuestion } from '../content/labs';

type Ans = number | string | number[] | undefined;
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

function isAnswered(q: PQ, a: Ans): boolean {
  if (q.t === 'mcq') return typeof a === 'number';
  if (q.t === 'fill') return typeof a === 'string' && a.trim() !== '';
  return Array.isArray(a) && a.length === q.l.length && a.every((v) => v >= 0);
}
function isCorrect(q: PQ, a: Ans): boolean {
  if (q.t === 'mcq') return a === q.a;
  if (q.t === 'fill') return typeof a === 'string' && q.a.some((x) => norm(x) === norm(a));
  return Array.isArray(a) && a.every((v, i) => v === i);
}
function correctText(q: PQ): string {
  if (q.t === 'mcq') return q.o[q.a];
  if (q.t === 'fill') return q.a[0];
  if (q.kind === 'Put in order') {
    const pairs = q.l.map((l, i) => [q.r[i], l]).sort((a, b) => a[0].localeCompare(b[0], 'en', { numeric: true }));
    return pairs.map(([r, l]) => `${r}: ${l}`).join('; ');
  }
  return q.l.map((l, i) => `${l} → ${q.r[i]}`).join('; ');
}

/** Question runner used by practice sets and module quizzes. */
export function Runner({ id, qs }: { id: string; qs: PQ[] }) {
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<Ans[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const q = qs[idx];
  const a = ans[idx];
  const isChecked = !!checked[idx];
  const score = qs.filter((qq, i) => checked[i] && isCorrect(qq, ans[i])).length;

  const set = (v: Ans) => { if (!isChecked) setAns((p) => { const c = [...p]; c[idx] = v; return c; }); };
  const check = () => setChecked((p) => { const c = [...p]; c[idx] = true; return c; });
  const finish = () => { setScore(id, score, qs.length); setDone(true); };
  const retake = () => { setAns([]); setChecked([]); setIdx(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / qs.length) * 100);
    return (
      <section className="runner" aria-live="polite">
        <h2>Your score: {score} of {qs.length}</h2>
        <div className="progress-track big"><div className="progress-fill grow" style={{ width: pct + '%' }} /></div>
        <p>{pct >= 80 ? 'Strong result. You are ready to move on.' : pct >= 50 ? 'Good progress. Review the explanations below and try again.' : 'Keep going. Read the explanations, revisit the lessons and retake the set.'}</p>
        <ol className="review">
          {qs.map((qq, i) => {
            const ok = checked[i] && isCorrect(qq, ans[i]);
            return (
              <li key={i} className={ok ? 'ok' : 'no'}>
                <p><strong>{ok ? 'Correct' : checked[i] ? 'Incorrect' : 'Not answered'}:</strong> {qq.q}</p>
                <p className="muted">Answer: {correctText(qq)}. {qq.e}</p>
              </li>
            );
          })}
        </ol>
        <button type="button" className="btn" onClick={retake}><Icon name="replay" /> Retake</button>
      </section>
    );
  }

  const order = q.t === 'match' ? q.r.map((_, i) => i).sort((x, y) => q.r[x].localeCompare(q.r[y])) : [];
  const right = isChecked && isCorrect(q, a);
  const unanswered = qs.length - checked.filter(Boolean).length;

  return (
    <section className="runner">
      <nav className="qnav" aria-label="Questions">
        {qs.map((qq, i) => (
          <button key={i} type="button" aria-label={`Question ${i + 1}`} aria-current={i === idx ? 'step' : undefined}
            className={'qdot' + (i === idx ? ' cur' : '') + (checked[i] ? (isCorrect(qq, ans[i]) ? ' ok' : ' no') : '')}
            onClick={() => setIdx(i)}>{i + 1}</button>
        ))}
      </nav>
      <p className="eyebrow">{q.kind} · Question {idx + 1} of {qs.length}</p>
      <h2 className="qtext">{q.q}</h2>

      {q.t === 'mcq' && (
        <div className="options" role="radiogroup" aria-label="Answer options">
          {q.o.map((o, i) => (
            <button key={i} type="button" role="radio" aria-checked={a === i} disabled={isChecked}
              className={'option' + (a === i ? ' picked' : '') + (isChecked && i === q.a ? ' right' : '') + (isChecked && a === i && i !== q.a ? ' wrong' : '')}
              onClick={() => set(i)}>
              <span className="mono">{String.fromCharCode(65 + i)}</span> {o}
            </button>
          ))}
        </div>
      )}
      {q.t === 'fill' && (
        <p>
          <label htmlFor={'fill-' + id}>Your answer</label>
          <input id={'fill-' + id} className="input mono" value={(a as string) ?? ''} disabled={isChecked} autoComplete="off"
            onChange={(e) => set(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && isAnswered(q, a)) check(); }} />
        </p>
      )}
      {q.t === 'match' && (
        <div className="match">
          {q.l.map((l, i) => (
            <p key={i}>
              <label htmlFor={`m-${id}-${idx}-${i}`}>{l}</label>
              <select id={`m-${id}-${idx}-${i}`} className="input" disabled={isChecked} value={((a as number[]) ?? [])[i] ?? -1}
                onChange={(e) => { const c = [...(((a as number[]) ?? q.l.map(() => -1)))]; while (c.length < q.l.length) c.push(-1); c[i] = Number(e.target.value); set(c); }}>
                <option value={-1}>Choose…</option>
                {order.map((r) => <option key={r} value={r}>{q.r[r]}</option>)}
              </select>
            </p>
          ))}
        </div>
      )}

      {isChecked && (
        <div className={'feedback ' + (right ? 'ok' : 'no')} role="status">
          <p><strong>{right ? 'Correct.' : 'Not quite.'}</strong> {!right && <>Correct answer: <span className="mono">{correctText(q)}</span>. </>}{q.e}</p>
        </div>
      )}

      <div className="runner-actions">
        {!isChecked && <button type="button" className="btn" disabled={!isAnswered(q, a)} onClick={check}>Submit answer</button>}
        {isChecked && idx < qs.length - 1 && <button type="button" className="btn" onClick={() => setIdx(idx + 1)}>Next question <Icon name="next" /></button>}
        {idx > 0 && <button type="button" className="btn ghost" onClick={() => setIdx(idx - 1)}><Icon name="prev" /> Previous</button>}
        {!isChecked && idx < qs.length - 1 && <button type="button" className="btn ghost" onClick={() => setIdx(idx + 1)}>Skip</button>}
        <button type="button" className={'btn ' + (unanswered === 0 ? '' : 'ghost')} onClick={finish}>
          Finish and see score{unanswered > 0 ? ` (${unanswered} unanswered)` : ''}
        </button>
      </div>
      {labForQuestion(q.q) && <LabInline key={idx} id={labForQuestion(q.q)!} />}
    </section>
  );
}
