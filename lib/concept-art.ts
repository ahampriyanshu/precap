export const conceptArt = {
  "engineering-desk": {
    alt: "An engineer’s desk with a laptop, system sketches, books, a lamp, and a plant.",
    caption: "A place to think, build, and begin again.",
  },
  "machine-coding": {
    alt: "A coding workbench with a laptop, a notebook, and a pencil.",
    caption: "Work the problem out, one small piece at a time.",
  },
  "system-basics": {
    alt: "A network workbench connects a desktop computer, a server, and a router.",
    caption: "Look closely at the connections that make a system work.",
  },
  "low-level-design": {
    alt: "Precisely fitted building blocks and a set square suggest modular software design.",
    caption: "Good parts make room for change.",
  },
  "high-level-design": {
    alt: "An architectural model of a connected city, with towers, smaller services, and shared paths.",
    caption: "Step back and see how the pieces fit together.",
  },
  frontend: {
    alt: "An illustrated desktop browser, with a design notebook and a small plant.",
    caption: "The part of the system a person gets to use.",
  },
  backend: {
    alt: "A server cabinet and a database, linked by a cable beside a stack of reference books.",
    caption: "The work behind every request.",
  },
  "ai-engineering": {
    alt: "An open reference book feeds an interconnected model chip.",
    caption: "Build with models. Reason from evidence.",
  },
  devops: {
    alt: "Packages move along a release conveyor, with inspection tools nearby.",
    caption: "From a working build to a dependable release.",
  },
  "last-mile-prep": {
    alt: "A field notebook, a compass, and a magnifying glass for checking the details.",
    caption: "The judgment that comes from looking closely.",
  },
} as const;
export type ConceptArtId = keyof typeof conceptArt;
export function hasConceptArt(id: string): id is ConceptArtId {
  return Object.hasOwn(conceptArt, id);
}
