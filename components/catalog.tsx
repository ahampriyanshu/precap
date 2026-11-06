"use client";
import { useState } from "react";
import Link from "next/link";
import { O1onMark } from "./o1on-mark";
import { ThemeToggle } from "./theme-toggle";
import type { Chapter, Guide, Cheatsheet, CaseStudy } from "@/lib/types";
import { guideUrl, cheatsheetUrl, caseStudyUrl } from "@/lib/guide-utils";
import { courses } from "@/lib/courses";
import { TechLogo } from "./tech-logo";

function Sheets({ sheets }: { sheets: Cheatsheet[] }) {
  return (
    <div className="cheatsheet-list">
      {sheets.map((sheet) => (
        <Link
          className="cheatsheet-row"
          href={cheatsheetUrl(sheet.slug)}
          key={sheet.slug}
        >
          <div className="cheatsheet-icon">
            <TechLogo slug={sheet.slug} size={28} />
          </div>
          <div className="cheatsheet-info">
            <strong>{sheet.title}</strong>
            <small>{sheet.description}</small>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Catalog({
  chapters,
  guides,
  cheatsheets,
  caseStudies,
}: {
  chapters: Chapter[];
  guides: Guide[];
  cheatsheets: Cheatsheet[];
  caseStudies: CaseStudy[];
}) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();

  const matchingChapters = chapters.filter((chapter) =>
    `${courses[chapter.track]?.title || chapter.track} ${chapter.title} ${chapter.concept}`
      .toLowerCase()
      .includes(term),
  );

  const visibleGuides = guides
    .map((guide) => ({
      ...guide,
      parts: guide.parts.filter((part) =>
        `${guide.title} ${guide.description} ${part.module || ""} ${part.title} ${part.description} ${part.keywords?.join(" ") || ""}`
          .toLowerCase()
          .includes(term),
      ),
    }))
    .filter((guide) => guide.parts.length);

  const visibleSheets = cheatsheets.filter((sheet) =>
    `${sheet.title} ${sheet.description} ${sheet.keywords?.join(" ") || ""}`
      .toLowerCase()
      .includes(term),
  );

  const visibleCaseStudies = caseStudies.filter((cs) =>
    `${cs.company} ${cs.title} ${cs.description} ${cs.tag} ${cs.keywords.join(" ")}`
      .toLowerCase()
      .includes(term),
  );

  const hasSearchResults =
    matchingChapters.length > 0 ||
    visibleGuides.length > 0 ||
    visibleSheets.length > 0 ||
    visibleCaseStudies.length > 0;

  return (
    <div className="home-page">
      <header className="home-header">
        <Link className="home-logo" href="/" aria-label="o1on home">
          <O1onMark size={20} className="home-logo-mark" />
          <span>o1on</span>
        </Link>
        <div className="home-header-right">
          <label className="home-search-label">
            <span className="home-search-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
            </span>
            <input
              className="home-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons"
              aria-label="Search lessons"
            />
          </label>
          <ThemeToggle />
        </div>
      </header>
      {term ? (
        <main className="home-search-section">
          <div className="home-search-header">
            <h2>Search results for &ldquo;{query}&rdquo;</h2>
            <button
              type="button"
              className="home-clear-btn"
              onClick={() => setQuery("")}
            >
              Clear search
            </button>
          </div>

          {!hasSearchResults ? (
            <p className="search-empty" role="status">
              No matching lessons found for &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <section
              className="catalog-search-results"
              aria-label="Search results"
            >
              {[
                ...new Set(matchingChapters.map((chapter) => chapter.track)),
              ].map((track) => (
                <section className={`search-course track-${track}`} key={track}>
                  <h3>{courses[track]?.title || track}</h3>
                  {matchingChapters
                    .filter((chapter) => chapter.track === track)
                    .map((chapter) => (
                      <Link
                        key={chapter.id}
                        className="catalog-chapter"
                        href={`/learn/${chapter.id}/`}
                      >
                        <span className="chapter-number">{chapter.number}</span>
                        <span>
                          <strong>{chapter.title}</strong>
                          <small>{chapter.concept}</small>
                        </span>
                      </Link>
                    ))}
                </section>
              ))}

              {!!visibleGuides.length && (
                <div className="guide-grid">
                  {visibleGuides.map((guide) => (
                    <article key={guide.slug} className="guide-card">
                      <div className="guide-card-body">
                        <h3>
                          <Link
                            className="playlist-open"
                            href={`/guides/${guide.slug}/`}
                          >
                            {guide.title}
                          </Link>
                        </h3>
                        <p className="guide-search-desc">{guide.description}</p>
                        <ol className="guide-parts search-parts">
                          {guide.parts.map((part) => (
                            <li key={part.slug}>
                              <Link href={guideUrl(guide.slug, part.slug)}>
                                <span className="guide-part-title">
                                  {part.title}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {!!visibleSheets.length && <Sheets sheets={visibleSheets} />}

              {!!visibleCaseStudies.length && (
                <div className="case-study-grid search-case-studies">
                  {visibleCaseStudies.map((cs) => (
                    <article key={cs.slug} className="case-study-card">
                      <div className="case-study-card-meta">
                        <span className="case-study-company">{cs.company}</span>
                        <span className={`case-study-tag tag-${cs.tag}`}>
                          {cs.tag}
                        </span>
                        <span className="case-study-year">{cs.year}</span>
                      </div>
                      <h3 className="case-study-card-title">{cs.title}</h3>
                      <p className="case-study-card-desc">{cs.description}</p>
                      <Link
                        className="case-study-card-link"
                        href={caseStudyUrl(cs.slug)}
                      >
                        Read case study →
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      ) : (
        <main className="home-content">
          <section className="home-hero">
            <h1 className="home-title">
              Deadline driven{" "}
              <span className="home-highlight">preparation</span>
            </h1>
            <ul className="home-bullets">
              <li className="home-bullet-item">
                <span className="home-bullet-square" />
                <span>One path, in order</span>
              </li>
              <li className="home-bullet-item">
                <span className="home-bullet-square" />
                <span>Your code and progress stay in this browser</span>
              </li>
              <li className="home-bullet-item">
                <span className="home-bullet-square" />
                <span>Pick a stage and start</span>
              </li>
            </ul>
          </section>

          <section id="path" className="home-path">
            <div className="home-route">
              {/* Card 1: Machine coding */}
              <Link
                className="home-card"
                href="/learn/python/01-primitive-types/"
              >
                <div className="home-card-visual">
                  <svg
                    width="68"
                    height="68"
                    viewBox="0 0 120 120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect
                      x="10"
                      y="18"
                      width="92"
                      height="72"
                      rx="10"
                      fill="var(--white, #fff)"
                    />
                    <path d="M10 36H102" />
                    <circle
                      cx="22"
                      cy="27"
                      r="2.5"
                      fill="currentColor"
                      stroke="none"
                    />
                    <circle
                      cx="32"
                      cy="27"
                      r="2.5"
                      fill="currentColor"
                      stroke="none"
                    />
                    <circle
                      cx="42"
                      cy="27"
                      r="2.5"
                      fill="currentColor"
                      stroke="none"
                    />
                    <path d="M38 52L26 63l12 11M74 52l12 11-12 11M60 48l-8 30" />
                  </svg>
                </div>
                <h3 className="home-card-title">Machine coding</h3>
                <p className="home-card-desc">
                  Python fundamentals, then data structures and algorithms.
                </p>
                <div className="home-card-modules">
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      Python fundamentals
                    </span>
                    <span className="home-card-module-count">20 lessons</span>
                  </div>
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      Data structures &amp; algorithms
                    </span>
                    <span className="home-card-module-count">28 lessons</span>
                  </div>
                </div>
                <div className="home-card-footer">
                  <span className="home-card-meta">2 modules · [Y] hrs</span>
                  <span className="home-start-btn">
                    Start
                    <svg
                      className="home-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Card 2: Production engineering */}
              <Link className="home-card" href="/guides/frontend/">
                <div className="home-card-visual">
                  <svg
                    width="68"
                    height="68"
                    viewBox="0 0 120 120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <g transform="translate(0 11)">
                      <rect
                        x="16"
                        y="0"
                        width="88"
                        height="28"
                        rx="7"
                        fill="var(--white, #fff)"
                      />
                      <circle
                        cx="28"
                        cy="10"
                        r="2.5"
                        fill="currentColor"
                        stroke="none"
                      />
                      <circle
                        cx="37"
                        cy="10"
                        r="2.5"
                        fill="currentColor"
                        stroke="none"
                      />
                      <path d="M28 20h40M76 20h16" />
                      <path d="M60 28V40M55 35l5 5 5-5" />
                      <rect
                        x="16"
                        y="40"
                        width="88"
                        height="28"
                        rx="7"
                        fill="var(--white, #fff)"
                      />
                      <path d="M28 54h40" />
                      <circle
                        cx="90"
                        cy="54"
                        r="4"
                        fill="currentColor"
                        stroke="none"
                      />
                      <path d="M60 68V80M55 75l5 5 5-5" />
                      <rect
                        x="16"
                        y="80"
                        width="88"
                        height="28"
                        rx="7"
                        fill="var(--ink, #000)"
                      />
                      <rect
                        x="28"
                        y="88"
                        width="12"
                        height="12"
                        rx="2"
                        fill="var(--white, #fff)"
                        stroke="none"
                      />
                      <rect
                        x="46"
                        y="88"
                        width="12"
                        height="12"
                        rx="2"
                        fill="var(--white, #fff)"
                        stroke="none"
                      />
                      <rect
                        x="64"
                        y="88"
                        width="12"
                        height="12"
                        rx="2"
                        fill="var(--white, #fff)"
                        stroke="none"
                      />
                      <rect
                        x="82"
                        y="88"
                        width="12"
                        height="12"
                        rx="2"
                        fill="var(--white, #fff)"
                        stroke="none"
                      />
                    </g>
                  </svg>
                </div>
                <h3 className="home-card-title">Production engineering</h3>
                <p className="home-card-desc">
                  Frontend, backend, and DevOps as they run in production.
                </p>
                <div className="home-card-modules">
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      Frontend engineering
                    </span>
                    <span className="home-card-module-count">15 lessons</span>
                  </div>
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      Backend engineering
                    </span>
                    <span className="home-card-module-count">17 lessons</span>
                  </div>
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">DevOps</span>
                    <span className="home-card-module-count">13 lessons</span>
                  </div>
                </div>
                <div className="home-card-footer">
                  <span className="home-card-meta">3 modules · [Y] hrs</span>
                  <span className="home-start-btn">
                    Start
                    <svg
                      className="home-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Card 3: System design */}
              <Link
                className="home-card"
                href="/guides/backend/requests-and-protocols/"
              >
                <div className="home-card-visual">
                  <svg
                    width="68"
                    height="68"
                    viewBox="0 0 120 120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <g transform="translate(0 12)">
                      <path d="M60 26V40M22 40H98M22 40V52M60 40V52M98 40V52" />
                      <rect
                        x="34"
                        y="0"
                        width="52"
                        height="26"
                        rx="7"
                        fill="var(--ink, #000)"
                      />
                      <path
                        d="M46 10h28M46 17h16"
                        stroke="var(--white, #fff)"
                        strokeWidth="2.5"
                      />
                      <rect
                        x="6"
                        y="52"
                        width="32"
                        height="30"
                        rx="6"
                        fill="var(--white, #fff)"
                      />
                      <path d="M14 63h16M14 72h10" />
                      <rect
                        x="44"
                        y="52"
                        width="32"
                        height="30"
                        rx="6"
                        fill="var(--white, #fff)"
                      />
                      <path d="M52 63h16M52 72h16" />
                      <path
                        d="M84 62c0-4 6-6 14-6s14 2 14 6v14c0 4-6 6-14 6s-14-2-14-6z"
                        fill="var(--white, #fff)"
                      />
                      <path d="M84 62c0 4 6 6 14 6s14-2 14-6" />
                      <circle
                        cx="60"
                        cy="40"
                        r="3.5"
                        fill="currentColor"
                        stroke="none"
                      />
                    </g>
                  </svg>
                </div>
                <h3 className="home-card-title">System design</h3>
                <p className="home-card-desc">
                  System design basics, low-level design, and high-level design.
                </p>
                <div className="home-card-modules">
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      System design basics
                    </span>
                    <span className="home-card-module-count">8 lessons</span>
                  </div>
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      Low-level design
                    </span>
                    <span className="home-card-module-count">15 lessons</span>
                  </div>
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      High-level design
                    </span>
                    <span className="home-card-module-count">15 lessons</span>
                  </div>
                </div>
                <div className="home-card-footer">
                  <span className="home-card-meta">3 modules · [Y] hrs</span>
                  <span className="home-start-btn">
                    Start
                    <svg
                      className="home-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Card 4: HM round */}
              <Link className="home-card" href="/guides/last-mile-prep/">
                <div className="home-card-visual">
                  <svg
                    width="68"
                    height="68"
                    viewBox="0 0 120 120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path
                      d="M24 14h58a14 14 0 0 1 14 14v30a14 14 0 0 1-14 14H44L26 88V72h-2A14 14 0 0 1 10 58V28A14 14 0 0 1 24 14z"
                      fill="var(--white, #fff)"
                    />
                    <circle cx="53" cy="34" r="9" />
                    <path d="M34 62c2-12 10-16 19-16s17 4 19 16" />
                    <rect
                      x="58"
                      y="62"
                      width="58"
                      height="46"
                      rx="14"
                      fill="var(--white, #fff)"
                      stroke="none"
                    />
                    <path
                      d="M72 66h30a12 12 0 0 1 12 12v12a12 12 0 0 1-12 12H94l-12 10V102h-10A12 12 0 0 1 60 90V78A12 12 0 0 1 72 66z"
                      fill="var(--ink, #000)"
                    />
                    <path d="M76 84l7 7 13-14" stroke="var(--white, #fff)" />
                  </svg>
                </div>
                <h3 className="home-card-title">HM round</h3>
                <p className="home-card-desc">
                  The last mile before the hiring manager conversation.
                </p>
                <div className="home-card-modules">
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      Incident triage
                    </span>
                    <span className="home-card-module-count">3 lessons</span>
                  </div>
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      Product management
                    </span>
                    <span className="home-card-module-count">4 lessons</span>
                  </div>
                  <div className="home-card-module-item">
                    <span className="home-card-module-square" />
                    <span className="home-card-module-title">
                      Telemetry &amp; observability
                    </span>
                    <span className="home-card-module-count">3 lessons</span>
                  </div>
                </div>
                <div className="home-card-footer">
                  <span className="home-card-meta">3 modules · [Y] hrs</span>
                  <span className="home-start-btn">
                    Start
                    <svg
                      className="home-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </section>

          <section
            id="cheatsheets"
            className="path-cheatsheets home-cheatsheets"
          >
            <div className="section-heading">
              <h2>Technologies</h2>
              <p className="section-description">
                Keep the commands close. Save your memory for the decisions.
              </p>
            </div>
            <Sheets sheets={cheatsheets} />
          </section>

          <section
            id="case-studies"
            className="supplementary-section home-case-studies"
          >
            <div className="section-heading">
              <h2>Case Studies</h2>
              <p className="section-description">
                Real incidents and architectural decisions. See how the
                tradeoffs play out under load.
              </p>
            </div>
            <div className="case-study-grid">
              {caseStudies.slice(0, 4).map((cs) => (
                <article key={cs.slug} className="case-study-card">
                  <div className="case-study-card-meta">
                    <span className="case-study-company">{cs.company}</span>
                    <span className={`case-study-tag tag-${cs.tag}`}>
                      {cs.tag}
                    </span>
                    <span className="case-study-year">{cs.year}</span>
                  </div>
                  <h3 className="case-study-card-title">{cs.title}</h3>
                  <p className="case-study-card-desc">{cs.description}</p>
                  <Link
                    className="case-study-card-link"
                    href={caseStudyUrl(cs.slug)}
                  >
                    Read case study →
                  </Link>
                </article>
              ))}
            </div>
            <div className="section-view-all">
              <Link href="/case-studies/" className="view-all-link">
                View all case studies →
              </Link>
            </div>
          </section>
        </main>
      )}

      <footer className="home-footer">
        <span>
          made by{" "}
          <a
            href="https://ahampriyanshu.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            ahampriyanshu
          </a>
        </span>
        <span>Your code and progress stay in this browser.</span>
      </footer>
    </div>
  );
}
