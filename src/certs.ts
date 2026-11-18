// Free certificates of completion. Everything here runs in the browser:
// the rules use the progress saved in this browser, and the PDF and PNG are drawn locally.
import { CERT_PASS_PERCENT, SITE_NAME, TAGLINE } from './config';
import { courseById, courses } from './content';
import type { State } from './store';
import type { Level } from './types';

export const ALL_ID = 'all';

export type CertStatus = {
  id: string;
  title: string;
  level: Level | 'All levels';
  lessonsDone: number;
  lessonsTotal: number;
  quiz?: { best: number; total: number; pct: number };
  quizPassed: boolean;
  lessonsComplete: boolean;
  eligible: boolean;
  earnedOn?: string; // ISO date the certificate was first unlocked
};

export function courseCert(id: string, st: State): CertStatus | undefined {
  const c = courseById.get(id);
  if (!c) return undefined;
  const lessonsDone = c.lessonList.filter((l) => st.done[l.id]).length;
  const sc = st.scores['quiz-' + id];
  const best = sc ? sc.b ?? sc.s : 0;
  const quiz = sc ? { best, total: sc.t, pct: Math.round((best / sc.t) * 100) } : undefined;
  const quizPassed = !!quiz && quiz.pct >= CERT_PASS_PERCENT;
  const lessonsComplete = lessonsDone === c.lessonList.length;
  const earnedOn = st.certs[id];
  return { id, title: c.title, level: c.level, lessonsDone, lessonsTotal: c.lessonList.length, quiz, quizPassed, lessonsComplete,
    eligible: !!earnedOn || (lessonsComplete && quizPassed), earnedOn };
}

/** The capstone certificate: every course certificate earned. */
export function allCert(st: State): CertStatus & { coursesEarned: number; coursesTotal: number } {
  const list = courses.map((c) => courseCert(c.id, st)!);
  const coursesEarned = list.filter((c) => c.eligible).length;
  const done = coursesEarned === list.length;
  return { id: ALL_ID, title: 'Complete Computer Networking Curriculum', level: 'All levels',
    lessonsDone: list.reduce((n, c) => n + c.lessonsDone, 0), lessonsTotal: list.reduce((n, c) => n + c.lessonsTotal, 0),
    quizPassed: done, lessonsComplete: done, eligible: !!st.certs[ALL_ID] || done, earnedOn: st.certs[ALL_ID],
    coursesEarned, coursesTotal: list.length };
}

export const certFor = (id: string, st: State) => (id === ALL_ID ? allCert(st) : courseCert(id, st));

/** Courses (and the capstone) that are unlocked now but have no date recorded yet. */
export function newlyEarned(st: State): string[] {
  const ids = courses.map((c) => c.id).filter((id) => !st.certs[id] && courseCert(id, st)!.eligible);
  const after = { ...st, certs: { ...st.certs, ...Object.fromEntries(ids.map((i) => [i, 'x'])) } };
  if (!st.certs[ALL_ID] && allCert(after).eligible) ids.push(ALL_ID);
  return ids;
}

export const today = () => new Date().toISOString().slice(0, 10);

export function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00');
  return isNaN(+d) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** A short reference printed on the certificate. It identifies the certificate; it cannot be verified online. */
export function reference(name: string, id: string, date: string) {
  let h = 0x811c9dc5;
  for (const ch of name.trim().toLowerCase() + '|' + id + '|' + date) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return 'NL-' + id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) + '-' + h.toString(16).toUpperCase().padStart(8, '0').slice(0, 6);
}

// ---------- drawing ----------

export const CERT_W = 1754, CERT_H = 1240; // A4 landscape at 150 dpi

function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, maxW: number) {
  let px = start;
  ctx.font = font(px);
  while (ctx.measureText(text).width > maxW && px > 16) { px -= 2; ctx.font = font(px); }
  return px;
}

