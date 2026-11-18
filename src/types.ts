export type Quiz = { q: string; o: string[]; a: number; e: string };

export type Lesson = {
  id: string;
  mod: string;
  title: string;
  scene: string;
  intro: string;
  what: string;
  why: string;
  how: string[];
  example: string;
  terms: [string, string][];
  pros: string[];
  cons: string[];
  practical: string;
  iq: [string, string][];
  quiz: Quiz[];
};

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export type Module = {
  id: string;
  n: number;
  title: string;
  level: Level;
  cat: string;
  blurb: string;
  lessons: Lesson[];
};

export type SceneNode = { id: string; x: number; y: number; label: string; kind: string };

export type SceneStep = {
  from?: string;
  to?: string | string[];
  at?: string | string[];
  label?: string;
  text: string;
  drop?: boolean;
};

export type Scene = {
  title: string;
  desc: string;
  nodes: SceneNode[];
  links: [string, string][];
  steps: SceneStep[];
};
