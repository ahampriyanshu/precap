"use client";
import { useEffect, useState } from "react";
import { loadWork } from "@/lib/storage";
import { loadDiagramProgress } from "@/lib/diagram-storage";
import type { Chapter } from "@/lib/types";

export function useProgress(chapters: Chapter[]) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [started, setStarted] = useState<Set<string>>(new Set());
  useEffect(() => {
    let active = true;
    let generation = 0;
    const read = async () => {
      const request = ++generation;
      const complete = new Set<string>();
      const begun = new Set<string>();
      for (const chapter of chapters) {
        if (chapter.practiceKind === "diagram") continue;
        const saved = loadWork(chapter.id);
        if (saved) begun.add(chapter.id);
        if (saved?.final || (chapter.native && saved?.localCompleted))
          complete.add(chapter.id);
      }
      if (chapters.some((chapter) => chapter.practiceKind === "diagram")) {
        const progress = await loadDiagramProgress().catch(() => []);
        const ids = new Set(
          chapters
            .filter((chapter) => chapter.practiceKind === "diagram")
            .map((chapter) => chapter.id),
        );
        for (const entry of progress) {
          if (!ids.has(entry.id)) continue;
          if (entry.started) begun.add(entry.id);
          if (entry.reviewed) complete.add(entry.id);
        }
      }
      if (active && request === generation) {
        setCompleted(complete);
        setStarted(begun);
      }
    };
    void read();
    window.addEventListener("lessons:progress", read);
    window.addEventListener("storage", read);
    window.addEventListener("focus", read);
    return () => {
      active = false;
      window.removeEventListener("lessons:progress", read);
      window.removeEventListener("storage", read);
      window.removeEventListener("focus", read);
    };
  }, [chapters]);
  return { completed, started };
}
