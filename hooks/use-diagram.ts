"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  blankDiagram,
  loadDiagram,
  saveDiagram,
  type DiagramWork,
} from "@/lib/diagram-storage";

type SaveState = "saved" | "saving" | "error" | "disabled";
export function useDiagram(id: string) {
  const [work, setWork] = useState<DiagramWork>(blankDiagram);
  const current = useRef(work);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const enabled = useRef(false);
  const dirty = useRef(false);
  const revision = useRef(0);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    if (!enabled.current || !dirty.current) return;
    const snapshot = current.current;
    const version = revision.current;
    try {
      await saveDiagram(id, snapshot);
      if (version === revision.current) {
        dirty.current = false;
        if (mounted.current) setSaveState("saved");
      }
    } catch {
      if (mounted.current) setSaveState("error");
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    mounted.current = true;
    loadDiagram(id)
      .then((stored) => {
        if (!active) return;
        current.current = stored ?? blankDiagram();
        setWork(current.current);
        enabled.current = true;
        setReady(true);
        setLoadError(false);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
      mounted.current = false;
      void persist();
    };
  }, [id, attempt, persist]);

  useEffect(() => {
    const flush = () => {
      void persist();
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [persist]);

  const update = useCallback(
    (patch: Partial<Pick<DiagramWork, "scene" | "notes" | "reviewed">>) => {
      const previous = current.current;
      if (
        Object.entries(patch).every(
          ([key, value]) => previous[key as keyof DiagramWork] === value,
        )
      )
        return;
      const value = { ...previous, ...patch, updatedAt: Date.now() };
      if (
        (patch.scene !== undefined || patch.notes !== undefined) &&
        patch.reviewed === undefined
      )
        value.reviewed = false;
      current.current = value;
      setWork(value);
      revision.current += 1;
      dirty.current = true;
      if (enabled.current) {
        setSaveState("saving");
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          void persist();
        }, 350);
      }
    },
    [persist],
  );

  return {
    work,
    ready,
    saveState,
    loadError,
    update,
    retryLoad: () => {
      setLoadError(false);
      setAttempt((value) => value + 1);
    },
    continueUnsaved: () => {
      enabled.current = false;
      setSaveState("disabled");
      setLoadError(false);
      setReady(true);
    },
    retrySave: () => {
      setSaveState("saving");
      void persist();
    },
    flush: persist,
  };
}
