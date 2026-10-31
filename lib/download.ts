import { strToU8, zipSync } from "fflate";
import type { Lesson } from "./types";

export function downloadChapter(lesson: Lesson, code: string) {
  const archive = zipSync(
    Object.fromEntries(
      Object.entries({
        ...lesson.files,
        "README.md": lesson.source,
        [lesson.starterFilename]: code,
      }).map(([name, source]) => [name, strToU8(source)]),
    ),
  );
  const blob = new Blob([new Uint8Array(archive)], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${lesson.track}-${lesson.slug}${lesson.language && lesson.language !== "python" ? `-${lesson.language}` : ""}.zip`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
