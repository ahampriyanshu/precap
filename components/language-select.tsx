"use client";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Chapter, Language } from "@/lib/types";
import {
  languages,
  languageInfo,
  isLanguage,
  isSharedTrack,
} from "@/lib/languages";
import { usePreferredLanguage } from "@/hooks/use-preferred-language";
import { LanguageLogo } from "./language-logo";

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
  const currentLanguage: Language =
    (lesson?.language && isLanguage(lesson.language)
      ? lesson.language
      : null) ||
    language ||
    "python";

  return (
    <label className="language-select">
      <LanguageLogo language={currentLanguage} size={15} />
      <span className="language-select-current">
        {languageInfo[currentLanguage].label}
      </span>
      <select
        aria-label="Programming language"
        value={currentLanguage}
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
