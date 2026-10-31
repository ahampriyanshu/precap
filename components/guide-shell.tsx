"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Brand } from "./brand";
import { LanguageSelect } from "./language-select";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
import { guideUrl, cheatsheetUrl } from "@/lib/guide-utils";
import type { Guide, Cheatsheet } from "@/lib/types";

export function GuideShell({
  guide,
  partSlug,
  guides,
  cheatsheets,
  cheatsheet,
  children,
}: {
  guide: Guide;
  partSlug: string;
  guides: Guide[];
  cheatsheets: Cheatsheet[];
  cheatsheet?: Cheatsheet;
  children: ReactNode;
}) {
  const { menu, setMenu, sidebarRef } = useNavigationMenu();
  const position = guide.parts.findIndex((part) => part.slug === partSlug);
  const part = guide.parts[position];
  const sequential = guide.sequential !== false;
  const previous = guide.parts[position - 1],
    next = guide.parts[position + 1];
  const navigationLabel = cheatsheet
    ? "Cheatsheet navigation"
    : "Guide navigation";
  return (
    <div className="workspace-shell guide-mode">
      <a className="skip-link" href="#main-panel">
        Skip to {cheatsheet ? "cheatsheet" : "guide"}
      </a>
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
        <div className="sidebar-list guide-navigation">
          <nav aria-label="Playlists">
            <h2 className="guide-nav-label">Playlists</h2>
            {guides.map((item) => (
              <details
                className="guide-nav-group"
                key={item.slug}
                open={item.slug === guide.slug}
              >
                <summary>{item.title}</summary>
                <Link
                  className="playlist-overview-link"
                  href={`/guides/${item.slug}/`}
                  onClick={() => setMenu(false)}
                >
                  Playlist overview
                </Link>
                {item.parts.map((entry, index) => {
                  const active =
                    !cheatsheet &&
                    item.slug === guide.slug &&
                    entry.slug === partSlug;
                  return (
                    <div key={entry.slug}>
                      {entry.module &&
                        entry.module !== item.parts[index - 1]?.module && (
                          <p className="nav-module">{entry.module}</p>
                        )}
                      <Link
                        className={`nav-chapter ${active ? "active" : ""}`}
                        href={guideUrl(item.slug, entry.slug)}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMenu(false)}
                      >
                        <span className="nav-number">{index + 1}</span>
                        <span>{entry.label || entry.title}</span>
                      </Link>
                    </div>
                  );
                })}
              </details>
            ))}
          </nav>
          <nav className="cheatsheet-navigation" aria-label="Cheatsheets">
            <h2 className="guide-nav-label">Cheatsheets</h2>
            {cheatsheets.map((sheet) => (
              <Link
                className={`nav-chapter ${cheatsheet?.slug === sheet.slug ? "active" : ""}`}
                key={sheet.slug}
                href={cheatsheetUrl(sheet.slug)}
                aria-current={
                  cheatsheet?.slug === sheet.slug ? "page" : undefined
                }
                onClick={() => setMenu(false)}
              >
                <span>{sheet.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <Link className="sidebar-footer guide-practice-link" href="/#courses">
          Coding & design practice
        </Link>
      </aside>
      <main className="studio" inert={menu} id="main-panel" tabIndex={-1}>
        <header className="studio-header">
          <div className="studio-breadcrumb">
            <button
              className="icon-button nav-open"
              onClick={() => setMenu(true)}
              aria-label={`Open ${navigationLabel.toLowerCase()}`}
            >
              <Menu size={19} />
            </button>
            {cheatsheet ? (
              <span>Cheatsheets</span>
            ) : (
              <Link href={`/guides/${guide.slug}/`}>{guide.title}</Link>
            )}
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-title">
              {cheatsheet?.title || part.title}
            </span>
          </div>
          {!cheatsheet && sequential && guide.parts.length > 1 && (
            <div className="chapter-pager">
              {previous && (
                <Link
                  className="pager-link"
                  href={guideUrl(guide.slug, previous.slug)}
                  aria-label="Previous part"
                >
                  Previous
                </Link>
              )}
              <span>
                {position + 1} / {guide.parts.length}
              </span>
              {next && (
                <Link
                  className="pager-link"
                  href={guideUrl(guide.slug, next.slug)}
                  aria-label="Next part"
                >
                  Next
                </Link>
              )}
            </div>
          )}
          {cheatsheet ? (
            <Link
              className="reference-header-link"
              href={guideUrl(guide.slug, partSlug)}
            >
              Read lesson
            </Link>
          ) : part.cheatsheet ? (
            <Link
              className="reference-header-link"
              href={cheatsheetUrl(part.cheatsheet)}
            >
              Cheatsheet
            </Link>
          ) : null}
          <LanguageSelect />
        </header>
        {children}
      </main>
    </div>
  );
}
