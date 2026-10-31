"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Check, Menu, Search, X } from "lucide-react";
import { Brand } from "./brand";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
import { useProgress } from "@/hooks/use-progress";
import type { Chapter } from "@/lib/types";
import { LanguageSelect } from "./language-select";
import { languageInfo } from "@/lib/languages";
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
  const [query, setQuery] = useState("");
  const { menu, setMenu, sidebarRef } = useNavigationMenu();
  const { completed } = useProgress(chapters);
  const siblings = chapters.filter((c) => c.track === lesson.track);
  const position = siblings.findIndex((c) => c.id === lesson.id);
  const previous = siblings[position - 1],
    next = siblings[position + 1];
  const visible = chapters.filter(
    (c) =>
      c.track === lesson.track &&
      `${c.title} ${c.concept}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div
      className={`workspace-shell ${practice ? "practice-mode" : "lesson-mode"}`}
    >
      <a className="skip-link" href="#main-panel">
        Skip to {practice ? "practice" : "lesson"}
      </a>
      {menu && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMenu(false)}
          aria-label="Close lesson navigation"
        />
      )}
      <aside
        ref={sidebarRef}
        className={`sidebar ${menu ? "is-open" : ""}`}
        role={menu ? "dialog" : undefined}
        aria-modal={menu || undefined}
        aria-label="Lesson navigation"
      >
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button nav-close"
            onClick={() => setMenu(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <label className="sidebar-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a lesson…"
            aria-label="Search course lessons"
          />
        </label>
        <nav className="sidebar-list" aria-label="Lessons">
          <div className="sidebar-list-label">
            <span>Lessons</span>
            <span>
              {
                chapters.filter(
                  (c) => c.track === lesson.track && completed.has(c.id),
                ).length
              }{" "}
              / {chapters.filter((c) => c.track === lesson.track).length}
            </span>
          </div>
          {visible.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/learn/${chapter.id}/`}
              className={`nav-chapter ${chapter.id === lesson.id ? "active" : ""}`}
              aria-current={chapter.id === lesson.id ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <span
                className={`nav-number ${completed.has(chapter.id) ? "is-complete" : ""}`}
              >
                {completed.has(chapter.id) ? (
                  <Check size={13} />
                ) : (
                  chapter.number
                )}
              </span>
              <span>
                {chapter.title}
                {chapter.native && (
                  <small className="nav-local">
                    Local {languageInfo[chapter.language || "python"].label}{" "}
                    practice
                  </small>
                )}
              </span>
            </Link>
          ))}
          {!visible.length && (
            <p className="no-matches">No matching lessons.</p>
          )}
        </nav>
        <div className="sidebar-footer">
          {lesson.practiceKind === "diagram"
            ? "Design review progress saves on this device."
            : "Your progress saves in this browser."}
        </div>
      </aside>
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