export function drawCertificate(canvas: HTMLCanvasElement, opts: { name: string; status: CertStatus; date: string }) {
  const { name, status, date } = opts;
  canvas.width = CERT_W; canvas.height = CERT_H;
  const ctx = canvas.getContext('2d')!;
  const W = CERT_W, H = CERT_H;
  const ink = '#17233f', muted = '#5d6a85', accent = '#4058d6', warm = '#f08a45';
  const serif = 'Georgia, "Times New Roman", serif';
  const sans = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

  // background and frame
  ctx.fillStyle = '#fbfbf8'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = accent; ctx.lineWidth = 10; ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.strokeStyle = warm; ctx.lineWidth = 3; ctx.strokeRect(64, 64, W - 128, H - 128);

  // network motif in two corners
  const motif = (ox: number, oy: number, sx: number, sy: number) => {
    const pts: [number, number][] = [[0, 0], [130, 30], [60, 120], [200, 110], [150, 200]];
    ctx.strokeStyle = 'rgba(64,88,214,.35)'; ctx.lineWidth = 3;
    [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [2, 4]].forEach(([a, b]) => {
      ctx.beginPath(); ctx.moveTo(ox + sx * pts[a][0], oy + sy * pts[a][1]); ctx.lineTo(ox + sx * pts[b][0], oy + sy * pts[b][1]); ctx.stroke();
    });
    pts.forEach(([x, y], i) => { ctx.fillStyle = i % 2 ? 'rgba(240,138,69,.8)' : 'rgba(64,88,214,.8)'; ctx.beginPath(); ctx.arc(ox + sx * x, oy + sy * y, 11, 0, Math.PI * 2); ctx.fill(); });
  };
  motif(110, 110, 0.85, 0.85);
  motif(W - 110, H - 110, -0.85, -0.85);

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  // logo mark + site name
  const lx = W / 2 - 120, ly = 175;
  ctx.strokeStyle = accent; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(lx - 14, ly - 14); ctx.lineTo(lx + 14, ly - 6); ctx.moveTo(lx - 14, ly - 14); ctx.lineTo(lx - 2, ly + 16); ctx.moveTo(lx + 14, ly - 6); ctx.lineTo(lx - 2, ly + 16); ctx.stroke();
  [[lx - 14, ly - 14, accent], [lx + 14, ly - 6, warm], [lx - 2, ly + 16, accent]].forEach(([x, y, c]) => { ctx.fillStyle = c as string; ctx.beginPath(); ctx.arc(x as number, y as number, 9, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = ink; ctx.font = `800 46px ${sans}`; ctx.textAlign = 'left'; ctx.fillText(SITE_NAME, lx + 34, ly + 16);
  ctx.textAlign = 'center';
  ctx.fillStyle = muted; ctx.font = `600 22px ${sans}`;
  ctx.fillText('FREE COMPUTER NETWORKING ACADEMY', W / 2, 240);

  ctx.fillStyle = accent; ctx.font = `700 34px ${sans}`;
  ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 340);
  ctx.fillStyle = warm; ctx.fillRect(W / 2 - 60, 368, 120, 5);

  ctx.fillStyle = muted; ctx.font = `400 30px ${serif}`;
  ctx.fillText('This certifies that', W / 2, 450);

  ctx.fillStyle = ink;
  fit(ctx, name, (px) => `700 ${px}px ${serif}`, 92, W - 360);
  ctx.fillText(name, W / 2, 560);
  ctx.strokeStyle = '#c9d1e6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 520, 595); ctx.lineTo(W / 2 + 520, 595); ctx.stroke();

  ctx.fillStyle = muted; ctx.font = `400 30px ${serif}`;
  ctx.fillText(status.id === ALL_ID ? 'has completed every course in the free NetLearn programme' : 'has successfully completed the free NetLearn course', W / 2, 665);

  ctx.fillStyle = accent;
  fit(ctx, status.title, (px) => `700 ${px}px ${serif}`, 64, W - 360);
  ctx.fillText(status.title, W / 2, 755);

  const details = status.id === ALL_ID
    ? `${(status as ReturnType<typeof allCert>).coursesTotal} courses  ·  ${status.lessonsTotal} lessons`
    : `${status.level}  ·  ${status.lessonsTotal} lessons completed  ·  Course quiz: ${status.quiz?.best}/${status.quiz?.total} (${status.quiz?.pct}%)`;
  ctx.fillStyle = ink; ctx.font = `500 28px ${sans}`;
  ctx.fillText(details, W / 2, 830);

  // date and reference blocks
  const block = (x: number, label: string, value: string) => {
    ctx.fillStyle = ink; ctx.font = `600 30px ${sans}`; ctx.fillText(value, x, 960);
    ctx.strokeStyle = '#c9d1e6'; ctx.beginPath(); ctx.moveTo(x - 190, 980); ctx.lineTo(x + 190, 980); ctx.stroke();
    ctx.fillStyle = muted; ctx.font = `500 22px ${sans}`; ctx.fillText(label, x, 1015);
  };
  block(W / 2 - 340, 'Date of completion', formatDate(date));
  block(W / 2 + 340, 'Certificate reference', reference(name, status.id, date));

  ctx.fillStyle = muted; ctx.font = `italic 22px ${serif}`;
  ctx.fillText(TAGLINE, W / 2, 1090);
  ctx.font = `400 17px ${sans}`;
  ctx.fillText('A free certificate of completion. Progress is recorded by the learner on the NetLearn website. Not an accredited qualification or a vendor certification such as Cisco CCNA.', W / 2, 1140);
}

// ---------- files ----------

function dataUrlBytes(url: string) {
  const bin = atob(url.slice(url.indexOf(',') + 1));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** A one-page A4 landscape PDF containing the certificate as a JPEG image. No library needed. */
export function certificatePdf(canvas: HTMLCanvasElement, title: string): Blob {
  const jpeg = dataUrlBytes(canvas.toDataURL('image/jpeg', 0.92));
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let len = 0;
  const push = (d: string | Uint8Array) => { const b = typeof d === 'string' ? enc.encode(d) : d; parts.push(b); len += b.length; };
  const obj = (n: number, ...body: (string | Uint8Array)[]) => { offsets[n] = len; push(`${n} 0 obj\n`); body.forEach(push); push('\nendobj\n'); };
  const PW = 842, PH = 595;
  const safe = title.replace(/[()\\]/g, '').replace(/[^\x20-\x7e]/g, '');
  const content = `q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`;
  push('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  obj(4, `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`, jpeg, '\nendstream');
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  obj(6, `<< /Title (${safe}) /Producer (NetLearn) >>`);
  const xref = len;
  push(`xref\n0 7\n0000000000 65535 f \n${offsets.slice(1).map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`);
  push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts as BlobPart[], { type: 'application/pdf' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export const fileName = (name: string, title: string, ext: string) =>
  ('NetLearn-certificate-' + title + '-' + name).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') + '.' + ext;
