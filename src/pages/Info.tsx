import { useState } from 'react';
import { LevelTag, PageHead, Progress } from '../components/ui';
import { CONTACT_EMAIL } from '../config';
import { interviewBank, lessons, moduleById, modules } from '../content';
import { practiceSets } from '../content/practice';
import { resetProgress, update, useStore } from '../store';

export function About() {
  return (
    <div className="prose">
      <PageHead eyebrow="About" title="Networking knowledge for everyone">
        <p>NetLearn is a free computer networking academy. Learn without limits.</p>
      </PageHead>
      <h2>Our mission</h2>
      <p>Good networking education is often locked behind expensive courses, subscriptions and coaching. NetLearn exists so that any student can learn networking from absolute beginner to advanced level without spending money, whatever their financial background, qualification, location, age or experience.</p>
      <h2>What "free" means here</h2>
      <ul>
        <li>Every course, lesson, animation, quiz, practice set, interview question and tool is open to everyone.</li>
        <li>There is no login, registration, subscription, paid certificate, trial or locked content.</li>
        <li>Certificates of completion are free. Finish a course and pass its quiz to download yours as a PDF or image.</li>
        <li>There is no payment page anywhere on this site.</li>
      </ul>
      <h2>How to use NetLearn</h2>
      <ol>
        <li>Follow the <a href="#courses">courses</a> in order if you are new, or jump to the topic you need.</li>
        <li>Watch the animation in each lesson and step through it slowly.</li>
        <li>Answer the topic quiz and open the virtual lab when a lesson has one, then take the course quiz.</li>
        <li>Use <a href="#practice">Practice &amp; Interview</a> (practice sets, course quizzes and interview questions) and the <a href="#tools">tools</a> to build speed, especially in subnetting.</li>
        <li>Before interviews, work through the <a href="#interview">interview questions</a> and the Career Preparation module.</li>
      </ol>
      <h2>Your progress and privacy</h2>
      <p>NetLearn has no user accounts and no database. Completed lessons, quiz scores, bookmarks and your theme choice are saved only in this browser on this device, using the browser's local storage. They are not sent anywhere. If you use another device or browser, or clear your browser data, the progress will not be there. You can switch saving off or erase everything on the <a href="#progress">My Progress</a> page.</p>
      <h2>Designed for every device and connection</h2>
      <p>The site is text and lightweight vector drawings. It has no videos, no advertising scripts, no web fonts and no outside services, so it stays usable on older phones and slow connections. Every animation has captions and a full text version, and the site respects the reduced-motion setting of your device.</p>
      <h2>Accuracy</h2>
      <p>Lessons are written to match published standards and common vendor behaviour. Networking has many details and exceptions, so if you find a mistake, please report it to the site owner. Certification details such as exam fees and formats change; always confirm them on the vendor's own website.</p>
    </div>
  );
}

