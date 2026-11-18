import { useState } from 'react';
import { Runner } from '../components/Runner';
import { SceneAnimation } from '../components/SceneAnimation';
import { Crumbs, FreeNote, Icon, LevelTag, PageHead, Progress } from '../components/ui';
import { courseById, courses, lessons, moduleById, modules } from '../content';
import { LESSON_LABS } from '../content/labs';
import { ptForLesson } from '../content/ptlabs';
import { LabInline } from '../components/LabConsole';
import { PracticeTabs } from './Practice';
import { courseCert } from '../certs';
import { CertRequirements } from './Certificates';
import type { PQ } from '../content/practice';
import { toggle, useStore } from '../store';
import type { Lesson, Level, Quiz } from '../types';

type CourseView = { id: string; title: string; level: Level; blurb: string; eyebrow: string; lessons: Lesson[]; isModule: boolean };

/** A course card id, or a module id (modules 3 and 13 have no card of their own). */
export function resolveCourse(id: string): CourseView | undefined {
  const c = courseById.get(id);
  if (c) return { id: c.id, title: c.title, level: c.level, blurb: c.blurb, lessons: c.lessonList, isModule: !!c.module,
    eyebrow: c.module ? `Module ${c.module.n} · ${c.module.cat}` : `Course · lessons from ${new Set(c.lessonList.map((l) => l.mod)).size} modules` };
  const m = moduleById.get(id);
  if (m) return { id: m.id, title: m.title, level: m.level, blurb: m.blurb, lessons: m.lessons, isModule: true, eyebrow: `Module ${m.n} · ${m.cat}` };
  return undefined;
}

const doneOf = (ls: Lesson[], done: Record<string, true>) => ls.filter((l) => done[l.id]).length;

export function Courses() {
  const st = useStore();
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('All');
  const needle = q.trim().toLowerCase();
  const list = courses.filter((c) =>
    (level === 'All' || c.level === level) &&
    (!needle || (c.title + ' ' + c.blurb + ' ' + c.lessonList.map((l) => l.title).join(' ')).toLowerCase().includes(needle)));
  return (
    <>
      <PageHead eyebrow="Courses" title="All courses are free and open">
        <p>{courses.length} courses built from {lessons.length} lessons. Start anywhere. Nothing is locked.</p>
      </PageHead>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <p><label htmlFor="c-q">Search courses and lessons</label>
          <input id="c-q" className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="For example: subnet, OSPF, ping, Wi-Fi" /></p>
        <p><label htmlFor="c-level">Difficulty</label>
          <select id="c-level" className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((x) => <option key={x}>{x}</option>)}
          </select></p>
      </form>
      <p className="muted" aria-live="polite">{list.length} {list.length === 1 ? 'course' : 'courses'} shown</p>
      {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lv) => {
        const cs = list.filter((c) => c.level === lv);
        if (!cs.length) return null;
        return (
          <section key={lv} className="band tight">
            <h2><LevelTag level={lv} /></h2>
            <div className="cards">
              {cs.map((c) => (
                <a key={c.id} className="card lift" href={'#course-' + c.id}>
                  <span className="mono muted">{c.module ? `Module ${c.module.n}` : 'Combined course'}</span>
                  <h3>{c.title}</h3>
                  <p>{c.blurb}</p>
                  <Progress value={doneOf(c.lessonList, st.done)} max={c.lessonList.length} label={'Progress in ' + c.title} />
                  <span className="card-foot"><span>{c.lessonList.length} lessons</span><span className="free">Free</span></span>
                </a>
              ))}
            </div>
          </section>
        );
      })}
      {!list.length && <p>No course matches. Clear the search or choose "All".</p>}
      <section className="band tight">
        <h2>Complete curriculum by module</h2>
        <p className="muted">Every lesson belongs to one of {modules.length} modules. Combined courses reuse these lessons, so progress is shared.</p>
        <ul className="module-index">
          {modules.map((m) => <li key={m.id}><a href={'#course-' + m.id}><span className="mono">{String(m.n).padStart(2, '0')}</span> {m.title}</a> <span className="muted small">{doneOf(m.lessons, st.done)}/{m.lessons.length}</span></li>)}
        </ul>
      </section>
    </>
  );
}

