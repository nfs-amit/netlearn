import { SceneAnimation } from '../components/SceneAnimation';
import { Icon, LevelTag } from '../components/ui';
import { CATEGORIES, interviewBank, lessons, modules } from '../content';
import { practiceSets } from '../content/practice';
import { scenes } from '../content/scenes';
import { LABS } from '../content/labs';
import { PT_LABS } from '../content/ptlabs';
import { CERT_PASS_PERCENT } from '../config';

const WHY: [string, string][] = [
  ['Start from zero', 'Lessons use simple English and assume no earlier networking knowledge.'],
  ['See it move', 'Animated diagrams show packets, frames and handshakes step by step, with captions.'],
  ['Practise, then check', 'Quizzes, subnetting drills and scenarios give instant feedback with explanations.'],
  ['Works on slow connections', 'No videos, no web fonts and no outside services. Pages are light text and SVG.'],
  ['No account', 'Open the site and learn. Progress is kept only in your own browser, if you want it.'],
  ['Built for jobs', 'Interview questions, NOC processes, resume guidance and CCNA study direction.'],
];

const CAREERS: [string, string, string][] = [
  ['IT Support Engineer', 'Solve user connectivity problems and learn the basics on real tickets.', 'm14-it-support-engineer'],
  ['NOC Engineer', 'Monitor networks around the clock and respond to alarms.', 'm14-noc-engineer'],
  ['Network Administrator', 'Keep an organisation\'s network running day to day.', 'm14-network-administrator'],
  ['Network Engineer', 'Design, build and troubleshoot routing and switching.', 'm14-network-engineer'],
  ['Network Security Engineer', 'Protect networks with firewalls, VPNs and segmentation.', 'm14-network-security-engineer'],
];

