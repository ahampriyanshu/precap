"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "./app-sidebar";
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
      <button
        type="button"
        className="mobile-sidebar-toggle"
        onClick={() => setMenu(!menu)}
        aria-label="Open guide navigation"
      >
        <Menu size={20} />
      </button>
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
