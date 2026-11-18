import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ALL_ID, allCert, certFor, certificatePdf, courseCert, downloadBlob, drawCertificate, fileName, formatDate, today, type CertStatus } from '../certs';
import { Crumbs, FreeNote, Icon, LevelTag, PageHead, Progress } from '../components/ui';
import { CERT_PASS_PERCENT } from '../config';
import { courses } from '../content';
import { update, useStore } from '../store';
import { Missing } from './Learn';

function NameField({ id }: { id: string }) {
  const st = useStore();
  return (
    <p className="cert-name">
      <label htmlFor={id}>Name to print on your certificates</label>
      <input id={id} className="input" value={st.name} maxLength={60} autoComplete="name"
        placeholder="Your full name" onChange={(e) => update((s) => ({ ...s, name: e.target.value }))} />
      <span className="muted small">Saved only in this browser. It is never sent anywhere.</span>
    </p>
  );
}

function Check({ ok, children }: { ok: boolean; children: ReactNode }) {
  return <li className={ok ? 'ok' : 'todo'}><span className="mark" aria-hidden="true">{ok ? '✓' : '○'}</span><span><span className="sr">{ok ? 'Done: ' : 'Not yet: '}</span>{children}</span></li>;
}

/** The two conditions for a course certificate, with links to finish whatever is missing. */
export function CertRequirements({ c }: { c: CertStatus }) {
  if (c.id === ALL_ID) {
    const a = c as ReturnType<typeof allCert>;
    return <ul className="cert-checks"><Check ok={a.coursesEarned === a.coursesTotal}>Earn all {a.coursesTotal} course certificates ({a.coursesEarned} of {a.coursesTotal} earned)</Check></ul>;
  }
  return (
    <ul className="cert-checks">
      <Check ok={c.lessonsComplete}>Mark every lesson as completed: {c.lessonsDone} of {c.lessonsTotal}{!c.lessonsComplete && <> · <a href={'#course-' + c.id}>Continue the course</a></>}</Check>
      <Check ok={c.quizPassed}>Score at least {CERT_PASS_PERCENT}% in the course quiz: {c.quiz ? `best ${c.quiz.best}/${c.quiz.total} (${c.quiz.pct}%)` : 'not taken yet'}{!c.quizPassed && <> · <a href={'#quiz-' + c.id}>{c.quiz ? 'Retake the quiz' : 'Take the quiz'}</a></>}</Check>
    </ul>
  );
}

function StatusPill({ c }: { c: CertStatus }) {
  if (c.eligible) return <span className="pill earned"><Icon name="check" /> Earned</span>;
  if (c.lessonsDone || c.quiz) return <span className="pill progress">In progress</span>;
  return <span className="pill">Not started</span>;
}

export function Certificates() {
  const st = useStore();
  const list = courses.map((c) => courseCert(c.id, st)!);
  const all = allCert(st);
  const earned = list.filter((c) => c.eligible).length;
  return (
    <>
      <PageHead eyebrow="Certificates" title="Free certificates of completion">
        <p>Finish a course and download your certificate as a PDF or image. It costs nothing, needs no account and has no exam fee.</p>
      </PageHead>
      <FreeNote />
      <section className="cert-how">
        <h2>How to earn a certificate</h2>
        <ol>
          <li><strong>Complete every lesson</strong> in the course and press <em>Mark as Completed</em> at the end of each one.</li>
          <li><strong>Pass the course quiz</strong> with at least {CERT_PASS_PERCENT}%. You can retake it as often as you like; your best score counts.</li>
          <li><strong>Enter your name</strong> below, open the certificate and download it.</li>
        </ol>
        <NameField id="cert-name-list" />
        <p className="muted small">Your progress and certificates are stored in this browser on this device. If you clear your browser data or switch device, they will not be there, so download each certificate when you earn it. These are free certificates of completion from NetLearn, not accredited qualifications or vendor certifications such as Cisco CCNA.</p>
      </section>

      <div className="row between"><h2>Your certificates</h2><span className="mono muted">{earned} of {list.length} earned</span></div>
      <div className="cards">
        {list.map((c) => (
          <article key={c.id} className={'card cert-card' + (c.eligible ? ' earned' : '')}>
            <div className="row between"><LevelTag level={c.level} /><StatusPill c={c} /></div>
            <h3>{c.title}</h3>
            <Progress value={c.lessonsDone} max={c.lessonsTotal} label={'Lessons completed in ' + c.title} />
            <p className="muted small">Quiz: {c.quiz ? `best ${c.quiz.pct}%` : 'not taken'} · needs {CERT_PASS_PERCENT}%</p>
            {c.eligible
              ? <a className="btn small" href={'#certificate-' + c.id}>View and download</a>
              : <a className="btn small ghost" href={'#certificate-' + c.id}>See what is left</a>}
          </article>
        ))}
      </div>

      <section className={'cert-capstone' + (all.eligible ? ' earned' : '')}>
        <div>
          <p className="eyebrow">Programme certificate</p>
          <h2>{all.title}</h2>
          <p>Earn every course certificate to unlock the full-programme certificate.</p>
          <Progress value={all.coursesEarned} max={all.coursesTotal} label="Course certificates earned" />
        </div>
        <a className={'btn' + (all.eligible ? '' : ' ghost')} href={'#certificate-' + ALL_ID}>{all.eligible ? 'View and download' : 'See requirements'}</a>
      </section>
    </>
  );
}

