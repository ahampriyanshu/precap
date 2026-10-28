import "server-only";
import { getCodeHighlights } from "./highlight";
import fs from "node:fs";
import path from "node:path";
import type { Cheatsheet } from "./types";
import { guideSections } from "./guide-utils";

export const cheatsheets: Cheatsheet[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "cheatsheets.json"), "utf8"),
).cheatsheets;

export function getCheatsheetArticle(slug: string) {
  const sheet = cheatsheets.find((entry) => entry.slug === slug);
  if (!sheet) return null;
  const source = fs.readFileSync(
    path.join(process.cwd(), "cheatsheets", `${sheet.slug}.md`),
    "utf8",
  );
  const content = source.replace(/^# .+\n+/, "");
  return {
    sheet,
    content,
    highlights: getCodeHighlights(content),
    sections: guideSections(content),
  };
}
