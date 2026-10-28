"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Code2,
  Download,
  FileCode2,
  LoaderCircle,
  Play,
  RotateCcw,
  Square,
} from "lucide-react";
import { Content } from "./content";
import { PracticeDivider } from "./practice-divider";
import { Results } from "./results";
import { usePython } from "@/hooks/use-python";
import { usePracticeSplit } from "@/hooks/use-practice-split";
import { loadWork, saveWork } from "@/lib/storage";
import { downloadChapter } from "@/lib/download";
import type { Lesson, Report, SavedWork, Stage } from "@/lib/types";

const CodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading editor…</div>,
});

export function Practice({ lesson }: { lesson: Lesson }) {
  const split = usePracticeSplit();
  const question = split.collapsed !== "question";
  const editorVisible = split.collapsed !== "editor";
  const [stage, setStage] = useState<Stage>("prototype");
  const [file, setFile] = useState<"exercise" | "tests">("exercise");
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const initial: SavedWork = {
    code: lesson.starter,
    prototype: false,
    final: false,
  };
  const [work, setWork] = useState(initial);
  const workRef = useRef(work);
  useEffect(() => {
    const stored = loadWork(lesson.id);
    if (stored) {
      workRef.current = stored;
      setWork(stored);
      if (stored.prototype) setStage("final");
    }
    setHydrated(true);
  }, [lesson.id]);
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmReset(false);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, []);
  const update = useCallback(
    (value: SavedWork) => {
      workRef.current = value;
      setWork(value);
      setSaved(saveWork(lesson.id, value));
    },
    [lesson.id],
  );
  const onReport = useCallback(
    (report: Report, testedStage: Stage) =>
      update({ ...workRef.current, [testedStage]: report.passed }),
    [update],
  );
  const runner = usePython(onReport);
  const onRun = useCallback(() => {
    if (hydrated && !runner.busy && !lesson.native)
      runner.run(lesson, workRef.current.code, stage);
  }, [hydrated, runner.busy, runner.run, lesson, stage]);
  const edit = (code: string) => {
    if (code !== workRef.current.code) {
      runner.clear();
      update({ code, prototype: false, final: false, localCompleted: false });
    }
  };

  return (
    <div
      ref={split.containerRef}
      className={`practice-flow ${question ? "" : "question-hidden"} ${editorVisible ? "" : "editor-hidden"} ${split.dragging ? "is-resizing" : ""}`}
      style={{ gridTemplateColumns: split.columns }}
    >
      <div className="problem-heading">
        <h1>Practice: {lesson.title}</h1>
        <div className="pane-actions">
          <button
            className="text-link question-toggle"
            aria-label={question ? "Hide question" : "Show question"}
            title={question ? "Hide question" : "Show question"}
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
              {question ? "Hide question" : "Show question"}
            </span>
          </button>
          <button
            className="text-link question-toggle"
            aria-label={editorVisible ? "Hide editor" : "Show editor"}
            title={editorVisible ? "Hide editor" : "Show editor"}
            aria-expanded={editorVisible}
            aria-controls="practice-editor"
            onClick={split.toggleEditor}
          >
            {editorVisible ? (
              <PanelRightClose size={16} />
            ) : (
              <PanelRightOpen size={16} />
            )}
            <span className="pane-toggle-label">
              {editorVisible ? "Hide editor" : "Show editor"}
            </span>
          </button>
        </div>
      </div>
      {question && (
        <section
          className="problem-panel"
          id="practice-question"
          aria-label="Exercise question"
          tabIndex={0}
        >
          <Content markdown={lesson.practice} highlights={lesson.highlights} />
        </section>
      )}
      <PracticeDivider split={split} />
      <section
        className="coding-panel"
        id="practice-editor"
        aria-label="Python workspace"
        hidden={!editorVisible}
      >
        <div className="editor-header">
          <div className="file-tabs" role="tablist" aria-label="Python files">
            <button
              role="tab"
              aria-selected={file === "exercise"}
              onClick={() => setFile("exercise")}
            >
              <FileCode2 size={14} />
              exercise.py
            </button>
            <button
              role="tab"
              aria-selected={file === "tests"}
              onClick={() => setFile("tests")}
            >
              Tests<span className="readonly-tag">read only</span>
            </button>
          </div>
          <div className="editor-actions">
            <button
              className="icon-button"
              onClick={() => downloadChapter(lesson, work.code)}
              aria-label="Download exercise"
              title="Download exercise"
            >
              <Download size={16} />
            </button>
            <div className="reset-wrap">
              <button
                disabled={runner.busy}
                className="icon-button"
                onClick={() => setConfirmReset(!confirmReset)}
                aria-label="Reset starter code"
                title="Reset starter code"
              >
                <RotateCcw size={15} />
              </button>
              {confirmReset && (
                <div
                  className="reset-popover"
                  role="dialog"
                  aria-label="Reset implementation"
                >
                  <p>Replace your saved code with the starter?</p>
                  <div>
                    <button onClick={() => setConfirmReset(false)}>
                      Keep my code
                    </button>
                    <button
                      onClick={() => {
                        runner.clear();
                        update(initial);
                        setConfirmReset(false);
                      }}
                    >
                      Reset code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="run-toolbar">
          <div
            className="stage-picker"
            role="group"
            aria-label="Implementation stage"
          >
            {(["prototype", "final"] as Stage[]).map((value) => (
              <button
                disabled={runner.busy}
                aria-pressed={stage === value}
                className={stage === value ? "selected" : ""}
                key={value}
                onClick={() => {
                  runner.clear();
                  setStage(value);
                }}
              >
                {work[value] && <Check size={12} />}
                {value === "prototype" ? "1. Prototype" : "2. Final"}
              </button>
            ))}
          </div>
          {lesson.native ? (
            <span className="native-tag">Local Python required</span>
          ) : runner.busy ? (
            <button className="button stop-button" onClick={runner.stop}>
              <Square size={11} fill="currentColor" />
              Stop
            </button>
          ) : (
            <button
              className="button run-button"
              disabled={!hydrated}
              onClick={onRun}
            >
              <Play size={12} fill="currentColor" />
              Run checks<kbd>⌘ ↵</kbd>
            </button>
          )}
        </div>
        <div className="code-area">
          <div className="code-editor-frame" hidden={file !== "exercise"}>
            <CodeEditor
              code={work.code}
              onChange={edit}
              onRun={onRun}
              readOnly={runner.busy}
            />
          </div>
          <div className="code-editor-frame" hidden={file !== "tests"}>
            <CodeEditor code={lesson.tests} readOnly />
          </div>
        </div>
        {lesson.native ? (
          <section className="native-panel">
            <div className="native-heading">
              <Code2 size={20} />
              <div>
                <strong>Run this exercise with local Python.</strong>
                <p>
                  This exercise starts native threads or processes, which
                  browser Python does not support. Download your code and tests,
                  then run the command below.
                </p>
              </div>
            </div>
            <code>python3 main.py --stage {stage}</code>
            <div className="native-actions">
              <button
                className="button primary"
                onClick={() => downloadChapter(lesson, work.code)}
              >
                <Download size={14} />
                Download exercise
              </button>
              <button
                className="text-link"
                onClick={() =>
                  update({
                    ...workRef.current,
                    localCompleted: !work.localCompleted,
                  })
                }
              >
                {work.localCompleted ? (
                  <CheckCheck size={14} />
                ) : (
                  <Check size={14} />
                )}
                {work.localCompleted
                  ? "Completed locally"
                  : "Mark complete after local tests"}
              </button>
            </div>
          </section>
        ) : (
          <Results
            state={runner.state}
            report={runner.report}
            output={runner.output}
            error={runner.error}
          />
        )}
        <footer className="editor-status">
          <span>
            {runner.busy ? (
              <LoaderCircle className="spin" size={12} />
            ) : (
              <span className="live-dot" />
            )}
            {lesson.native
              ? "Local CPython required"
              : "Python · runs on your device"}
          </span>
          <span className={!saved ? "save-warning" : ""}>
            {!hydrated ? (
              "Opening…"
            ) : saved ? (
              <>
                <Check size={12} />
                Saved locally
              </>
            ) : (
              "Local save unavailable"
            )}
          </span>
        </footer>
      </section>
    </div>
  );
}
