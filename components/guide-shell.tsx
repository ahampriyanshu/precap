"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
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
        <SiteHeader
          className="studio-header"
          onMenuClick={() => setMenu(true)}
          menuAriaLabel={`Open ${navigationLabel.toLowerCase()}`}
          searchAriaLabel="Search course lessons"
          breadcrumb={
            <>
              {cheatsheet ? (
                <span>Cheatsheets</span>
              ) : (
                <Link href={`/guides/${guide.slug}/`}>{guide.title}</Link>
              )}
              <span className="breadcrumb-slash">/</span>
              <span className="breadcrumb-title">
                {cheatsheet?.title || part?.title || ""}
              </span>
            </>
          }
        />
        {children}
      </main>
    </div>
  );
}
