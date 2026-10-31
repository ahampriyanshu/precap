import Link from "next/link";
import { Content } from "./content";
import { LessonShell } from "./lesson-shell";
import { Practice } from "./practice";
import { DiagramPractice } from "./diagram-practice";
import { languageInfo } from "@/lib/languages";
import type { Chapter, Lesson } from "@/lib/types";

export function Workspace({
  lesson,
  chapters,
  practice = false,
}: {
  lesson: Lesson;
  chapters: Chapter[];
  practice?: boolean;
}) {
  const siblings = chapters.filter((c) => c.track === lesson.track);
  const next = siblings[siblings.findIndex((c) => c.id === lesson.id) + 1];
  return (
    <LessonShell lesson={lesson} chapters={chapters} practice={practice}>
      {practice ? (
        lesson.practiceKind === "diagram" ? (
          <DiagramPractice lesson={lesson} />
        ) : (
          <Practice lesson={lesson} />
        )
      ) : (
        <article
          className="lesson-reader"
          tabIndex={0}
          aria-label={`${lesson.title} lesson`}
        >
          <div className="reading-inner">
            <p className="lesson-kicker">
              {lesson.section} · Lesson {Number(lesson.number)}
              {lesson.languages.length > 1 && lesson.language
                ? ` · ${languageInfo[lesson.language].label}`
                : ""}
            </p>
            <h1>{lesson.title}</h1>
            <p className="lesson-focus">{lesson.concept}</p>
            <div className="lesson-rule" />
            <Content markdown={lesson.content} highlights={lesson.highlights} />
            <section className="practice-invitation">
              <div>
                <h2>Put it into practice</h2>
                <p>
                  {lesson.practiceKind === "diagram"
                    ? "Draw the architecture in Excalidraw, stress the design, and explain your tradeoffs."
                    : lesson.native
                      ? "Implement the exercise in the workspace, then download it and run the tests with your local toolchain."
                      : "Implement the exercise in a full-screen workspace, then run its tests."}
                </p>
              </div>
              <Link
                className="button primary"
                href={`/learn/${lesson.id}/practice/`}
              >
                {lesson.practiceKind === "diagram"
                  ? "Open design canvas"
                  : "Open practice"}
              </Link>
            </section>
            {next && (
              <Link className="next-lesson" href={`/learn/${next.id}/`}>
                <span>
                  Next lesson<strong>{next.title}</strong>
                </span>
              </Link>
            )}
          </div>
        </article>
      )}
    </LessonShell>
  );
}
