import type { Track } from "./types";

export const tracks: Track[] = ["python", "dsa", "lld", "hld"];

export const courses: Record<
  Track,
  { title: string; label: string; description: string }
> = {
  python: {
    title: "Python",
    label: "Python",
    description: "Types, functions, objects, concurrency, and memory.",
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