export function Contact() {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('Question about a lesson');
  const [msg, setMsg] = useState('');
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState('');
  const text = `Topic: ${topic}\nFrom: ${name || '(no name given)'}\n\n${msg}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied('Copied. Paste it into your email or message.'); }
    catch { setCopied('Copying was blocked by the browser. Select the text below and copy it manually.'); }
  };
  return (
    <div className="prose">
      <PageHead eyebrow="Contact" title="Contact NetLearn">
        <p>Report a mistake, suggest a topic or ask a question.</p>
      </PageHead>
      <div className="notice">
        <p><strong>This form does not send or store anything.</strong> NetLearn has no server. The form only helps you write your message so that you can copy it and send it yourself.</p>
        {CONTACT_EMAIL
          ? <p>Send your message to <a href={'mailto:' + CONTACT_EMAIL}>{CONTACT_EMAIL}</a> (address shown here so you can copy it: <span className="mono">{CONTACT_EMAIL}</span>).</p>
          : <p>No public contact address has been configured for this site yet. The site owner can add one in <span className="mono">src/config.ts</span>.</p>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setReady(true); setCopied(''); }}>
        <p><label htmlFor="ct-name">Your name (optional)</label><input id="ct-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></p>
        <p><label htmlFor="ct-topic">Topic</label>
          <select id="ct-topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {['Question about a lesson', 'Report a mistake', 'Suggest a new topic', 'Accessibility problem', 'Other'].map((t) => <option key={t}>{t}</option>)}
          </select></p>
        <p><label htmlFor="ct-msg">Message</label><textarea id="ct-msg" className="input" rows={6} required value={msg} onChange={(e) => { setMsg(e.target.value); setReady(false); }} /></p>
        <button type="submit" className="btn">Prepare message</button>
      </form>
      {ready && (
        <section aria-live="polite">
          <h2>Your message is ready to copy</h2>
          <pre className="prepared">{text}</pre>
          <button type="button" className="btn" onClick={copy}>Copy message</button>
          {copied && <p role="status">{copied}</p>}
          <p className="muted">Nothing has been sent. Copy the message and send it through your own email or messaging app.</p>
        </section>
      )}
    </div>
  );
}

export function ProgressPage() {
  const st = useStore();
  const [confirm, setConfirm] = useState(false);
  const doneCount = lessons.filter((l) => st.done[l.id]).length;
  return (
    <div className="prose">
      <PageHead eyebrow="My Progress" title="Your progress on this device">
        <p>Saved only in this browser. No account, nothing uploaded.</p>
      </PageHead>
      <Progress value={doneCount} max={lessons.length} label="Lessons completed" />
      <h2>Courses</h2>
      <ul className="plain">
        {modules.map((m) => {
          const d = m.lessons.filter((l) => st.done[l.id]).length;
          const sc = st.scores['quiz-' + m.id];
          return <li key={m.id}><a href={'#course-' + m.id}>{m.title}</a> <span className="muted">· {d} of {m.lessons.length} lessons{sc ? ` · quiz ${sc.s}/${sc.t}` : ''}</span></li>;
        })}
      </ul>
      <h2>Practice sets</h2>
      <ul className="plain">
        {practiceSets.map((s) => {
          const sc = st.scores['practice-' + s.id];
          return <li key={s.id}><a href={'#practice-' + s.id}>{s.title}</a> <span className="muted">· {sc ? `last score ${sc.s}/${sc.t}` : 'not attempted'}</span></li>;
        })}
      </ul>
      <h2>Interview questions</h2>
      <p>{Object.keys(st.idone).length} of {interviewBank.length} marked completed · {Object.keys(st.marks).length} bookmarked. <a href="#interview">Open the question bank</a>.</p>

      <h2>Certificates</h2>
      <p>{Object.keys(st.certs).length} earned. <a href="#certificates">Open your certificates</a>.</p>
      <h2>Saving and privacy</h2>
      <p>Progress tracking is optional. When it is on, your completed lessons, scores and bookmarks are stored in this browser's local storage on this device. They do not follow you to another browser or device, and clearing browser data removes them.</p>
      <p>
        <label className="check">
          <input type="checkbox" checked={st.track} onChange={(e) => update((s) => ({ ...s, track: e.target.checked }))} />
          Save my progress in this browser
        </label>
      </p>
      {!st.track && <p className="muted">Saving is off. Progress is kept only until you close or reload this page. Your theme choice is still remembered.</p>}
      <h2>Reset</h2>
      {!confirm
        ? <button type="button" className="btn danger" onClick={() => setConfirm(true)}>Reset saved progress…</button>
        : (
          <div className="notice" role="alertdialog" aria-label="Confirm reset">
            <p><strong>Erase all completed lessons, scores, bookmarks, certificates and your saved name on this device?</strong> This cannot be undone.</p>
            <div className="row">
              <button type="button" className="btn danger" onClick={() => { resetProgress(); setConfirm(false); }}>Yes, erase my progress</button>
              <button type="button" className="btn ghost" onClick={() => setConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
    </div>
  );
}

const TOOL_WORDS = 'subnet calculator cidr binary decimal converter class checker port reference osi layer command reference';

export function SearchPage({ q }: { q: string }) {
  const n = q.trim().toLowerCase();
  const ls = n ? lessons.filter((l) => (l.title + ' ' + l.intro + ' ' + l.what + ' ' + l.terms.map((t) => t[0]).join(' ')).toLowerCase().includes(n)) : [];
  ls.sort((a, b) => Number(b.title.toLowerCase().includes(n)) - Number(a.title.toLowerCase().includes(n)));
  const iq = n ? interviewBank.filter((x) => !x.id.startsWith('l-') && x.q.toLowerCase().includes(n)).slice(0, 8) : [];
  const ps = n ? practiceSets.filter((s) => (s.title + ' ' + s.blurb).toLowerCase().includes(n)) : [];
  const tool = n && TOOL_WORDS.includes(n);
  const total = ls.length + iq.length + ps.length + (tool ? 1 : 0);
  return (
    <>
      <PageHead eyebrow="Search" title={n ? `Results for "${q.trim()}"` : 'Search NetLearn'}>
        <p aria-live="polite">{n ? `${total} ${total === 1 ? 'result' : 'results'}` : 'Type a topic in the search box at the top, for example VLAN, DNS or subnet.'}</p>
      </PageHead>
      {tool && <p><a className="more" href="#tools">Networking Tools: calculators and references</a></p>}
      {ls.length > 0 && (
        <section className="band tight">
          <h2>Lessons</h2>
          <ul className="results">
            {ls.slice(0, 40).map((l) => (
              <li key={l.id}><a href={'#lesson-' + l.id}><strong>{l.title}</strong></a> <LevelTag level={moduleById.get(l.mod)!.level} />
                <span className="muted">{moduleById.get(l.mod)!.title} · {l.intro}</span></li>
            ))}
          </ul>
        </section>
      )}
      {ps.length > 0 && <section className="band tight"><h2>Practice sets</h2><ul className="results">{ps.map((s) => <li key={s.id}><a href={'#practice-' + s.id}><strong>{s.title}</strong></a><span className="muted">{s.blurb}</span></li>)}</ul></section>}
      {iq.length > 0 && <section className="band tight"><h2>Interview questions</h2><ul className="results">{iq.map((x) => <li key={x.id}><strong>{x.q}</strong><span className="muted">{x.a}</span></li>)}</ul><p><a className="more" href="#interview">Open all interview questions</a></p></section>}
      {n && total === 0 && <p>Nothing matched. Try a shorter word, or browse the <a href="#courses">courses</a>.</p>}
    </>
  );
}
