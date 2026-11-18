import type { Lesson, Module } from '../types';
import { m1, m2, m3 } from './m01_03';
import { m4, m5 } from './m04_05';
import { m6, m7 } from './m06_07';
import { m8, m9, m10 } from './m08_10';
import { m11, m12 } from './m11_12';
import { m13, m14 } from './m13_14';
import { curated, type IQ } from './interview';
import { COURSES, type CourseDef } from './courses';

// To add a module: create a file that exports mod(...) and add it to this list.
export const modules: Module[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14];

export const lessons: Lesson[] = modules.flatMap((m) => m.lessons);
export const lessonById = new Map(lessons.map((l) => [l.id, l]));
export const moduleById = new Map(modules.map((m) => [m.id, m]));
export const CATEGORIES = [...new Set(modules.map((m) => m.cat))];

// Interview bank = curated role questions + the question attached to every lesson.
export const interviewBank: IQ[] = [
  ...curated,
  ...lessons.flatMap((l) =>
    l.iq.map((p, i) => ({
      id: 'l-' + l.id + '-' + i,
      level: moduleById.get(l.mod)!.level,
      role: 'Topic: ' + moduleById.get(l.mod)!.title,
      type: 'Technical' as const,
      q: p[0],
      a: p[1],
    })),
  ),
];

// ---- Courses (Courses page). Each resolves to a list of lessons.
export type Course = CourseDef & { lessonList: Lesson[]; module?: Module };
export const courses: Course[] = COURSES.map((c) => {
  const module = c.moduleId ? moduleById.get(c.moduleId) : undefined;
  const lessonList = module ? module.lessons : (c.lessons ?? []).map((id) => {
    const l = lessonById.get(id);
    if (!l) throw new Error('Unknown lesson in course ' + c.id + ': ' + id);
    return l;
  });
  return { ...c, module, lessonList };
});
export const courseById = new Map(courses.map((c) => [c.id, c]));
/** Modules not shown as their own course card (their lessons appear inside combined courses). */
export const modulesWithoutCard = modules.filter((m) => !courses.some((c) => c.moduleId === m.id));
