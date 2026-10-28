import type { CodeHighlights } from "./code-theme";

export type Track = "dsa" | "python" | "lld" | "hld";
export type Cheatsheet = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  guide: { slug: string; part: string };
};
export type GuidePart = {
  cheatsheet?: string;
  label?: string;
  aliases?: { guide?: string; slug: string; section?: string }[];
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};
export type Guide = {
  sequential?: boolean;
  slug: string;
  title: string;
  description: string;
  parts: GuidePart[];
};
export type GuideArticle = {
  guide: Guide;
  part: GuidePart;
  position: number;
  content: string;
  highlights: CodeHighlights;
  sections: { title: string; id: string }[];
};
export type Stage = "prototype" | "final";
export type Chapter = {
  id: string;
  track: Track;
  slug: string;
  number: string;
  title: string;
  concept: string;
  section: string;
  native: boolean;
  practiceKind: "code" | "diagram";
};
export type Lesson = Chapter & {
  content: string;
  highlights: CodeHighlights;
  practice: string;
  source: string;
  starter: string;
  tests: string;
};
export type Check = {
  name: string;
  status: "passed" | "failed" | "error" | "skipped";
  detail?: string;
};
export type Report = {
  checks: Check[];
  duration: number;
  passed: boolean;
  methods: number;
  skipped: number;
};
export type SavedWork = {
  code: string;
  prototype: boolean;
  final: boolean;
  localCompleted?: boolean;
};
export type RunState =
  "idle" | "loading" | "running" | "done" | "stopped" | "error";