export function Course({ id }: { id: string }) {
  const st = useStore();
  const c = resolveCourse(id);
  if (!c) return <Missing />;
  const sc = st.scores['quiz-' + c.id];
  const cert = courseCert(c.id, st);
  return (
    <>
      <Crumbs items={[['Courses', '#courses'], [c.title]]} />
      <PageHead eyebrow={c.eyebrow} title={c.title}><p>{c.blurb}</p></PageHead>
      <div className="row"><LevelTag level={c.level} /><FreeNote /></div>
      <Progress value={doneOf(c.lessons, st.done)} max={c.lessons.length} label="Lessons completed" />
      <h2>Lessons</h2>
      <ol className="lesson-list">
        {c.lessons.map((l, i) => (
          <li key={l.id} className={st.done[l.id] ? 'done' : ''}>
            <a href={'#lesson-' + l.id}>
              <span className="mono num">{String(i + 1).padStart(2, '0')}</span>
              <span className="lt"><strong>{l.title}</strong><span className="muted">{c.isModule ? '' : moduleById.get(l.mod)!.title + ' · '}{l.intro}</span></span>
              <span className="state">{st.done[l.id] ? <><Icon name="check" /> Completed</> : LESSON_LABS[l.id] ? 'Lesson + lab' : 'Open'}</span>
            </a>
          </li>
        ))}
      </ol>
      <section className="band tight">
        <h2>Course quiz</h2>
        <p>{c.lessons.length} questions, one from each lesson, with explanations.{sc ? ` Your last score: ${sc.s} of ${sc.t}.` : ''}</p>
        <a className="btn" href={'#quiz-' + c.id}>Take the course quiz</a>
      </section>
      {cert && (
        <section className={'band tight cert-band' + (cert.eligible ? ' earned' : '')}>
          <h2>Free certificate</h2>
          <p>{cert.eligible ? 'You have completed this course. Your certificate is ready to download.' : 'Complete both steps to unlock your free certificate for this course.'}</p>
          <CertRequirements c={cert} />
          <a className={'btn' + (cert.eligible ? '' : ' ghost')} href={'#certificate-' + c.id}>{cert.eligible ? 'Download your certificate' : 'About this certificate'}</a>
        </section>
      )}
    </>
  );
}

export function ModuleQuiz({ id }: { id: string }) {
  const c = resolveCourse(id);
  if (!c) return <Missing />;
  const qs: PQ[] = c.lessons.flatMap((l) => l.quiz.map((q) => ({ t: 'mcq' as const, kind: l.title, q: q.q, o: q.o, a: q.a, e: q.e })));
  return (
    <>
      <PracticeTabs current="quizzes" />
      <Crumbs items={[['Practice & Interview', '#practice'], ['Course quizzes', '#quizzes'], [c.title]]} />
      <PageHead eyebrow="Course quiz" title={c.title + ' quiz'}><p>Want to review first? <a href={'#course-' + c.id}>Open the {c.title} lessons</a>.</p></PageHead>
      <Runner key={c.id} id={'quiz-' + c.id} qs={qs} />
    </>
  );
}

function QuickCheck({ quiz }: { quiz: Quiz }) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div className="quick">
      <p className="qtext">{quiz.q}</p>
      <div className="options" role="radiogroup" aria-label="Answer options">
        {quiz.o.map((o, i) => (
          <button key={i} type="button" role="radio" aria-checked={pick === i} disabled={pick !== null}
            className={'option' + (pick !== null && i === quiz.a ? ' right' : '') + (pick === i && i !== quiz.a ? ' wrong' : '')}
            onClick={() => setPick(i)}>
            <span className="mono">{String.fromCharCode(65 + i)}</span> {o}
          </button>
        ))}
      </div>
      {pick !== null && (
        <div className={'feedback ' + (pick === quiz.a ? 'ok' : 'no')} role="status">
          <p><strong>{pick === quiz.a ? 'Correct.' : 'Not quite.'}</strong> {quiz.e}</p>
          <button type="button" className="btn small ghost" onClick={() => setPick(null)}>Try again</button>
        </div>
      )}
    </div>
  );
}

function Reveal({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="reveal">
      <p><strong>{q}</strong></p>
      <button type="button" className="btn small ghost" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Hide answer' : 'Show answer'}</button>
      {open && <p className="answer">{a}</p>}
    </div>
  );
}

