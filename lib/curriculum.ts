import "server-only";
import { getCodeHighlights } from "./highlight";
import fs from "node:fs";
import path from "node:path";
import type { Chapter, Lesson, Track, Language } from "./types";
import {
  languages,
  languageInfo,
  isLanguage,
  isSharedTrack,
  chapterForLanguage,
} from "./languages";
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
    const language =
      item.practice === "diagram"
        ? null
        : isLanguage(item.track)
          ? item.track
          : "python";
    const available =
      language === null
        ? []
        : isSharedTrack(item.track)
          ? languages.filter(
              (lang) =>
                lang === "python" ||
                fs.existsSync(
                  path.join(
                    root,
                    "variants",
                    lang,
                    item.directory,
                    "README.md",
                  ),
                ),
            )
          : [language];
    return {
      id: item.directory,
      baseId: item.directory,
      track: item.track,
      slug,
      number: slug.slice(0, 2),
      title: item.title,
      concept: item.concept,
      section: item.section,
      native: item.native === true,
      practiceKind: item.practice === "diagram" ? "diagram" : "code",
      language,
      languages: available,
    };
  },
);
export function chaptersForLanguage(language: Language) {
  return chapters.map((chapter) => chapterForLanguage(chapter, language));
}
export function getLesson(
  track: string,
  slug: string,
  requestedLanguage?: Language,
): Lesson | null {
  const base = chapters.find((item) => item.baseId === `${track}/${slug}`);
  if (!base) return null;
  const language = requestedLanguage || base.language;
  if (requestedLanguage && !base.languages.includes(requestedLanguage))
    return null;
  const chapter = language ? chapterForLanguage(base, language) : base;
  const directory = path.join(
    root,
    isSharedTrack(track) && language && language !== "python"
      ? path.join("variants", language, base.baseId)
      : base.baseId,
  );
  const source = fs.readFileSync(path.join(directory, "README.md"), "utf8");
  const [content, practice] = source.split(/^## Practice\s*$/m);
  if (!practice)
    throw new Error(`Lesson missing practice section: ${chapter.id}`);
  const info = languageInfo[language || "python"];
  const files: Record<string, string> = {};
  if (chapter.practiceKind !== "diagram") {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (
        entry.isFile() &&
        /\.(?:py|mjs|js|go|java|cpp|hpp|h|json|mod|txt)$/.test(entry.name)
      )
        files[entry.name] = fs.readFileSync(
          path.join(directory, entry.name),
          "utf8",
        );
    }
  }
  if (
    chapter.practiceKind !== "diagram" &&
    (!files[info.starter] || !files[info.tests])
  )
    throw new Error(`Missing ${language} exercise sources: ${chapter.id}`);
  return {
    ...chapter,
    source,
    content: content.replace(/^# .+\n+/, ""),
    practice: practice.trim(),
    highlights: getCodeHighlights(source),
    files,
    starterFilename: info.starter,
    testFilename: info.tests,
    starter: chapter.practiceKind === "diagram" ? "" : files[info.starter],
    tests: chapter.practiceKind === "diagram" ? "" : files[info.tests],
  };
}
