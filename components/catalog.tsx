"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Search, X } from "lucide-react";
import { SiteHeader } from "./site-header";
import { ConceptIllustration } from "./concept-illustration";
import { hasConceptArt } from "@/lib/concept-art";
import { useProgress } from "@/hooks/use-progress";
import { usePreferredLanguage } from "@/hooks/use-preferred-language";
import { guideUrl, cheatsheetUrl } from "@/lib/guide-utils";
import type { Chapter, Guide, Cheatsheet, Track } from "@/lib/types";
import { languageInfo, chapterForLanguage } from "@/lib/languages";
import { courses } from "@/lib/courses";
import { systemDesignBasics } from "@/lib/learning-path";

function ChapterLink({
  chapter,
  completed,
}: {
  chapter: Chapter;
  completed: Set<string>;
}) {
  return (
    <Link className="catalog-chapter" href={`/learn/${chapter.id}/`}>
      <span
        className={`chapter-number ${completed.has(chapter.id) ? "is-complete" : ""}`}
      >
        {completed.has(chapter.id) ? <Check size={13} /> : chapter.number}
      </span>
      <span>
        <strong>{chapter.title}</strong>
        <small>{chapter.concept}</small>
      </span>
      {chapter.native && (
        <span className="local-badge">
          Local {languageInfo[chapter.language || "python"].label}
        </span>
      )}
    </Link>
  );
}
function Course({
  items,
  completed,
  title,
  track,
}: {
  items: Chapter[];
  completed: Set<string>;
  title: string;
  track: Track;
}) {
  if (!items.length) return null;
  const done = items.filter((chapter) => completed.has(chapter.id)).length;
  const resume =
    items.find((chapter) => !completed.has(chapter.id)) || items[0];
  const sections = [...new Set(items.map((chapter) => chapter.section))];
  return (
    <article className={`path-course track-${track}`}>
      <div className="path-course-heading">
        <h3>{title}</h3>
        <span>{items.length} lessons</span>
      </div>
      {track !== "lld" && track !== "hld" && (
        <p>{courses[track].description}</p>
      )}
      <div className="path-course-actions">
        <Link
          className="button primary course-start"
          href={`/learn/${resume.id}/`}
        >
          {done ? "Resume" : "Start"}
        </Link>
        <span>
          {done} of {items.length} {track === "hld" ? "reviewed" : "completed"}
        </span>
      </div>
    </article>
  );
}
function GuideCard({
  guide,
  search = false,
}: {
  guide: Guide;
  search?: boolean;
}) {
  const tracks =
    guide.moduleLabel === "Track"
      ? [...new Set(guide.parts.map((part) => part.module).filter(Boolean))]
      : [];
  return (
    <article
      className={`guide-card ${tracks.length && !search ? "guide-card-tracks" : ""}`}
    >
      {!search && hasConceptArt(guide.slug) && (
        <ConceptIllustration concept={guide.slug} className="playlist-art" />
      )}
      <div className="playlist-meta">
        {tracks.length
          ? `${tracks.length} ${tracks.length === 1 ? "track" : "tracks"} · `
          : ""}
        {guide.parts.length} {guide.parts.length === 1 ? "lesson" : "lessons"}
      </div>
      <h3>{guide.title}</h3>
      <p>{guide.description}</p>
      {!search && !!tracks.length && (
        <ul className="guide-track-list" aria-label={`${guide.title} tracks`}>
          {tracks.map((track, index) => (
            <li key={track}>
              <Link href={`/guides/${guide.slug}/#module-${index + 1}`}>
                <span>{track}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link className="text-link playlist-open" href={`/guides/${guide.slug}/`}>
        Open playlist
      </Link>
      {search && (
        <ol className="guide-parts search-parts">
          {guide.parts.map((part) => (
            <li key={part.slug}>
              <Link href={guideUrl(guide.slug, part.slug)}>
                <span className="guide-part-title">{part.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
function Sheets({ sheets }: { sheets: Cheatsheet[] }) {
  return (
    <div className="cheatsheet-list">
      {sheets.map((sheet) => (
        <Link
          className="cheatsheet-row"
          href={cheatsheetUrl(sheet.slug)}
          key={sheet.slug}
        >
          <span>
            <strong>{sheet.title}</strong>
            <small>{sheet.description}</small>
          </span>
        </Link>
      ))}
    </div>
  );
}

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
  const { language, setLanguage } = usePreferredLanguage();
  const practiceChapters = useMemo(
    () =>
      chapters
        .filter(
          (chapter) =>
            chapter.track === "hld" ||
            (!!language && [language, "dsa", "lld"].includes(chapter.track)),
        )
        .map((chapter) =>
          language ? chapterForLanguage(chapter, language) : chapter,
        ),
    [chapters, language],
  );
  const { completed, started } = useProgress(practiceChapters);
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
  const chooseLanguage = () => {
    const select = document.querySelector<HTMLSelectElement>(
      'select[aria-label="Programming language"]',
    );
    select?.scrollIntoView({ block: "center", behavior: "smooth" });
    select?.focus();
  };
  const term = query.trim().toLowerCase();
  const matchingChapters = practiceChapters.filter((chapter) =>
    `${courses[chapter.track].title} ${chapter.title} ${chapter.concept}`
      .toLowerCase()
      .includes(term),
  );
  const visibleGuides = guides
    .map((guide) => ({
      ...guide,
      parts: guide.parts.filter((part) =>
        `${guide.title} ${guide.description} ${part.module || ""} ${part.title} ${part.description} ${part.keywords.join(" ")}`
          .toLowerCase()
          .includes(term),
      ),
    }))
    .filter((guide) => guide.parts.length);
  const visibleSheets = cheatsheets.filter((sheet) =>
    `${sheet.title} ${sheet.description} ${sheet.keywords.join(" ")}`
      .toLowerCase()
      .includes(term),
  );
  const items = (track: Track) =>
    practiceChapters.filter((chapter) => chapter.track === track);
  return (
    <div className="catalog path-catalog">
      <a className="skip-link" href="#main-content">
        Skip to topics
      </a>
      <SiteHeader />
      <main className="catalog-main" id="main-content" tabIndex={-1}>
        <section className="path-hero">
          <div className="hero-copy">
            <h1>Deadline Driven Preparation</h1>
            <p className="intro-copy">
              Revisit the fundamentals of the systems you know how to build.
            </p>
          </div>
          <ConceptIllustration
            concept="engineering-desk"
            className="hero-scene"
            priority
          />
        </section>
        <div className="path-section-heading" id="courses">
          <div>
            <h2>{term ? "Search topics" : "The core path"}</h2>
            <p>
              From implementation to architecture. Start where you need the
              refresher.
            </p>
          </div>
          <label className="search-field">
            <Search size={16} aria-hidden="true" />
            <input
              ref={searchRef}
              aria-label="Search topics"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a topic or tool…"
            />
            {query ? (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                <X size={14} />
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </label>
        </div>
        {term ? (
          <section
            className="catalog-search-results"
            aria-label="Search results"
          >
            {!language && (
              <p className="search-language-note">
                Choose a programming language above to include coding lessons.
              </p>
            )}
            {[...new Set(matchingChapters.map((chapter) => chapter.track))].map(
              (track) => (
                <section className={`search-course track-${track}`} key={track}>
                  <h3>{courses[track].title}</h3>
                  {matchingChapters
                    .filter((chapter) => chapter.track === track)
                    .map((chapter) => (
                      <ChapterLink
                        chapter={chapter}
                        completed={completed}
                        key={chapter.id}
                      />
                    ))}
                </section>
              ),
            )}
            {!!visibleGuides.length && (
              <div className="guide-grid">
                {visibleGuides.map((guide) => (
                  <GuideCard key={guide.slug} guide={guide} search />
                ))}
              </div>
            )}
            <Sheets sheets={visibleSheets} />
            {!matchingChapters.length &&
              !visibleGuides.length &&
              !visibleSheets.length && (
                <p className="search-empty" role="status">
                  No matching topics. Try another topic, tool, or course name.
                </p>
              )}
          </section>
        ) : (
          <>
            <ol
              className="learning-path"
              aria-label="Interview preparation path"
            >
              <li className="path-step">
                <div className="path-step-content">
                  <ConceptIllustration
                    concept="machine-coding"
                    className="path-art"
                  />
                  <div className="path-step-heading">
                    <h2>Machine coding</h2>
                    <p>
                      Refresh your language, then work through data structures
                      and algorithms.
                    </p>
                  </div>
                  {language ? (
                    <div className="machine-courses">
                      <Course
                        track={language}
                        items={items(language)}
                        title={`${languageInfo[language].label} fundamentals`}
                        completed={completed}
                      />
                      <Course
                        track="dsa"
                        items={items("dsa")}
                        title="Data structures & algorithms"
                        completed={completed}
                      />
                    </div>
                  ) : (
                    <button
                      className="text-link path-choose"
                      onClick={chooseLanguage}
                    >
                      Choose a language to start
                    </button>
                  )}
                </div>
              </li>
              <li className="path-step">
                <div className="path-step-content">
                  <ConceptIllustration
                    concept="system-basics"
                    className="path-art"
                  />
                  <div className="path-step-heading">
                    <h2>System design basics</h2>
                    <p>
                      Revisit the mechanisms that shape a distributed system
                      before designing one.
                    </p>
                  </div>
                  <div className="path-course-actions">
                    <Link
                      className="button primary course-start"
                      href={guideUrl("backend", systemDesignBasics[0].slug)}
                    >
                      Start
                    </Link>
                    <span>{systemDesignBasics.length} foundation lessons</span>
                  </div>
                </div>
              </li>
              <li className="path-step">
                <div className="path-step-content">
                  <ConceptIllustration
                    concept="low-level-design"
                    className="path-art"
                  />
                  <div className="path-step-heading">
                    <h2>Low-level design</h2>
                    <p>
                      Turn requirements into objects, interfaces, and invariants
                      that hold under change.
                    </p>
                  </div>
                  {language ? (
                    <Course
                      track="lld"
                      items={items("lld")}
                      title="Design exercises"
                      completed={completed}
                    />
                  ) : (
                    <button
                      className="text-link path-choose"
                      onClick={chooseLanguage}
                    >
                      Choose a language for LLD
                    </button>
                  )}
                </div>
              </li>
              <li className="path-step">
                <div className="path-step-content">
                  <ConceptIllustration
                    concept="high-level-design"
                    className="path-art"
                  />
                  <div className="path-step-heading">
                    <h2>High-level design</h2>
                    <p>
                      Draw service boundaries, data flows, and failure paths.
                      Defend your tradeoffs.
                    </p>
                  </div>
                  <Course
                    track="hld"
                    items={items("hld")}
                    title="Architecture practice"
                    completed={completed}
                  />
                </div>
              </li>
            </ol>
            <section id="guides" className="supplementary-section">
              <div className="section-heading">
                <div>
                  <h2>The engineering bookshelf</h2>
                  <p className="section-description">
                    A few subjects worth keeping close.
                  </p>
                </div>
              </div>
              <div className="guide-grid">
                {guides.map((guide) => (
                  <GuideCard guide={guide} key={guide.slug} />
                ))}
              </div>
            </section>
            <section id="cheatsheets" className="path-cheatsheets">
              <div className="section-heading">
                <div>
                  <h2>Tool cheatsheets</h2>
                  <p className="section-description">
                    Keep the commands close. Save your memory for the decisions.
                  </p>
                </div>
              </div>
              <Sheets sheets={cheatsheets} />
            </section>
          </>
        )}
        <footer className="catalog-footer">
          <span>made by ahampriyanshi</span>
          <span>Your code and progress stay in this browser.</span>
        </footer>
      </main>
    </div>
  );
}
