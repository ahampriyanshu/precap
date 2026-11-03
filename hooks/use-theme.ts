"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

export const themeStorageKey = "precap:theme:v1";
export const themeEventName = "precap:theme";
const defaultTheme: Theme = "light";

let memory: Theme = defaultTheme;
let volatile = false;

function snapshot(): Theme {
  if (volatile) return memory;
  try {
    if (typeof window === "undefined") return defaultTheme;
    const stored = localStorage.getItem(themeStorageKey);
    if (stored === "dark" || stored === "light") return stored;
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") return attr;
    return defaultTheme;
  } catch {
    return memory;
  }
}

function serverSnapshot(): Theme {
  return defaultTheme;
}

function subscribe(update: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === themeStorageKey || e.key === null) {
      volatile = false;
      const current = snapshot();
      document.documentElement.setAttribute("data-theme", current);
      update();
    }
  };
  window.addEventListener(themeEventName, update);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(themeEventName, update);
    window.removeEventListener("storage", onStorage);
  };
}

export function setTheme(theme: Theme) {
  memory = theme;
  try {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    volatile = true;
  }
  try {
    window.dispatchEvent(new Event(themeEventName));
  } catch {}
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [theme]);

  return {
    theme,
    isDark: theme === "dark",
    setTheme,
    toggleTheme,
  };
}
