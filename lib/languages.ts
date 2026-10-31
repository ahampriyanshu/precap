import type { Chapter, Language } from "./types";
export const languages: Language[] = [
  "python",
  "javascript",
  "go",
  "java",
  "cpp",
];
export const languageInfo: Record<
  Language,
  {
    label: string;
    short: string;
    starter: string;
    tests: string;
    command: string;
    native: boolean;
  }
> = {
  python: {
    label: "Python",
    short: "Python",
    starter: "exercise.py",
    tests: "main.py",
    command: "python3 main.py --stage $STAGE",
    native: false,
  },
  javascript: {
    label: "JavaScript",
    short: "JS",
    starter: "exercise.mjs",
    tests: "main.mjs",
    command: "node main.mjs --stage $STAGE",
    native: false,
  },
  go: {
    label: "Go",
    short: "Go",
    starter: "exercise.go",
    tests: "main.go",
    command: "go run main.go exercise.go --stage $STAGE",
    native: false,
  },
  java: {
    label: "Java",
    short: "Java",
    starter: "Exercise.java",
    tests: "Main.java",
    command: "javac Exercise.java Main.java && java Main --stage $STAGE",
    native: false,
  },
  cpp: {
    label: "C++",
    short: "C++",
    starter: "exercise.hpp",
    tests: "main.cpp",
    command:
      "c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice && ./practice --stage $STAGE",
    native: false,
  },
};
export function isLanguage(value: string): value is Language {
  return languages.includes(value as Language);
}
export function isSharedTrack(track: string) {
  return track === "dsa" || track === "lld";
}
export function chapterForLanguage(
  chapter: Chapter,
  language: Language,
): Chapter {
  if (!isSharedTrack(chapter.track) || !chapter.languages.includes(language))
    return chapter;
  return {
    ...chapter,
    language,
    id:
      language === "python" ? chapter.baseId : `${chapter.baseId}/${language}`,
    native: languageInfo[language].native,
  };
}
