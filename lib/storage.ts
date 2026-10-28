import type { SavedWork } from "./types";

const prefix = "python-dsa:work:v2:";
export function loadWork(id: string): SavedWork | null {
  try {
    const raw = localStorage.getItem(prefix + id);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (typeof value.code !== "string") return null;
    return {
      code: value.code,
      prototype: value.prototype === true,
      final: value.final === true,
      localCompleted: value.localCompleted === true,
    };
  } catch {
    return null;
  }
}
export function saveWork(id: string, work: SavedWork): boolean {
  try {
    localStorage.setItem(prefix + id, JSON.stringify(work));
    window.dispatchEvent(new Event("lessons:progress"));
    return true;
  } catch {
    return false;
  }
}
