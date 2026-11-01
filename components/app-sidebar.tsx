"use client";

import { useEffect, useState, type RefObject } from "react";
import Link from "next/link";
import { Check, ChevronDown, X } from "lucide-react";
import { Brand } from "./brand";
import { LanguageSelect } from "./language-select";
import { courses } from "@/lib/courses";
import type { Chapter } from "@/lib/types";
import {
  SIDEBAR_TRACKS,
  navChaptersByTrack,
  navGuides,
  navCheatsheets,
  type NavChapter,
} from "@/lib/navigation-data";
import { cheatsheetUrl, guideUrl } from "@/lib/guide-utils";

export interface AppSidebarProps {
  lesson?: Chapter;
  chapters?: Chapter[];
  practice?: boolean;
  currentTrack?: string;
  currentSlug?: string;
  currentGuide?: string;
  currentPart?: string;
  currentCheatsheet?: string;
  preferredLanguage?: string | null;
  completedSet?: Set<string>;
  navigationLabel?: string;
  menu: boolean;
  setMenu: (open: boolean) => void;
  sidebarRef: RefObject<HTMLElement | null>;
}

export function AppSidebar({
  lesson,
  chapters = [],
  practice = false,
  currentTrack,
  currentSlug,
  currentGuide,
  currentPart,
  currentCheatsheet,
  preferredLanguage,
  completedSet,
  navigationLabel = "Curriculum navigation",
  menu,
  setMenu,
  sidebarRef,
}: AppSidebarProps) {
  // Determine active group key
  let activeGroupKey = "";
  if (currentTrack) {
    activeGroupKey = `track:${currentTrack}`;
  } else if (currentGuide) {
    activeGroupKey = `guide:${currentGuide}`;
  } else if (currentCheatsheet) {
    activeGroupKey = "cheatsheets";
  }

  // Only the active group is open by default; everything else is collapsed
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    return activeGroupKey ? { [activeGroupKey]: true } : {};
  });

  // Whenever the active page changes, reset so only what reader is reading is open
  useEffect(() => {
    if (activeGroupKey) {
      setOpenGroups({ [activeGroupKey]: true });
    }
  }, [activeGroupKey]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getChapterUrl = (chapter: NavChapter) => {
    if (
      (chapter.track === "dsa" || chapter.track === "lld") &&
      preferredLanguage &&
      preferredLanguage !== "python"
    ) {
      return `/learn/${chapter.track}/${chapter.slug}/${preferredLanguage}/`;
    }
    return `/learn/${chapter.id}/`;
  };

  return (
    <>
      {menu && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMenu(false)}
          aria-label={`Close ${navigationLabel.toLowerCase()}`}
        />
      )}
      <aside
        ref={sidebarRef}
        className={`sidebar ${menu ? "is-open" : ""}`}
        role={menu ? "dialog" : undefined}
        aria-modal={menu || undefined}
        aria-label={navigationLabel}
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

        <div className="sidebar-language">
          <LanguageSelect
            lesson={lesson}
            chapters={chapters}
            practice={practice}
          />
        </div>

        <nav
          className="sidebar-list guide-navigation"
          aria-label={navigationLabel}
        >
          {/* Section 1: Tracks */}
          <div className="sidebar-section">
            <h2 className="guide-nav-label">Tracks</h2>
            {SIDEBAR_TRACKS.map((track) => {
              const groupKey = `track:${track}`;
              const isOpen = !!openGroups[groupKey];
              const trackChapters = navChaptersByTrack[track] || [];
              const trackTitle = courses[track]?.title || track;

              return (
                <details
                  key={groupKey}
                  className="guide-nav-group chapter-group"
                  open={isOpen}
                >
                  <summary
                    onClick={(e) => {
                      e.preventDefault();
                      toggleGroup(groupKey);
                    }}
                  >
                    <span>{trackTitle}</span>
                    <ChevronDown size={14} className="summary-chevron" />
                  </summary>
                  <div className="guide-nav-group-items">
                    {trackChapters.map((chapter) => {
                      const isActive =
                        currentTrack === track && currentSlug === chapter.slug;
                      const isComplete = completedSet?.has(chapter.id);

                      return (
                        <Link
                          key={chapter.id}
                          href={getChapterUrl(chapter)}
                          className={`nav-chapter ${isActive ? "active" : ""}`}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setMenu(false)}
                        >
                          {isComplete && (
                            <span className="nav-number is-complete">
                              <Check size={13} />
                            </span>
                          )}
                          <span>{chapter.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>

          {/* Section 2: Playlists */}
          <div className="sidebar-section">
            <h2 className="guide-nav-label">Playlists</h2>
            {navGuides.map((guide) => {
              const groupKey = `guide:${guide.slug}`;
              const isOpen = !!openGroups[groupKey];

              return (
                <details
                  key={groupKey}
                  className="guide-nav-group chapter-group"
                  open={isOpen}
                >
                  <summary
                    onClick={(e) => {
                      e.preventDefault();
                      toggleGroup(groupKey);
                    }}
                  >
                    <span>{guide.title}</span>
                    <ChevronDown size={14} className="summary-chevron" />
                  </summary>
                  <div className="guide-nav-group-items">
                    <Link
                      className="playlist-overview-link"
                      href={`/guides/${guide.slug}/`}
                      onClick={() => setMenu(false)}
                    >
                      Playlist overview
                    </Link>
                    {guide.parts.map((entry) => {
                      const isActive =
                        !currentCheatsheet &&
                        currentGuide === guide.slug &&
                        currentPart === entry.slug;

                      return (
                        <div key={entry.slug}>
                          {entry.module && (
                            <p className="nav-module">{entry.module}</p>
                          )}
                          <Link
                            className={`nav-chapter ${isActive ? "active" : ""}`}
                            href={guideUrl(guide.slug, entry.slug)}
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => setMenu(false)}
                          >
                            <span>{entry.label || entry.title}</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>

          {/* Section 3: Cheatsheets */}
          <div className="sidebar-section cheatsheet-navigation">
            <h2 className="guide-nav-label">Cheatsheets</h2>
            <details
              className="guide-nav-group chapter-group"
              open={!!openGroups["cheatsheets"]}
            >
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  toggleGroup("cheatsheets");
                }}
              >
                <span>Cheatsheets</span>
                <ChevronDown size={14} className="summary-chevron" />
              </summary>
              <div className="guide-nav-group-items">
                {navCheatsheets.map((sheet) => {
                  const isActive = currentCheatsheet === sheet.slug;

                  return (
                    <Link
                      key={sheet.slug}
                      className={`nav-chapter ${isActive ? "active" : ""}`}
                      href={cheatsheetUrl(sheet.slug)}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setMenu(false)}
                    >
                      <span>{sheet.title}</span>
                    </Link>
                  );
                })}
              </div>
            </details>
          </div>
        </nav>

        <div className="sidebar-footer">
          Your progress saves in this browser.
        </div>
      </aside>
    </>
  );
}
