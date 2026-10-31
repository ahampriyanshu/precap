"use client";
import { useSyncExternalStore } from "react";
import { isLanguage } from "@/lib/languages";
import type { Language } from "@/lib/types";

const key = "precap:practice-language:v1";
const event = "precap:language";
const defaultLanguage: Language = "python";
let memory: Language = defaultLanguage;
let volatile = false;
function getBackup(): Language | null {
  try {
    if (typeof window !== "undefined" && window.name && isLanguage(window.name))
      return window.name;
  } catch {}
  return null;
}
function snapshot(): Language {
  if (volatile) return memory;
  try {
    const stored = localStorage.getItem(key);
    if (stored && isLanguage(stored)) return stored;
    const backup = getBackup();
    if (backup) return backup;
    return defaultLanguage;
  } catch {
    return memory;
  }
}
function subscribe(update: () => void) {
  const changed = (value: StorageEvent) => {
    if (value.key === key || value.key === null) {
      volatile = false;
      update();
    }
  };
  window.addEventListener(event, update);
  window.addEventListener("storage", changed);
  return () => {
    window.removeEventListener(event, update);
    window.removeEventListener("storage", changed);
  };
}
export function setPreferredLanguage(language: Language) {
  memory = language;
  try {
    if (typeof window !== "undefined") window.name = language;
  } catch {}
  try {
    localStorage.setItem(key, language);
    volatile = false;
  } catch {
    volatile = true;
  }
  window.dispatchEvent(new Event(event));
}
export function usePreferredLanguage() {
  const language = useSyncExternalStore(
    subscribe,
    snapshot,
    () => defaultLanguage,
  );
  return { language, setLanguage: setPreferredLanguage };
}
