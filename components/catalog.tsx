"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Search } from "lucide-react";
import { Brand } from "./brand";
import { useProgress } from "@/hooks/use-progress";
import { guideUrl, cheatsheetUrl } from "@/lib/guide-utils";
import type { Chapter, Guide, Cheatsheet } from "@/lib/types";
import { courses, tracks } from "@/lib/courses";

export function Catalog({
  chapters,
  guides,
  cheatsheets,
}: {
  chapters: Chapter[];
  guides: Guide[];
  cheatsheets: Cheatsheet[];
}) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !(
          event.target instanceof HTMLElement &&
          (event.target.isContentEditable ||
            /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))
        )
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);
  const { completed } = useProgress(chapters);
  const term = query.trim().toLowerCase();
  const matches = (chapter: Chapter) =>
    `${courses[chapter.track].title} ${chapter.title} ${chapter.concept}`
      .toLowerCase()
      .includes(term);
  const visibleGuides = guides
    .map((guide) => ({
      ...guide,
      parts: guide.parts.filter((part) =>
        `${guide.title} ${guide.description} ${part.title} ${part.description} ${part.keywords.join(" ")}`
          .toLowerCase()
          .includes(term),
      ),
    }))
    .filter((guide) => guide.parts.length);
  const visibleCheatsheets = cheatsheets.filter((sheet) =>
    `${sheet.title} ${sheet.description} ${sheet.keywords.join(" ")}`
      .toLowerCase()
      .includes(term),
  );
  const visibleTracks = tracks.filter((track) =>
    chapters.some((chapter) => chapter.track === track && matches(chapter)),
  );
  return (
    <div className="catalog">
      <a className="skip-link" href="#main-content">
        Skip to topics
      </a>
      <header className="site-header">
        <Brand />
        <nav className="site-links" aria-label="Main navigation">
          <a className="text-link" href="#guides">
            Field guides
          </a>
          <a className="text-link" href="#cheatsheets">
            Cheatsheets
          </a>
          <a className="text-link" href="#courses">
            Practice
          </a>
        </nav>
      </header>
      <main className="catalog-main" id="main-content" tabIndex={-1}>
        <section className="catalog-intro">
          <p className="intro-kicker">
            A refresher for senior & staff engineers
          </p>
          <h1>
            A clear head for
            <br />
            the next interview.
          </h1>
          <p className="intro-copy">
            Revisit the decisions behind software that ships.
            <br className="desktop-break" /> The tradeoffs, failure modes, and
            judgment worth keeping fresh.
          </p>
        </section>
        <section id="guides" className="guides-section">
          <div className="section-heading">
            <div>
              <h2>Field guides</h2>
              <p className="section-description">
                Connected recaps of production decisions and their tradeoffs.
              </p>
            </div>
            <label className="search-field">
              <Search size={16} />
              <input
                ref={searchRef}
                aria-label="Search topics"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a topic or tool…"
              />
              <kbd>/</kbd>
            </label>
          </div>
          {!!visibleGuides.length && (
            <div className="guide-grid">
              {visibleGuides.map((guide) => (
                <article className="guide-card" key={guide.slug}>
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                  <ol className="guide-parts">
                    {guide.parts.map((part) => (
                      <li key={part.slug}>
                        <Link href={guideUrl(guide.slug, part.slug)}>
                          {guide.sequential !== false &&
                            guide.parts.length > 1 && (
                              <span
                                className="guide-part-number"
                                aria-hidden="true"
                              >
                                {guides
                                  .find((item) => item.slug === guide.slug)!
                                  .parts.findIndex(
                                    (item) => item.slug === part.slug,
                                  ) + 1}
                              </span>
                            )}
                          <span className="guide-part-title">
                            {part.label || part.title}
                          </span>
                          <ArrowRight size={15} />
                        </Link>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          )}
          {term && !visibleGuides.length && (
            <p className="no-matches">
              No field guides match “{query.trim()}”.
            </p>
          )}
        </section>
        <section id="cheatsheets" className="cheatsheets-section">
          <div className="section-heading">
            <div>
              <h2>Cheatsheets</h2>
              <p className="section-description">
                Commands and workflows, linked to the decisions behind them.
              </p>
            </div>
          </div>
          <div className="cheatsheet-list">
            {visibleCheatsheets.map((sheet) => (
              <Link
                className="cheatsheet-row"
                href={cheatsheetUrl(sheet.slug)}
                key={sheet.slug}
              >
                <span>
                  <strong>{sheet.title}</strong>
                  <small>{sheet.description}</small>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
          {term && !visibleCheatsheets.length && (
            <p className="no-matches">No cheatsheets match “{query.trim()}”.</p>
          )}
        </section>
        <section id="courses" className="courses-section">
          <div className="section-heading">
            <div>
              <h2>Coding & design practice</h2>
              <p className="section-description">
                Code a solution or diagram an architecture.
              </p>
            </div>
          </div>
          <div className="track-grid">
            {visibleTracks.map((track) => {
              const items = chapters.filter(
                (chapter) => chapter.track === track,
              );
              const done = items.filter((chapter) =>
                completed.has(chapter.id),
              ).length;
              const sections = [
                ...new Set(items.map((chapter) => chapter.section)),
              ];
              const resume =
                items.find((chapter) => !completed.has(chapter.id)) ?? items[0];
              return (
                <article key={track} className={`track-card track-${track}`}>
                  <div className="track-card-heading">
                    <div className="track-meta">
                      <span>{items.length} lessons</span>
                      <span>
                        {done} {track === "hld" ? "reviewed" : "completed"}
                      </span>
                    </div>
                    <h3>{courses[track].title}</h3>
                    <p>{courses[track].description}</p>
                    <Link
                      className="text-link course-start"
                      href={`/learn/${resume.id}/`}
                    >
                      {track === "hld"
                        ? "Browse design briefs"
                        : done
                          ? "Continue course"
                          : "Browse lessons"}
                      <ArrowRight size={15} />
                    </Link>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={items.length}
                      aria-valuenow={done}
                      aria-label={`${courses[track].title}: ${done} of ${items.length} lessons ${track === "hld" ? "reviewed" : "completed"}`}
                    >
                      <span
                        style={{ width: `${(done / items.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="chapter-groups">
                    {sections.map((section) => {
                      const lessons = items.filter(
                        (chapter) =>
                          chapter.section === section && matches(chapter),
                      );
                      if (!lessons.length) return null;
                      return (
                        <details
                          className="chapter-group"
                          key={section}
                          open={term ? true : undefined}
                        >
                          <summary>
                            <ChevronDown size={15} />
                            <span>{section}</span>
                            <span className="group-count">
                              {lessons.length}
                            </span>
                          </summary>
                          <div>
                            {lessons.map((chapter) => (
                              <Link
                                className="catalog-chapter"
                                key={chapter.id}
                                href={`/learn/${chapter.id}/`}
                              >
                                <span
                                  className={`chapter-number ${completed.has(chapter.id) ? "is-complete" : ""}`}
                                >
                                  {completed.has(chapter.id) ? (
                                    <Check size={13} />
                                  ) : (
                                    chapter.number
                                  )}
                                </span>
                                <span>
                                  <strong>{chapter.title}</strong>
                                  <small>{chapter.concept}</small>
                                </span>
                                {chapter.native && (
                                  <span className="local-badge">
                                    Local Python
                                  </span>
                                )}
                                <ArrowRight
                                  className="chapter-link-arrow"
                                  size={14}
                                />
                              </Link>
                            ))}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
          {!visibleTracks.length && (
            <p className="no-matches">
              No practice lessons match “{query.trim()}”.
            </p>
          )}
        </section>
        {term &&
          !visibleGuides.length &&
          !visibleCheatsheets.length &&
          !visibleTracks.length && (
            <p className="search-empty" role="status">
              Try another topic, tool, or course name.
            </p>
          )}
        <footer className="catalog-footer">
          <span>precap · Keep your experience in focus.</span>
          <span>Practice code and progress stay in this browser.</span>
        </footer>
      </main>
    </div>
  );
}
