import "server-only";
import { getCodeHighlights } from "./highlight";
import fs from "node:fs";
import path from "node:path";
import type { Guide, GuideArticle } from "./types";
import { guideUrl, guideSections } from "./guide-utils";

const root = process.cwd();
export const guides: Guide[] = JSON.parse(
  fs.readFileSync(path.join(root, "guides.json"), "utf8"),
).guides;

export function getGuideArticle(
  guideSlug: string,
  partSlug: string,
): GuideArticle | null {
  const guide = guides.find((item) => item.slug === guideSlug);
  const position =
    guide?.parts.findIndex((item) => item.slug === partSlug) ?? -1;
  if (!guide || position < 0) return null;
  const part = guide.parts[position];
  const source = fs.readFileSync(
    path.join(root, "guides", guide.slug, `${part.slug}.md`),
    "utf8",
  );
  const content = source.replace(/^# .+\n+/, "");
  return {
    guide,
    part,
    position,
    content,
    highlights: getCodeHighlights(content),
    sections: guideSections(content),
  };
}

export function getGuideRedirect(guideSlug: string, partSlug: string) {
  for (const guide of guides) {
    for (const part of guide.parts) {
      const alias = part.aliases?.find(
        (entry) =>
          (entry.guide ?? guide.slug) === guideSlug && entry.slug === partSlug,
      );
      if (alias)
        return `${guideUrl(guide.slug, part.slug)}${alias.section ? `#${alias.section}` : ""}`;
    }
  }
  return null;
}