function related(l: Lesson): Lesson[] {
  const same = lessons.filter((x) => x.id !== l.id && x.scene === l.scene);
  const mod = moduleById.get(l.mod)!.lessons.filter((x) => x.id !== l.id && !same.includes(x));
  return [...same, ...mod].slice(0, 5);
}

export function LessonPage({ id }: { id: string }) {
  const st = useStore();
  const idx = lessons.findIndex((l) => l.id === id);
  if (idx < 0) return <Missing />;
  const l = lessons[idx];
  const m = moduleById.get(l.mod)!;
  const prev = lessons[idx - 1], next = lessons[idx + 1];
  const done = !!st.done[l.id];
  return (
    <article className="lesson">
      <Crumbs items={[['Courses', '#courses'], [m.title, '#course-' + m.id], [l.title]]} />
      <PageHead eyebrow={`Module ${m.n} · Lesson ${m.lessons.indexOf(l) + 1} of ${m.lessons.length}`} title={l.title}>
        <p>{l.intro}</p>
      </PageHead>
      <div className="row"><LevelTag level={m.level} />{done && <span className="state"><Icon name="check" /> Completed</span>}</div>

      <h2>What is it?</h2><p>{l.what}</p>
      <h2>Why is it used?</h2><p>{l.why}</p>
      <h2>How does it work? Step by step</h2>
      <ol className="steps">{l.how.map((s, i) => <li key={i}>{s}</li>)}</ol>

      <h2>Animated demonstration</h2>
      <SceneAnimation id={l.scene} />

      <h2>Real-world example</h2><p>{l.example}</p>
      <h2>Important terms</h2>
      <dl className="terms">{l.terms.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}</dl>

      <h2>Advantages and limitations</h2>
      <div className="proscons">
        <div><h3>Advantages</h3><ul>{l.pros.map((p) => <li key={p}>{p}</li>)}</ul></div>
        <div><h3>Limitations</h3><ul>{l.cons.map((p) => <li key={p}>{p}</li>)}</ul></div>
      </div>

      <h2>Practical example</h2><p className="practical">{l.practical}</p>

      <h2>Related concepts</h2>
      <ul className="related">{related(l).map((r) => <li key={r.id}><a href={'#lesson-' + r.id}>{r.title}</a></li>)}</ul>

      <h2>Interview question</h2>
      {l.iq.map(([q, a]) => <Reveal key={q} q={q} a={a} />)}

      <h2>Topic quiz</h2>
      {l.quiz.map((q) => <QuickCheck key={l.id + q.q} quiz={q} />)}
      <p className="muted small">Want more questions? Take the <a href={'#quiz-' + m.id}>{m.title} quiz</a>.</p>
      {LESSON_LABS[l.id] && <LabInline id={LESSON_LABS[l.id]} label="Hands-on lab for this topic" />}
      {ptForLesson(l.id).length > 0 && (
        <section className="pt-link">
          <p className="eyebrow">Build it in Cisco Packet Tracer</p>
          <ul>{ptForLesson(l.id).map((p) => <li key={p.id}><a href={'#ptlab-' + p.id}><strong>{p.title}</strong></a> <span className="muted small">· {p.level} · about {p.mins} min · {p.steps.length} steps with commands</span></li>)}</ul>
        </section>
      )}

      <div className="complete">
        <button type="button" className={'btn big' + (done ? ' ghost' : '')} aria-pressed={done} onClick={() => toggle('done', l.id)}>
          <Icon name="check" /> {done ? 'Completed. Click to undo' : 'Mark as Completed'}
        </button>
        {!st.track && <p className="muted small">Progress saving is switched off, so this is remembered only until you close the page. <a href="#progress">Change this</a>.</p>}
      </div>

      <nav className="prevnext" aria-label="Lesson navigation">
        {prev ? <a href={'#lesson-' + prev.id}><span className="muted"><Icon name="prev" /> Previous lesson</span><strong>{prev.title}</strong></a> : <span />}
        {next ? <a className="nx" href={'#lesson-' + next.id}><span className="muted">Next lesson <Icon name="next" /></span><strong>{next.title}</strong></a> : <span />}
      </nav>
    </article>
  );
}

export function Missing() {
  return (
    <>
      <PageHead title="Page not found"><p>That address does not match any page.</p></PageHead>
      <a className="btn" href="#courses">Go to Courses</a>
    </>
  );
}
