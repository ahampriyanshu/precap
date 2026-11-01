"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { NavbarSearch } from "./navbar-search";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
import { useProgress } from "@/hooks/use-progress";
import type { Chapter } from "@/lib/types";
import { LanguageSelect } from "./language-select";
import { courses } from "@/lib/courses";

export function LessonShell({
  lesson,
  chapters,
  practice,
  children,
}: {
  lesson: Chapter;
  chapters: Chapter[];
  practice: boolean;
  children: ReactNode;
}) {
  const { menu, setMenu, sidebarRef } = useNavigationMenu();
  const { completed } = useProgress(chapters);
  const siblings = chapters.filter((c) => c.track === lesson.track);
  const position = siblings.findIndex((c) => c.id === lesson.id);
  const previous = siblings[position - 1],
    next = siblings[position + 1];

  return (
    <div
      className={`workspace-shell ${practice ? "practice-mode" : "lesson-mode"}`}
    >
      <a className="skip-link" href="#main-panel">
        Skip to {practice ? "practice" : "lesson"}
      </a>

      <AppSidebar
        currentTrack={lesson.track}
        currentSlug={lesson.slug}
        preferredLanguage={lesson.language}
        completedSet={completed}
        navigationLabel="Lesson navigation"
        menu={menu}
        setMenu={setMenu}
        sidebarRef={sidebarRef}
      />

      <main className="studio" inert={menu} id="main-panel" tabIndex={-1}>
        <header className="studio-header">
          <div className="studio-breadcrumb">
            <button
              className="icon-button nav-open"
              onClick={() => setMenu(true)}
              aria-label="Open lesson navigation"
            >
              <Menu size={19} />
            </button>
            {practice ? (
              <Link className="back-to-lesson" href={`/learn/${lesson.id}/`}>
                Back to lesson
              </Link>
            ) : (
              <span>{courses[lesson.track].title}</span>
            )}
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-title">{lesson.title}</span>
          </div>

          <NavbarSearch />

          {!practice && (
            <div className="chapter-pager">
              {previous && (
                <Link
                  className="pager-link"
                  href={`/learn/${previous.id}/`}
                  aria-label="Previous lesson"
                >
                  Previous
                </Link>
              )}
              <span>
                {position + 1} / {siblings.length}
              </span>
              {next && (
                <Link
                  className="pager-link"
                  href={`/learn/${next.id}/`}
                  aria-label="Next lesson"
                >
                  Next
                </Link>
              )}
            </div>
          )}

          <LanguageSelect
            lesson={lesson}
            chapters={chapters}
            practice={practice}
          />
        </header>
        {children}
      </main>
    </div>
  );
}
