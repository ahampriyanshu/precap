"use client";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import type { usePracticeSplit } from "@/hooks/use-practice-split";

export function PracticeDivider({
  split,
  diagram = false,
}: {
  split: ReturnType<typeof usePracticeSplit>;
  diagram?: boolean;
}) {
  const question = diagram ? "brief" : "question";
  const editor = diagram ? "canvas" : "editor";
  const collapsed = split.collapsed === "question" ? question : editor;
  return (
    <div className="practice-divider">
      {split.collapsed ? (
        <button
          ref={split.restoreRef}
          className="restore-pane"
          onClick={split.restore}
          aria-label={`Restore ${collapsed} pane`}
          title={`Restore ${collapsed}`}
        >
          {split.collapsed === "question" ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}
        </button>
      ) : (
        <>
          <div
            ref={split.separatorRef}
            className="splitter-handle"
            role="separator"
            tabIndex={0}
            aria-label="Resize practice panels"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(split.width)}
            aria-valuetext={`${question} ${Math.round(split.width)}%, ${editor} ${Math.round(100 - split.width)}%`}
            aria-controls="practice-question practice-editor"
            aria-describedby="splitter-help"
            title="Drag to resize; drag to an edge to collapse. Double-click to reset."
            {...split.separatorEvents}
            onDoubleClick={split.reset}
          />
          <div className="divider-tools">
            <button
              onClick={split.hideQuestion}
              aria-label={`Collapse ${question} pane`}
              title={`Collapse ${question}`}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="divider-grip" aria-hidden="true">
              <GripVertical size={15} />
            </span>
            <button
              onClick={split.hideEditor}
              aria-label={`Collapse ${editor} pane`}
              title={`Collapse ${editor}`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <span className="visually-hidden" id="splitter-help">
            Drag or use the arrow keys to resize. Home collapses the {question};
            End collapses the {editor}. Enter or double-click resets the split.
          </span>
        </>
      )}
    </div>
  );
}
