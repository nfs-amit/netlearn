import { useState } from 'react';
import { Runner } from '../components/Runner';
import { Crumbs, FreeNote, Icon, LevelTag, PageHead } from '../components/ui';
import { courses, interviewBank, modulesWithoutCard } from '../content';
import { labForQuestion } from '../content/labs';
import { LabInline } from '../components/LabConsole';
import { ROLES } from '../content/interview';
import { practiceSets } from '../content/practice';
import { toggle, useStore } from '../store';
import { Missing } from './Learn';


const PRACTICE_TABS: [string, string, string][] = [
  ['practice', 'Practice sets', '#practice'],
  ['ptlabs', 'Packet Tracer labs', '#ptlabs'],
  ['quizzes', 'Course quizzes', '#quizzes'],
  ['interview', 'Interview questions', '#interview'],
];

/** One section for every kind of question: practice sets, course quizzes and interview questions. */
export function PracticeTabs({ current }: { current: string }) {
  return (
    <nav className="practice-tabs" aria-label="Practice and interview sections">
      {PRACTICE_TABS.map(([id, label, href]) => (
        <a key={id} href={href} className={current === id ? 'tab on' : 'tab'} aria-current={current === id ? 'page' : undefined}>{label}</a>
      ))}
    </nav>
  );
}

export function Quizzes() {
  const st = useStore();
  const rows = [
    ...courses.map((c) => ({ id: c.id, title: c.title, level: c.level, n: c.lessonList.length })),
    ...modulesWithoutCard.map((m) => ({ id: m.id, title: 'Module ' + m.n + ': ' + m.title, level: m.level, n: m.lessons.length })),
  ];
  return (
    <>
      <PracticeTabs current="quizzes" />
      <PageHead eyebrow="Practice & Interview" title="Course quizzes">
        <p>One question from every lesson in a course, with an explanation for each answer. Take a quiz after finishing a course, or before starting it to see what you already know.</p>
      </PageHead>
      <div className="cards">
        {rows.map((r) => {
          const sc = st.scores['quiz-' + r.id];
          return (
            <a key={r.id} className="card lift" href={'#quiz-' + r.id}>
              <h3>{r.title}</h3>
              <span className="card-foot"><LevelTag level={r.level} /><span>{r.n} questions</span></span>
              <span className="muted small">{sc ? `Last score: ${sc.s} of ${sc.t}` : 'Not attempted yet'}</span>
            </a>
          );
        })}
      </div>
    </>
  );
}

export function PracticeList() {
  const st = useStore();
  return (
    <>
      <PracticeTabs current="practice" />
      <PageHead eyebrow="Practice & Interview · Practice sets" title="Build skill. Solve real network problems.">
        <p>Work through focused question sheets, advanced design challenges and realistic NOC incidents. Submit each answer to see the correct response and the reasoning behind it.</p>
      </PageHead>
      <FreeNote />
      <section className="pledge" aria-label="Practice learning path">
        <p className="eyebrow">A practical learning path</p>
        <h2>Learn the concept → make a decision → explain the reason</h2>
        <p>Start with fundamentals, then move into subnet planning, switching, routing, NOC ticket handling and network security. The advanced sheets use workplace-style situations rather than memorisation alone.</p>
        <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
          <span className="chip">{practiceSets.length} practice sheets</span>
          <span className="chip">{practiceSets.reduce((n, x) => n + x.qs.length, 0)} questions</span>
          <span className="chip">Answer explanations included</span>
        </div>
      </section>
      <div className="cards">
        {practiceSets.map((s) => {
          const sc = st.scores['practice-' + s.id];
          return (
            <a key={s.id} className="card lift" href={'#practice-' + s.id}>
              <h3>{s.title}</h3>
              <p>{s.blurb}</p>
              <span className="card-foot"><LevelTag level={s.level} /><span>{s.qs.length} questions</span></span>
              <span className="muted small">{sc ? `Last score: ${sc.s} of ${sc.t}` : 'Not attempted yet'}</span>
            </a>
          );
        })}
      </div>
      <section className="band tight">
        <h2>How to use these practice sheets</h2>
        <ol>
          <li>Attempt each question before revealing or checking the answer.</li>
          <li>Read the explanation and write down why the other options are weaker.</li>
          <li>For scenario questions, state the evidence you would collect before changing a live network.</li>
          <li>Retake the sheet after reviewing the related lesson.</li>
        </ol>
        <p>Every course also has a <a href="#quizzes">course quiz</a>, and the <a href="#tools">Networking Tools</a> let you check your subnetting answers.</p>
      </section>
    </>
  );
}

