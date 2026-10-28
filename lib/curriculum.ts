import "server-only";
import { getCodeHighlights } from "./highlight";
import fs from "node:fs";
import path from "node:path";
import type { Chapter, Lesson, Track } from "./types";

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "curriculum.json"), "utf8"),
);

export const chapters: Chapter[] = manifest.chapters.map(
  (item: {
    directory: string;
    track: Track;
    title: string;
    concept: string;
    section: string;
    native?: boolean;
    practice?: "diagram";
  }) => {
    const slug = item.directory.split("/")[1];
    return {
      id: item.directory,
      track: item.track,
      slug,
      number: slug.slice(0, 2),
      title: item.title,
      concept: item.concept,
      section: item.section,
      native: item.native === true,
      practiceKind: item.practice === "diagram" ? "diagram" : "code",
    };
  },
);

export function getLesson(track: string, slug: string): Lesson | null {
  const chapter = chapters.find((item) => item.id === `${track}/${slug}`);
  if (!chapter) return null;
  const directory = path.join(root, chapter.id);
  const source = fs.readFileSync(path.join(directory, "README.md"), "utf8");
  const [content, practice] = source.split(/^## Practice\s*$/m);
  if (!practice)
    throw new Error(`Lesson missing practice section: ${chapter.id}`);
  return {
    ...chapter,
    source,
    highlights: getCodeHighlights(source),
    content: content.replace(/^# .+\n+/, ""),
    practice: practice.trim(),
    starter:
      chapter.practiceKind === "diagram"
        ? ""
        : fs.readFileSync(path.join(directory, "exercise.py"), "utf8"),
    tests:
      chapter.practiceKind === "diagram"
        ? ""
        : fs.readFileSync(path.join(directory, "main.py"), "utf8"),
  };
}
