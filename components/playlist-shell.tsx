"use client";

import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { useNavigationMenu } from "@/hooks/use-navigation-menu";

export function PlaylistShell({
  currentGuide,
  children,
}: {
  currentGuide: string;
  children: ReactNode;
}) {
  const { menu, setMenu, sidebarRef, isMobile } = useNavigationMenu(true);

  return (
    <div className="catalog playlist-index">
      <a className="skip-link" href="#main-content">
        Skip to curriculum
      </a>
      <SiteHeader
        onMenuClick={() => setMenu(!menu)}
        menuAriaLabel="Open guide navigation"
        searchAriaLabel="Search course lessons"
      />
      <div className="catalog-body">
        <AppSidebar
          currentGuide={currentGuide}
          navigationLabel="Guide navigation"
          menu={menu}
          setMenu={setMenu}
          sidebarRef={sidebarRef}
          isMobile={isMobile}
        />
        <main
          className="catalog-main"
          id="main-content"
          tabIndex={-1}
          inert={isMobile && menu ? true : undefined}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
