"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Menu, Search, X } from "lucide-react";
import { Brand } from "./brand";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
import { useProgress } from "@/hooks/use-progress";
import type { Chapter, Track } from "@/lib/types";
import { courses, tracks } from "@/lib/courses";

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
  const [track, setTrack] = useState<Track>(lesson.track);
  const [query, setQuery] = useState("");
  const { menu, setMenu, sidebarRef } = useNavigationMenu();
  const { completed } = useProgress(chapters);
  const siblings = chapters.filter((c) => c.track === lesson.track);
  const position = siblings.findIndex((c) => c.id === lesson.id);
  const previous = siblings[position - 1],
    next = siblings[position + 1];
  const visible = chapters.filter(
    (c) =>
      c.track === track &&
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
        <Link className="all-courses" href="/">
          <ArrowLeft size={14} />
          All topics
        </Link>
        <div className="sidebar-track-tabs" role="group" aria-label="Course">
          {tracks.map((value) => (
            <button
              key={value}
              aria-pressed={track === value}
              onClick={() => setTrack(value)}
            >
              {courses[value].label}
            </button>
          ))}
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
                chapters.filter((c) => c.track === track && completed.has(c.id))
                  .length
              }{" "}
              / {chapters.filter((c) => c.track === track).length}
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
                  <small className="nav-local">Local Python practice</small>
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
                <ArrowLeft size={14} />
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
                  className="icon-button"
                  href={`/learn/${previous.id}/`}
                  aria-label="Previous lesson"
                >
                  <ArrowLeft size={17} />
                </Link>
              )}
              <span>
                {position + 1} / {siblings.length}
              </span>
              {next && (
                <Link
                  className="icon-button"
                  href={`/learn/${next.id}/`}
                  aria-label="Next lesson"
                >
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          )}
        </header>
        {children}
      </main>
    </div>
  );
}
