"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type Pane = "question" | "editor";
type Drag = {
  pointer: number;
  before: number;
  offset: number;
  edge: Pane | null;
};
const storageKey = "python-dsa:practice-width:v1";
const defaultWidth = 40;

export function usePracticeSplit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<Drag | null>(null);
  const widthRef = useRef(defaultWidth);
  const [width, setWidth] = useState(defaultWidth);
  const [collapsed, setCollapsed] = useState<Pane | null>(null);
  const [dragging, setDragging] = useState(false);
  const previousCollapsed = useRef<Pane | null>(null);

  const clamp = useCallback((value: number) => {
    const available = Math.max(
      1,
      (containerRef.current?.clientWidth ?? window.innerWidth) - 10,
    );
    // Preserve useful reading and editing space while both panes are visible.
    const minimum = window.innerWidth <= 720 ? 15 : (220 / available) * 100;
    const maximum =
      window.innerWidth <= 720 ? 85 : 100 - (360 / available) * 100;
    return Math.min(maximum, Math.max(minimum, value));
  }, []);
  const apply = useCallback(
    (value: number) => {
      const next = clamp(value);
      widthRef.current = next;
      setWidth(next);
      return next;
    },
    [clamp],
  );
  const remember = useCallback(
    (value: number) => {
      const next = apply(value);
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        /* Resizing still works when storage is unavailable. */
      }
    },
    [apply],
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const value = saved === null ? NaN : Number(saved);
      if (Number.isFinite(value) && value >= 10 && value <= 90) apply(value);
    } catch {
      /* Keep the default layout. */
    }
    const observer = new ResizeObserver(() => {
      if (!drag.current && window.innerWidth > 720) apply(widthRef.current);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [apply]);

  useEffect(() => {
    if (collapsed) restoreRef.current?.focus({ preventScroll: true });
    else if (previousCollapsed.current)
      separatorRef.current?.focus({ preventScroll: true });
    previousCollapsed.current = collapsed;
  }, [collapsed]);

  const finish = useCallback(
    (cancelled: boolean) => {
      const current = drag.current;
      if (!current) return;
      drag.current = null;
      setDragging(false);
      if (cancelled || current.edge) apply(current.before);
      else remember(widthRef.current);
      if (!cancelled && current.edge) setCollapsed(current.edge);
    },
    [apply, remember],
  );

  useEffect(() => {
    if (!dragging) return;
    const oldCursor = document.body.style.cursor;
    const oldSelection = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(true);
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.cursor = oldCursor;
      document.body.style.userSelect = oldSelection;
      window.removeEventListener("keydown", escape);
    };
  }, [dragging, finish]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || collapsed) return;
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointer: event.pointerId,
      before: widthRef.current,
      offset:
        event.clientX -
        bounds.left -
        ((bounds.width - 10) * widthRef.current) / 100,
      edge: null,
    };
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!current || current.pointer !== event.pointerId || !bounds) return;
    const value =
      ((event.clientX - bounds.left - current.offset) /
        Math.max(1, bounds.width - 10)) *
      100;
    current.edge = value <= 8 ? "question" : value >= 92 ? "editor" : null;
    apply(value);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointer !== event.pointerId) return;
    finish(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft") remember(widthRef.current - step);
    else if (event.key === "ArrowRight") remember(widthRef.current + step);
    else if (event.key === "Home") setCollapsed("question");
    else if (event.key === "End") setCollapsed("editor");
    else if (event.key === "Enter") remember(defaultWidth);
    else return;
    event.preventDefault();
  };

  return {
    containerRef,
    separatorRef,
    restoreRef,
    width,
    collapsed,
    dragging,
    restore: () => setCollapsed(null),
    hideQuestion: () => setCollapsed("question"),
    hideEditor: () => setCollapsed("editor"),
    toggleQuestion: () =>
      setCollapsed((value) => (value === "question" ? null : "question")),
    toggleEditor: () =>
      setCollapsed((value) => (value === "editor" ? null : "editor")),
    reset: () => remember(defaultWidth),
    separatorEvents: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: () => finish(true),
      onLostPointerCapture: () => finish(true),
      onKeyDown,
    },
    columns:
      collapsed === "question"
        ? "32px minmax(0, 1fr)"
        : collapsed === "editor"
          ? "minmax(0, 1fr) 32px"
          : `minmax(0, ${width}fr) 10px minmax(0, ${100 - width}fr)`,
  };
}
