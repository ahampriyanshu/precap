"use client";
import { useRouter } from "next/navigation";
import { Code2, ChevronDown } from "lucide-react";
import type { Chapter } from "@/lib/types";
import {
  languages,
  languageInfo,
  isLanguage,
  isSharedTrack,
} from "@/lib/languages";
import { usePreferredLanguage } from "@/hooks/use-preferred-language";

export function LanguageSelect({
  lesson,
  chapters = [],
  practice = false,
}: {
  lesson?: Chapter;
  chapters?: Chapter[];
  practice?: boolean;
}) {
  const router = useRouter();
  const { language, setLanguage } = usePreferredLanguage();
  return (
    <label className="language-select">
      <Code2 size={15} aria-hidden="true" />
      <span className="language-select-label">Language</span>
      <select
        aria-label="Programming language"
        value={lesson?.language || language || ""}
        onChange={(event) => {
          const value = event.target.value;
          if (!isLanguage(value)) return;
          setLanguage(value);
          if (!lesson || lesson.practiceKind === "diagram") return;
          const target = isSharedTrack(lesson.track)
            ? value === "python"
              ? lesson.baseId
              : `${lesson.baseId}/${value}`
            : chapters.find((chapter) => chapter.track === value)?.baseId;
          if (target)
            router.push(`/learn/${target}/${practice ? "practice/" : ""}`);
        }}
      >
        <option value="" disabled>
          Choose language
        </option>
        {languages.map((value) => (
          <option key={value} value={value}>
            {languageInfo[value].label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} aria-hidden="true" />
    </label>
  );
}
