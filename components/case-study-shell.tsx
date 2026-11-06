"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";
import type { CaseStudy } from "@/lib/types";

export function CaseStudyShell({
  caseStudies,
  currentSlug,
  children,
}: {
  caseStudies: CaseStudy[];
  currentSlug?: string;
  children: ReactNode;
}) {
  const { menu, setMenu, sidebarRef, isMobile } = useNavigationMenu(true);
  const current = currentSlug
    ? caseStudies.find((cs) => cs.slug === currentSlug)
    : undefined;

  return (
    <div className="workspace-shell guide-mode">
      <a className="skip-link" href="#main-panel">
        Skip to case study
      </a>

      <button
        type="button"
        className="mobile-sidebar-toggle"
        onClick={() => setMenu(!menu)}
        aria-label="Open case study navigation"
      >
        <Menu size={20} />
      </button>

      <div className="workspace-body">
        <AppSidebar
          currentCaseStudy={currentSlug}
          navigationLabel="Case study navigation"
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
              {current ? (
                <>
                  <Link href="/case-studies/">Case Studies</Link>
                  <span className="breadcrumb-slash">/</span>
                  <span className="breadcrumb-title">{current.title}</span>
                </>
              ) : (
                <span className="breadcrumb-title">Case Studies</span>
              )}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
