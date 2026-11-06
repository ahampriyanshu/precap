"use client";

import { useState } from "react";
import Link from "next/link";
import type { CaseStudy, CaseStudyTag } from "@/lib/types";
import { caseStudyUrl } from "@/lib/guide-utils";

const ALL_TAGS: { label: string; value: CaseStudyTag | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Outage", value: "outage" },
  { label: "Migration", value: "migration" },
  { label: "Scale", value: "scale" },
  { label: "Architecture", value: "architecture" },
  { label: "Reliability", value: "reliability" },
];

export function CaseStudyIndex({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const [activeTag, setActiveTag] = useState<CaseStudyTag | "all">("all");

  const visible =
    activeTag === "all"
      ? caseStudies
      : caseStudies.filter((cs) => cs.tag === activeTag);

  return (
    <div className="case-studies-index">
      <header className="case-studies-header">
        <p className="lesson-kicker">Engineering · Real incidents &amp; decisions</p>
        <h1>Case Studies</h1>
        <p className="lesson-focus">
          How companies handled scale, recovered from outages, and made
          architectural bets. The tradeoffs that played out under real load.
        </p>
      </header>

      <div className="case-study-filter-bar" role="group" aria-label="Filter by tag">
        {ALL_TAGS.map(({ label, value }) => (
          <button
            key={value}
            className={`case-study-filter-btn ${activeTag === value ? "active" : ""}`}
            onClick={() => setActiveTag(value)}
            aria-pressed={activeTag === value}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="case-study-grid">
        {visible.map((cs) => (
          <article key={cs.slug} className="case-study-card">
            <div className="case-study-card-meta">
              <span className="case-study-company">{cs.company}</span>
              <span className={`case-study-tag tag-${cs.tag}`}>{cs.tag}</span>
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

      {visible.length === 0 && (
        <p className="case-study-empty" role="status">
          No case studies match this filter.
        </p>
      )}
    </div>
  );
}