export function CertificatePage({ id }: { id: string }) {
  const st = useStore();
  const c = certFor(id, st);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [img, setImg] = useState('');
  const [msg, setMsg] = useState('');
  const name = st.name.trim();
  const date = c?.earnedOn ?? today();
  const ready = !!c?.eligible && name.length > 1;

  const key = useMemo(() => (ready && c ? [name, c.id, date, c.quiz?.best].join('|') : ''), [ready, name, c?.id, date, c?.quiz?.best]);
  useEffect(() => {
    if (!key || !c) { setImg(''); return; }
    const t = setTimeout(() => {
      const cv = canvas.current ?? document.createElement('canvas');
      canvas.current = cv;
      drawCertificate(cv, { name, status: c, date });
      setImg(cv.toDataURL('image/png'));
    }, 250);
    return () => clearTimeout(t);
  }, [key]);

  if (!c) return <Missing />;

  const download = (kind: 'pdf' | 'png') => {
    if (!canvas.current) return;
    try {
      if (kind === 'pdf') downloadBlob(certificatePdf(canvas.current, c.title + ' - ' + name), fileName(name, c.title, 'pdf'));
      else canvas.current.toBlob((b) => b && downloadBlob(b, fileName(name, c.title, 'png')), 'image/png');
      setMsg('Your download should start now. If nothing happens, right-click (or long-press) the certificate image and save it.');
    } catch {
      setMsg('Your browser blocked the download. Right-click (or long-press) the certificate image and choose Save image.');
    }
  };

  return (
    <>
      <Crumbs items={[['Certificates', '#certificates'], [c.title]]} />
      <PageHead eyebrow={c.eligible ? 'Certificate unlocked' : 'Certificate locked'} title={c.title}>
        <p>{c.eligible
          ? `Completed${c.earnedOn ? ' on ' + formatDate(c.earnedOn) : ''}. Download your free certificate below.`
          : 'Finish the steps below to unlock this certificate.'}</p>
      </PageHead>
      <CertRequirements c={c} />

      {!c.eligible && (
        <div className="notice">
          <p><strong>This certificate is locked.</strong> It unlocks automatically as soon as both conditions are met. Nothing to pay and nothing to submit.</p>
          {c.id !== ALL_ID && <div className="row"><a className="btn" href={'#course-' + c.id}>Go to the course</a><a className="btn ghost" href={'#quiz-' + c.id}>Take the course quiz</a></div>}
        </div>
      )}

      {c.eligible && (
        <>
          <NameField id="cert-name-one" />
          {!ready && <p className="err">Enter your name above to create the certificate.</p>}
          {ready && (
            <section className="cert-preview" aria-label="Certificate preview">
              {img ? <img src={img} alt={`Certificate of completion: ${name}, ${c.title}`} /> : <p className="muted">Preparing your certificate…</p>}
              <div className="row">
                <button type="button" className="btn" disabled={!img} onClick={() => download('pdf')}>Download PDF</button>
                <button type="button" className="btn ghost" disabled={!img} onClick={() => download('png')}>Download image (PNG)</button>
              </div>
              {msg && <p role="status" className="muted small">{msg}</p>}
              <p className="muted small">Check the spelling of your name before downloading. You can change it at any time and download again.</p>
            </section>
          )}
        </>
      )}
    </>
  );
}
