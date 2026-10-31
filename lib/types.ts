import type { CodeHighlights } from "./code-theme";

export type Language = "python" | "javascript" | "go" | "java" | "cpp";
export type Track = Language | "dsa" | "lld" | "hld";
export type Cheatsheet = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  guide: { slug: string; part: string };
};
export type GuidePart = {
  module?: string;
  cheatsheet?: string;
  label?: string;
  aliases?: { guide?: string; slug: string; section?: string }[];
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};
export type Guide = {
  moduleLabel?: "Module" | "Track";
  indexAliases?: string[];
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
  baseId: string;
  language: Language | null;
  languages: Language[];
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
  files: Record<string, string>;
  starterFilename: string;
  testFilename: string;
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
  "idle" | "loading" | "compiling" | "running" | "done" | "stopped" | "error";
