"use client";
import { useEffect, useRef, useState } from "react";

export function useNavigationMenu() {
  const [menu, setMenu] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!menu) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const sidebar = sidebarRef.current;
    sidebar?.querySelector<HTMLButtonElement>("button")?.focus();
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
      document.removeEventListener("keydown", keyboard);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [menu]);
  return { menu, setMenu, sidebarRef };
}