export function PracticeRun({ id }: { id: string }) {
  const s = practiceSets.find((x) => x.id === id);
  if (!s) return <Missing />;
  return (
    <>
      <PracticeTabs current="practice" />
      <Crumbs items={[['Practice & Interview', '#practice'], ['Practice sets', '#practice'], [s.title]]} />
      <PageHead eyebrow={`Practice set · ${s.level}`} title={s.title}><p>{s.blurb}</p></PageHead>
      <Runner key={s.id} id={'practice-' + s.id} qs={s.qs} />
    </>
  );
}

const PAGE = 30;

export function Interview() {
  const st = useStore();
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('All');
  const [role, setRole] = useState('All');
  const [type, setType] = useState('All');
  const [only, setOnly] = useState('All');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [all, setAll] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const needle = q.trim().toLowerCase();
  const list = interviewBank.filter((x) =>
    (level === 'All' || x.level === level) &&
    (role === 'All' || (role === 'Lesson topics' ? x.role.startsWith('Topic:') : x.role === role)) &&
    (type === 'All' || x.type === type) &&
    (only === 'All' || (only === 'Bookmarked' ? st.marks[x.id] : only === 'Completed' ? st.idone[x.id] : !st.idone[x.id])) &&
    (!needle || (x.q + ' ' + x.a).toLowerCase().includes(needle)));
  const shown = list.slice(0, limit);
  const sel = (id: string, label: string, val: string, set: (v: string) => void, opts: string[]) => (
    <p><label htmlFor={id}>{label}</label>
      <select id={id} className="input" value={val} onChange={(e) => { set(e.target.value); setLimit(PAGE); }}>
        {opts.map((o) => <option key={o}>{o}</option>)}
      </select></p>
  );
  return (
    <>
      <PracticeTabs current="interview" />
      <PageHead eyebrow="Practice & Interview · Interview questions" title="Interview and placement preparation">
        <p>{interviewBank.length} questions with model answers for technical and HR rounds. Hide the answers, say yours aloud, then compare.</p>
      </PageHead>
      <FreeNote />
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <p className="wide"><label htmlFor="i-q">Search questions and answers</label>
          <input id="i-q" className="input" type="search" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="For example: OSPF, DHCP, shift" /></p>
        {sel('i-level', 'Difficulty', level, setLevel, ['All', 'Beginner', 'Intermediate', 'Advanced'])}
        {sel('i-role', 'Role', role, setRole, ['All', ...ROLES, 'Lesson topics'])}
        {sel('i-type', 'Type', type, setType, ['All', 'Technical', 'Scenario', 'HR'])}
        {sel('i-only', 'Show', only, setOnly, ['All', 'Bookmarked', 'Not completed', 'Completed'])}
      </form>
      <div className="row between">
        <p className="muted" aria-live="polite">{list.length} questions · {Object.keys(st.idone).length} completed · {Object.keys(st.marks).length} bookmarked</p>
        <button type="button" className="btn small ghost" aria-pressed={all} onClick={() => { setAll(!all); setOpen({}); }}>{all ? 'Hide all answers' : 'Show all answers'}</button>
      </div>
      <ol className="iq-list">
        {shown.map((x) => {
          const isOpen = open[x.id] ?? all;
          return (
            <li key={x.id} className={st.idone[x.id] ? 'done' : ''}>
              <p className="iq-meta"><LevelTag level={x.level} /><span className="chip">{x.type}</span><span className="muted">{x.role}</span></p>
              <h2 className="iq-q">{x.q}</h2>
              {isOpen && <p className="answer">{x.a}</p>}
              <div className="row">
                <button type="button" className="btn small" aria-expanded={isOpen} onClick={() => setOpen({ ...open, [x.id]: !isOpen })}>{isOpen ? 'Hide answer' : 'Show answer'}</button>
                <button type="button" className="btn small ghost" aria-pressed={!!st.marks[x.id]} onClick={() => toggle('marks', x.id)}>
                  <Icon name="bookmark" fill={!!st.marks[x.id]} /> {st.marks[x.id] ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button type="button" className="btn small ghost" aria-pressed={!!st.idone[x.id]} onClick={() => toggle('idone', x.id)}>
                  <Icon name="check" /> {st.idone[x.id] ? 'Completed' : 'Mark as completed'}
                </button>
              </div>
              {labForQuestion(x.q) && <LabInline key={x.id} id={labForQuestion(x.q)!} />}
            </li>
          );
        })}
      </ol>
      {!list.length && <p>No question matches these filters.</p>}
      {list.length > limit && <button type="button" className="btn ghost" onClick={() => setLimit(limit + PAGE)}>Show {Math.min(PAGE, list.length - limit)} more</button>}
    </>
  );
}
