"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Check,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Content } from "./content";
import { PracticeDivider } from "./practice-divider";
import { usePracticeSplit } from "@/hooks/use-practice-split";
import { useDiagram } from "@/hooks/use-diagram";
import type { Lesson } from "@/lib/types";

const Canvas = dynamic(
  () => {
    Object.assign(window, { EXCALIDRAW_ASSET_PATH: "/excalidraw/" });
    return import("./diagram-canvas");
  },
  {
    ssr: false,
    loading: () => <div className="editor-loading">Loading Excalidraw…</div>,
  },
);

export function DiagramPractice({ lesson }: { lesson: Lesson }) {
  const split = usePracticeSplit();
  const draft = useDiagram(lesson.id);
  const question = split.collapsed !== "question";
  const canvasVisible = split.collapsed !== "editor";
  const [hasElements, setHasElements] = useState<boolean | null>(null);
  const nonempty =
    hasElements ??
    JSON.parse(draft.work.scene).elements.some(
      (element: { isDeleted?: boolean }) => !element.isDeleted,
    );
  const exportDiagram = () => {
    const blob = new Blob([draft.work.scene], {
      type: "application/vnd.excalidraw+json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lesson.slug}.excalidraw`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div
      ref={split.containerRef}
      className={`practice-flow diagram-flow ${question ? "" : "question-hidden"} ${canvasVisible ? "" : "editor-hidden"} ${split.dragging ? "is-resizing" : ""}`}
      style={{ gridTemplateColumns: split.columns }}
    >
      <div className="problem-heading">
        <h1>Design: {lesson.title}</h1>
        <div className="pane-actions">
          <button
            className="text-link question-toggle"
            aria-label={question ? "Hide brief" : "Show brief"}
            aria-expanded={question}
            aria-controls="practice-question"
            onClick={split.toggleQuestion}
          >
            {question ? (
              <PanelLeftClose size={16} />
            ) : (
              <PanelLeftOpen size={16} />
            )}
            <span className="pane-toggle-label">
              {question ? "Hide brief" : "Show brief"}
            </span>
          </button>
          <button
            className="text-link question-toggle"
            aria-label={canvasVisible ? "Hide canvas" : "Show canvas"}
            aria-expanded={canvasVisible}
            aria-controls="practice-editor"
            onClick={split.toggleEditor}
          >
            {canvasVisible ? (
              <PanelRightClose size={16} />
            ) : (
              <PanelRightOpen size={16} />
            )}
            <span className="pane-toggle-label">
              {canvasVisible ? "Hide canvas" : "Show canvas"}
            </span>
          </button>
        </div>
      </div>
      {question && (
        <section
          className="problem-panel"
          id="practice-question"
          aria-label="Design brief"
          tabIndex={0}
        >
          <Content markdown={lesson.practice} highlights={lesson.highlights} />
          <div className="design-notes">
            <label htmlFor="design-notes">Design notes</label>
            <p>
              Capture assumptions, sizing, and the tradeoffs behind your
              diagram.
            </p>
            <textarea
              id="design-notes"
              value={draft.work.notes}
              disabled={!draft.ready}
              onChange={(event) => draft.update({ notes: event.target.value })}
              placeholder="Assumptions and decisions…"
            />
          </div>
          <p className="design-review-hint">
            Review is your own assessment of the design.
          </p>
        </section>
      )}
      <PracticeDivider split={split} diagram />
      <section
        className="coding-panel diagram-panel"
        id="practice-editor"
        aria-label="Architecture canvas"
        hidden={!canvasVisible}
      >
        <div className="diagram-toolbar">
          <span className="diagram-save-state" role="status">
            {!draft.ready
              ? "Loading drawing…"
              : draft.saveState === "saved"
                ? "Saved on this device"
                : draft.saveState === "saving"
                  ? "Saving…"
                  : draft.saveState === "disabled"
                    ? "Autosave off"
                    : "Save failed"}
          </span>
          <div className="diagram-actions">
            <button
              className="text-link"
              onClick={exportDiagram}
              disabled={!draft.ready}
            >
              <Download size={15} />
              <span>Export diagram</span>
            </button>
            <button
              className={`button diagram-review ${draft.work.reviewed ? "is-reviewed" : ""}`}
              disabled={!draft.ready || !nonempty}
              aria-pressed={draft.work.reviewed}
              onClick={() => draft.update({ reviewed: !draft.work.reviewed })}
            >
              <Check size={14} />
              {draft.work.reviewed ? "Reviewed" : "Mark reviewed"}
            </button>
          </div>
        </div>
        {draft.loadError && (
          <div className="diagram-storage-message" role="alert">
            <p>
              Couldn’t load this saved diagram. Retry, or continue without
              autosave. Existing saved data will be kept.
            </p>
            <button className="text-link" onClick={draft.retryLoad}>
              Retry loading
            </button>
            <button className="text-link" onClick={draft.continueUnsaved}>
              Continue without autosave
            </button>
          </div>
        )}
        {(draft.saveState === "error" || draft.saveState === "disabled") && (
          <div className="diagram-storage-message" role="alert">
            <p>
              {draft.saveState === "error"
                ? "Couldn’t save this draft."
                : "Autosave is unavailable."}{" "}
              Export your diagram before leaving; copy your notes separately.
            </p>
            {draft.saveState === "error" && (
              <button className="text-link" onClick={draft.retrySave}>
                Retry saving
              </button>
            )}
          </div>
        )}
        <div className="diagram-canvas">
          {draft.ready && (
            <Canvas
              scene={draft.work.scene}
              name={lesson.title}
              onChange={(scene, present) => {
                setHasElements(present);
                draft.update({ scene });
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
