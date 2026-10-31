import type { Track } from "./types";

export const tracks: Track[] = [
  "python",
  "javascript",
  "go",
  "java",
  "cpp",
  "dsa",
  "lld",
  "hld",
];

export const courses: Record<
  Track,
  { title: string; label: string; description: string }
> = {
  python: {
    title: "Python",
    label: "Python",
    description: "Types, functions, objects, concurrency, and memory.",
  },
  javascript: {
    title: "JavaScript",
    label: "JS",
    description:
      "Values, functions, prototypes, asynchronous execution, modules, and memory.",
  },
  go: {
    title: "Go",
    label: "Go",
    description:
      "Values, interfaces, errors, goroutines, channels, and memory.",
  },
  java: {
    title: "Java",
    label: "Java",
    description:
      "Types, collections, objects, generics, concurrency, and the JVM.",
  },
  cpp: {
    title: "C++",
    label: "C++",
    description:
      "Values, ownership, lifetimes, templates, concurrency, and performance.",
  },
  dsa: {
    title: "Data structures & algorithms",
    label: "DSA",
    description: "How to organize data and choose an efficient algorithm.",
  },
  lld: {
    title: "Low-level design",
    label: "LLD",
    description:
      "Design objects, protect state, and handle real-world edge cases.",
  },
  hld: {
    title: "High-level design",
    label: "HLD",
    description:
      "Diagram services, data flows, and failure paths in Excalidraw.",
  },
};
