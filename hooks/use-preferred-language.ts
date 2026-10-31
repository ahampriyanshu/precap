"use client";
import { useSyncExternalStore } from "react";
import { isLanguage } from "@/lib/languages";
import type { Language } from "@/lib/types";

const key = "precap:practice-language:v1";
const event = "precap:language";
const defaultLanguage: Language = "python";
let memory: Language = defaultLanguage;
let volatile = false;
function snapshot(): Language {
  if (volatile) return memory;
  try {
    const stored = localStorage.getItem(key);
    return stored && isLanguage(stored) ? stored : defaultLanguage;
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
