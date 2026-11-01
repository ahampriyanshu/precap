"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { NavbarSearch } from "./navbar-search";
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

      <AppSidebar
        currentGuide={guide.slug}
        currentPart={partSlug}
        currentCheatsheet={cheatsheet?.slug}
        navigationLabel={navigationLabel}
        menu={menu}
        setMenu={setMenu}
        sidebarRef={sidebarRef}
      />

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
              {cheatsheet?.title || part?.title || ""}
            </span>
          </div>

          <NavbarSearch />

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
          ) : part?.cheatsheet ? (
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