export function Home({ startHref }: { startHref: string }) {
  const popular = ['m1', 'm3', 'm5', 'm6'].map((id) => modules.find((m) => m.id === id)!);
  const practiceCount = practiceSets.reduce((n, s) => n + s.qs.length, 0);
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">NetLearn · Free Computer Networking Academy</p>
          <h1 tabIndex={-1} id="page-title">Learn Computer Networking From Zero to Advanced – Completely Free.</h1>
          <p className="lede">Explore computer networking through simple explanations, animated demonstrations, practical exercises and interview preparation. Learn at your own pace without paying anything.</p>
          <div className="row">
            <a className="btn big" href={startHref}>Start Learning – Free <Icon name="arrow" /></a>
            <a className="btn big ghost" href="#courses">Explore Courses</a>
          </div>
          <p className="muted small">No login. No registration. No payment. Every lesson is open.</p>
        </div>
        <div className="hero-art"><SceneAnimation id="packet" autoplay /></div>
      </section>

      <section className="band">
        <h2>Welcome to NetLearn</h2>
        <div className="cols">
          <p>NetLearn is a free academy for anyone who wants to understand how computer networks work. It does not matter where you live, what you studied, how old you are or whether you have touched a router before.</p>
          <p>The curriculum has {modules.length} modules and {lessons.length} lessons, from "what is a network?" to BGP, MPLS and automation. Every lesson follows the same clear structure and ends with a question to check your understanding.</p>
        </div>
      </section>

      <section className="band">
        <h2>Why Learn With NetLearn?</h2>
        <ul className="why">
          {WHY.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
        </ul>
      </section>

      <section className="band">
        <h2>Explore Networking Categories</h2>
        <ul className="cats">
          {CATEGORIES.map((c) => {
            const ms = modules.filter((m) => m.cat === c);
            return (
              <li key={c}>
                <h3>{c}</h3>
                <ul>{ms.map((m) => <li key={m.id}><a href={'#course-' + m.id}>{m.title}</a></li>)}</ul>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="band">
        <h2>Popular Courses</h2>
        <p className="muted">Good places to begin. These are the modules most learners need first.</p>
        <div className="cards">
          {popular.map((m) => (
            <a key={m.id} className="card lift" href={'#course-' + m.id}>
              <span className="mono muted">Module {m.n}</span>
              <h3>{m.title}</h3>
              <p>{m.blurb}</p>
              <span className="card-foot"><LevelTag level={m.level} /> <span>{m.lessons.length} lessons</span></span>
            </a>
          ))}
        </div>
        <p><a className="more" href="#courses">See all {modules.length} courses <Icon name="arrow" /></a></p>
      </section>

      <section className="band split">
        <div>
          <h2>Learn Through Animation</h2>
          <p>Networking is easier when you can watch it happen. NetLearn has {Object.keys(scenes).length} animated diagrams. Each one has Play, Pause, Replay and step-by-step controls, a caption for every step and a full text version.</p>
          <p>If you prefer less motion, your device setting is respected: animations wait for you and move one step at a time.</p>
          <p><a className="more" href="#lesson-m6-dhcp">Open the DHCP lesson <Icon name="arrow" /></a></p>
        </div>
        <SceneAnimation id="tcp" />
      </section>

      <section className="band">
        <h2>Practice Your Knowledge</h2>
        <p>{practiceSets.length} practice sets with {practiceCount} questions: multiple choice, true or false, matching, fill in the blanks, subnetting calculations, command and device identification, and troubleshooting scenarios. Every answer comes with an explanation.</p>
        <p>For hands-on practice, {PT_LABS.length} Cisco Packet Tracer lab sheets walk you through building real configurations step by step, with every command and an explanation of why it works.</p>
        <div className="row">
          <a className="btn" href="#practice">Open Practice & Interview</a>
          <a className="btn ghost" href="#ptlabs">Packet Tracer labs</a>
          <a className="btn ghost" href="#tools">Use the Subnet Calculator</a>
        </div>
      </section>

      <section className="band">
        <h2>Earn Free Certificates</h2>
        <p>Complete every lesson in a course and score at least {CERT_PASS_PERCENT}% in its quiz to unlock a certificate of completion. Download it as a PDF or image straight away. There is no exam fee, no account and no payment.</p>
        <p><a className="btn" href="#certificates">See the certificates</a></p>
      </section>

      <section className="band">
        <h2>Prepare for Networking Interviews</h2>
        <p>{interviewBank.length} interview questions with model answers, grouped by level and by role. Search them, hide the answers to test yourself, bookmark the hard ones and mark the ones you have mastered. Common HR questions are included.</p>
        <p><a className="btn" href="#interview">Open Interview Questions</a></p>
      </section>

      <section className="band">
        <h2>Career Opportunities</h2>
        <p className="muted">Networking skills lead to several roles. Each has its own lesson in the Career Preparation module.</p>
        <ul className="careers">
          {CAREERS.map(([t, d, id]) => <li key={t}><a href={'#lesson-' + id}><strong>{t}</strong></a><span>{d}</span></li>)}
        </ul>
      </section>

      <section className="band split">
        <div>
          <p className="eyebrow">Hands-on practice · 100% free</p>
          <h2>Virtual labs, right where you need them</h2>
          <p>When a topic is best learned by doing, a virtual lab appears next to the question. Read a realistic fault, type real troubleshooting commands into a simulated network, then compare your answer with the walkthrough. No router hardware, account or paid cloud lab is needed.</p>
          <p><a className="btn" href="#lesson-m11-vlan-problems">Try the VLAN fault lab <Icon name="arrow" /></a></p>
        </div>
        <div className="pledge">
          <h3>Labs you will meet in lessons and practice</h3>
          <ul>
            {LABS.map((l) => <li key={l.id}>{l.title}</li>)}
          </ul>
          <p className="muted small">Educational simulation. Commands run against a simulated network, not live equipment.</p>
        </div>
      </section>

      <section className="band pledge">
        <h2>Free Learning for Everyone</h2>
        <p>Education must be free and accessible to everyone. NetLearn has no paid courses, no memberships, no locked lessons, no trial periods and no payment page. Nothing on this site asks you to sign up.</p>
        <a className="btn big" href={startHref}>Start Learning – Free <Icon name="arrow" /></a>
      </section>
    </>
  );
}
