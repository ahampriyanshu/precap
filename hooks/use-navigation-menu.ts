"use client";
import { useEffect, useRef, useState } from "react";

export function useNavigationMenu(defaultDesktopOpen = false) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 1050;
    }
    return false;
  });

  const [menu, setMenu] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 1050) {
      return false;
    }
    return defaultDesktopOpen;
  });

  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1050;
      setIsMobile(mobile);
      if (mobile && defaultDesktopOpen) {
        setMenu(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [defaultDesktopOpen]);

  useEffect(() => {
    if (!menu || !isMobile) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const sidebar = sidebarRef.current;
    const timer = setTimeout(() => {
      sidebar?.querySelector<HTMLButtonElement>("button")?.focus();
    }, 0);
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
      if (event.key !== "Tab" || !sidebar) return;
      const controls = sidebar.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input",
      );
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", keyboard);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [menu, isMobile]);

  return { menu, setMenu, sidebarRef, isMobile };
}
