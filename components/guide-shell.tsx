"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
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
  const { menu, setMenu, sidebarRef, isMobile } = useNavigationMenu(true);
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

      <button
        type="button"
        className="mobile-sidebar-toggle"
        onClick={() => setMenu(!menu)}
        aria-label={`Open ${navigationLabel.toLowerCase()}`}
      >
        <Menu size={20} />
      </button>

      <div className="workspace-body">
        <AppSidebar
          currentGuide={guide.slug}
          currentPart={partSlug}
          currentCheatsheet={cheatsheet?.slug}
          navigationLabel={navigationLabel}
          menu={menu}
          setMenu={setMenu}
          sidebarRef={sidebarRef}
          isMobile={isMobile}
        />

        <main
          className="studio"
          inert={isMobile && menu ? true : undefined}
          id="main-panel"
          tabIndex={-1}
        >
          <div className="studio-header">
            <div className="studio-breadcrumb">
              <Link href="/">Home</Link>
              <span className="breadcrumb-slash">/</span>
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
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
