"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";
import { Brand } from "./brand";
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
        <Link className="all-courses" href="/">
          <ArrowLeft size={14} /> All topics
        </Link>
        <div className="sidebar-list guide-navigation">
          <nav aria-label="Field guides">
            <h2 className="guide-nav-label">Field guides</h2>
            {guides.map((item) => (
              <section className="guide-nav-group" key={item.slug}>
                <h3>{item.title}</h3>
                {item.parts.map((entry, index) => {
                  const active =
                    !cheatsheet &&
                    item.slug === guide.slug &&
                    entry.slug === partSlug;
                  return (
                    <Link
                      className={`nav-chapter ${active ? "active" : ""}`}
                      key={entry.slug}
                      href={guideUrl(item.slug, entry.slug)}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMenu(false)}
                    >
                      {item.sequential !== false && item.parts.length > 1 && (
                        <span className="nav-number">{index + 1}</span>
                      )}
                      <span>{entry.label || entry.title}</span>
                    </Link>
                  );
                })}
              </section>
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
          Coding & design practice <ArrowRight size={13} />
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
            <span>{cheatsheet ? "Cheatsheets" : guide.title}</span>
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-title">
              {cheatsheet?.title || part.title}
            </span>
          </div>
          {!cheatsheet && sequential && guide.parts.length > 1 && (
            <div className="chapter-pager">
              {previous && (
                <Link
                  className="icon-button"
                  href={guideUrl(guide.slug, previous.slug)}
                  aria-label="Previous part"
                >
                  <ArrowLeft size={17} />
                </Link>
              )}
              <span>
                {position + 1} / {guide.parts.length}
              </span>
              {next && (
                <Link
                  className="icon-button"
                  href={guideUrl(guide.slug, next.slug)}
                  aria-label="Next part"
                >
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          )}
          {cheatsheet ? (
            <Link
              className="reference-header-link"
              href={guideUrl(guide.slug, partSlug)}
            >
              Read recap
            </Link>
          ) : part.cheatsheet ? (
            <Link
              className="reference-header-link"
              href={cheatsheetUrl(part.cheatsheet)}
            >
              Cheatsheet
            </Link>
          ) : null}
        </header>
        {children}
      </main>
    </div>
  );
}
