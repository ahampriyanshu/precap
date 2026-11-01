"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
import { useProgress } from "@/hooks/use-progress";
import type { Chapter } from "@/lib/types";
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

  return (
    <div
      className={`workspace-shell ${practice ? "practice-mode" : "lesson-mode"}`}
    >
      <a className="skip-link" href="#main-panel">
        Skip to {practice ? "practice" : "lesson"}
      </a>

      <AppSidebar
        lesson={lesson}
        chapters={chapters}
        practice={practice}
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
        <SiteHeader
          className="studio-header"
          onMenuClick={() => setMenu(true)}
          menuAriaLabel="Open lesson navigation"
          searchAriaLabel="Search course lessons"
          breadcrumb={
            <>
              {practice ? (
                <Link className="back-to-lesson" href={`/learn/${lesson.id}/`}>
                  Back to lesson
                </Link>
              ) : (
                <span>{courses[lesson.track].title}</span>
              )}
              <span className="breadcrumb-slash">/</span>
              <span className="breadcrumb-title">{lesson.title}</span>
            </>
          }
        />
        {children}
      </main>
    </div>
  );
}
