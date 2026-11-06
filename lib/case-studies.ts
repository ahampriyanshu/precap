import "server-only";
import { getCodeHighlights } from "./highlight";
import fs from "node:fs";
import path from "node:path";
import type { CaseStudy } from "./types";
import { guideSections } from "./guide-utils";

const root = process.cwd();
export const caseStudies: CaseStudy[] = JSON.parse(
  fs.readFileSync(path.join(root, "case-studies.json"), "utf8"),
).caseStudies;

export function getCaseStudyArticle(slug: string) {
  const study = caseStudies.find((entry) => entry.slug === slug);
  if (!study) return null;
  const source = fs.readFileSync(
    path.join(root, "case-studies", `${study.slug}.md`),
    "utf8",
  );
  const content = source.replace(/^# .+\n+/, "");
  return {
    study,
    content,
    highlights: getCodeHighlights(content),
    sections: guideSections(content),
  };
}
