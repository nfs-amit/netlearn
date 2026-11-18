import type { Lesson, Level, Module, Quiz } from '../types';

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type Draft = Omit<Lesson, 'id' | 'mod'>;

/** Compact lesson constructor. Terms are written as "Term: definition". */
export function L(
  title: string,
  scene: string,
  intro: string,
  what: string,
  why: string,
  how: string[],
  example: string,
  terms: string[],
  pros: string[],
  cons: string[],
  practical: string,
  iq: [string, string],
  quiz: [string, string[], number, string],
): Draft {
  const q: Quiz = { q: quiz[0], o: quiz[1], a: quiz[2], e: quiz[3] };
  return {
    title, scene, intro, what, why, how, example,
    terms: terms.map((t) => {
      const i = t.indexOf(': ');
      return [t.slice(0, i), t.slice(i + 2)] as [string, string];
    }),
    pros, cons, practical, iq: [iq], quiz: [q],
  };
}

export function mod(
  n: number, title: string, level: Level, cat: string, blurb: string, lessons: Draft[],
): Module {
  const id = 'm' + n;
  return {
    id, n, title, level, cat, blurb,
    lessons: lessons.map((l) => ({ ...l, id: id + '-' + slug(l.title), mod: id })),
  };
}
