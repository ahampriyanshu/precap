import { strToU8, zipSync } from "fflate";
import type { Lesson } from "./types";

export function downloadChapter(lesson: Lesson, code: string) {
  const archive = zipSync({
    "README.md": strToU8(lesson.source),
    "exercise.py": strToU8(code),
    "main.py": strToU8(lesson.tests),
  });
  const blob = new Blob([new Uint8Array(archive)], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${lesson.track}-${lesson.slug}.zip`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
