import { useEffect, useState } from 'react';
import { Icon, useRoute } from './components/ui';
import { SITE_NAME, TAGLINE } from './config';
import { lessons } from './content';
import { Home } from './pages/Home';
import { About, Contact, ProgressPage, SearchPage } from './pages/Info';
import { Course, Courses, LessonPage, Missing, ModuleQuiz } from './pages/Learn';
import { Interview, PracticeList, PracticeRun, Quizzes } from './pages/Practice';
import { Tools } from './pages/Tools';
import { PTLabList, PTLabPage } from './pages/PTLabs';
import { CertificatePage, Certificates } from './pages/Certificates';
import { newlyEarned, today } from './certs';
import { applyTheme, effectiveTheme, update, useStore } from './store';

const NAV: [string, string][] = [
  ['home', 'Home'], ['courses', 'Courses'], ['tools', 'Networking Tools'], ['practice', 'Practice & Interview'], ['certificates', 'Certificates'], ['about', 'About'],
];
const FOOTER: [string, string][] = [
  ['courses', 'Courses'], ['tools', 'Networking Tools'], ['practice', 'Practice sets'], ['ptlabs', 'Packet Tracer labs'], ['quizzes', 'Course quizzes'],
  ['interview', 'Interview questions'], ['certificates', 'Certificates'], ['about', 'About'], ['contact', 'Contact'], ['progress', 'My Progress'],
];

function section(route: string): string {
  if (/^(course|lesson)-/.test(route)) return 'courses';
  if (/^(practice|quiz|interview|lab|ptlab)/.test(route)) return 'practice';
  if (route.startsWith('certificate')) return 'certificates';
  return route;
}

function Logo() {
  return (
    <a className="logo" href="#home" aria-label={SITE_NAME + ' home'}>
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <path d="M8 8l16 4M8 8l6 16M24 12l-10 12" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="8" cy="8" r="4.5" className="lg-a" /><circle cx="24" cy="12" r="4.5" className="lg-b" /><circle cx="14" cy="24" r="4.5" className="lg-a" />
      </svg>
      <span>{SITE_NAME}</span>
    </a>
  );
}

export function App() {
  const route = useRoute();
  const st = useStore();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const theme = effectiveTheme(st.theme);
  const nextLesson = lessons.find((l) => !st.done[l.id]) ?? lessons[0];
  const startHref = '#lesson-' + nextLesson.id;

  useEffect(() => { applyTheme(st.theme); }, [st.theme]);
  // Record the date a certificate is first unlocked, so it stays on the certificate.
  useEffect(() => {
    const ids = newlyEarned(st);
    if (ids.length) update((s) => ({ ...s, certs: { ...s.certs, ...Object.fromEntries(ids.map((i) => [i, today()])) } }));
  }, [st.done, st.scores]);
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
    if (route !== 'search') document.getElementById('page-title')?.focus({ preventScroll: true });
  }, [route]);

  let page;
  const arg = (p: string) => route.slice(p.length);
  if (route === 'home') page = <Home startHref={startHref} />;
  else if (route === 'courses') page = <Courses />;
  else if (route.startsWith('course-')) page = <Course id={arg('course-')} />;
  else if (route.startsWith('lesson-')) page = <LessonPage id={arg('lesson-')} />;
  else if (route.startsWith('quiz-')) page = <ModuleQuiz id={arg('quiz-')} />;
  else if (route === 'practice' || route === 'lab') page = <PracticeList />;
  else if (route.startsWith('practice-')) page = <PracticeRun id={arg('practice-')} />;
  else if (route === 'interview') page = <Interview />;
  else if (route === 'tools') page = <Tools />;
  else if (route === 'quizzes') page = <Quizzes />;
  else if (route === 'ptlabs') page = <PTLabList />;
  else if (route.startsWith('ptlab-')) page = <PTLabPage id={arg('ptlab-')} />;
  else if (route === 'certificates') page = <Certificates />;
  else if (route.startsWith('certificate-')) page = <CertificatePage id={arg('certificate-')} />;
  else if (route === 'about') page = <About />;
  else if (route === 'contact') page = <Contact />;
  else if (route === 'progress') page = <ProgressPage />;
  else if (route === 'search') page = <SearchPage q={query} />;
  else page = <Missing />;

  const sec = section(route);
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-head">
        <div className="wrap head-row">
          <Logo />
          <button type="button" className="icon-btn menu-btn" aria-expanded={menu} aria-controls="site-nav" onClick={() => setMenu(!menu)}>
            <Icon name={menu ? 'close' : 'menu'} /><span>Menu</span>
          </button>
          <nav id="site-nav" className={menu ? 'nav open' : 'nav'} aria-label="Main">
            {NAV.map(([r, t]) => <a key={r} href={'#' + r} aria-current={sec === r ? 'page' : undefined}>{t}</a>)}
          </nav>
          <div className="head-tools">
            <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); location.hash = 'search'; }}>
              <label className="sr" htmlFor="site-search">Search lessons</label>
              <input id="site-search" type="search" placeholder="Search" value={query}
                onChange={(e) => { setQuery(e.target.value); if (route !== 'search' && e.target.value.length > 1) location.hash = 'search'; }} />
              <button type="submit" className="icon-btn" aria-label="Search"><Icon name="search" /></button>
            </form>
            <button type="button" className="icon-btn" aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={() => update((s) => ({ ...s, theme: theme === 'dark' ? 'light' : 'dark' }))}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <a className="btn start" href={startHref}>Start Learning</a>
          </div>
        </div>
      </header>
      <main id="main" className="wrap page" key={route === 'search' ? 'search' : route}>{page}</main>
      <footer className="site-foot">
        <div className="wrap foot-row">
          <div>
            <Logo />
            <p>{TAGLINE}</p>
            <p className="muted small">100% free. No login, no registration, no subscriptions, no paid certificates.</p>
          </div>
          <nav aria-label="Footer">
            {FOOTER.map(([r, t]) => <a key={r} href={'#' + r}>{t}</a>)}
          </nav>
        </div>
      </footer>
    </>
  );
}
