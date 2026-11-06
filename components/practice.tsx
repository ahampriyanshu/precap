"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  Code2,
  Download,
  FileCheck2,
  FileCode2,
  LoaderCircle,
  RotateCcw,
  Square,
} from "lucide-react";
import { Content } from "./content";
import { PracticeDivider } from "./practice-divider";
import { Results } from "./results";
import { useRunner } from "@/hooks/use-runner";
import { languageInfo } from "@/lib/languages";
import { usePracticeSplit } from "@/hooks/use-practice-split";
import { loadWork, saveWork } from "@/lib/storage";
import { downloadChapter } from "@/lib/download";
import type { Lesson, Report, SavedWork, Stage } from "@/lib/types";

const CodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading editor…</div>,
});

function splitPracticeContent(markdown: string, lesson: Lesson) {
  const regex =
    /\n\s*(Run (?:`?[a-z0-9_\-\.]+ main|from this (?:lesson )?directory)[\s\S]*)$/i;
  const match = markdown.match(regex);
  if (match) {
    return {
      questionMarkdown: markdown.slice(0, match.index).trim(),
      localInstructions: match[1].trim(),
    };
  }
  return {
    questionMarkdown: markdown.trim(),
    localInstructions:
      lesson.language === "python" || !lesson.language
        ? `Run \`python main.py --stage prototype\` first, then \`python main.py --stage final\`.\nThe default stage is \`final\`. Edit \`${lesson.starterFilename}\`; leave the tests in \`${lesson.testFilename || "main.py"}\` unchanged.`
        : `Run tests locally for ${lesson.starterFilename} with the test harness in ${lesson.testFilename || "main"}.`,
  };
}

export function Practice({ lesson }: { lesson: Lesson }) {
  const split = usePracticeSplit();
  const { questionMarkdown, localInstructions } = splitPracticeContent(
    lesson.practice,
    lesson,
  );
  const language = lesson.language || "python";
  const info = languageInfo[language];
  const question = split.collapsed !== "question";
  const editorVisible = split.collapsed !== "editor";
  const stage: Stage = "final";
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
      update({
        ...workRef.current,
        [testedStage]: report.passed,
        final: report.passed,
        prototype: report.passed,
      }),
    [update],
  );
  const runner = useRunner(onReport);
  const onRun = useCallback(() => {
    if (hydrated && !runner.busy && !lesson.native)
      runner.run(lesson, workRef.current.code, "final");
  }, [hydrated, runner.busy, runner.run, lesson]);
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
      {question && (
        <section
          className="problem-panel"
          id="practice-question"
          aria-label="Exercise question"
          tabIndex={0}
        >
          <Content markdown={questionMarkdown} highlights={lesson.highlights} />
        </section>
      )}
      <PracticeDivider split={split} />
      <section
        className="coding-panel"
        id="practice-editor"
        aria-label={`${info.label} workspace`}
        hidden={!editorVisible}
      >
        <div className="editor-header">
          <div
            className="file-tabs"
            role="tablist"
            aria-label={`${info.label} files`}
          >
            <button
              role="tab"
              aria-selected={file === "exercise"}
              onClick={() => setFile("exercise")}
            >
              <FileCode2 size={14} />
              {lesson.starterFilename}
            </button>
            <button
              role="tab"
              aria-selected={file === "tests"}
              onClick={() => setFile("tests")}
            >
              <FileCheck2 size={14} />
              Tests
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
        <div className="code-area">
          <div className="code-editor-frame" hidden={file !== "exercise"}>
            <CodeEditor
              language={language}
              code={work.code}
              onChange={edit}
              onRun={onRun}
              readOnly={runner.busy}
            />
          </div>
          <div className="code-editor-frame" hidden={file !== "tests"}>
            <CodeEditor language={language} code={lesson.tests} readOnly />
          </div>
        </div>
        {lesson.native ? (
          <section className="native-panel">
            <div className="native-heading">
              <Code2 size={20} />
              <div>
                <strong>Run this exercise with local {info.label}.</strong>
                <p>
                  {language === "python"
                    ? "This exercise starts native threads or processes, which browser Python does not support."
                    : `Use your local ${info.label} toolchain to compile and run these tests.`}{" "}
                  Download your code and tests, then run the command below.
                </p>
              </div>
            </div>
            <code>{info.command.replaceAll("$STAGE", "final")}</code>
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
            language={info.label}
            message={runner.message}
            state={runner.state}
            report={runner.report}
            output={runner.output}
            error={runner.error}
            localInstructions={localInstructions}
            actions={
              runner.busy ? (
                <button
                  className="button stop-button"
                  onClick={runner.stop}
                  aria-label="Stop"
                >
                  <Square size={11} fill="currentColor" aria-hidden="true" />
                  Stop
                </button>
              ) : (
                <button
                  className="button run-button submit-button"
                  disabled={!hydrated}
                  onClick={onRun}
                  aria-label="Submit"
                  title="Submit"
                >
                  Submit
                </button>
              )
            }
          />
        )}
        {language === "go" &&
          lesson.slug === "12-synchronization-and-races" && (
            <p className="runtime-note">
              Browser Go schedules goroutines cooperatively. These checks do not
              detect data races; use local Go with <code>-race</code> to check
              synchronization.
            </p>
          )}
        {language === "java" && (
          <p className="runtime-credit">
            Java runs on this device with CheerpJ 4.3.
          </p>
        )}
        {language === "cpp" && (
          <p className="runtime-credit">C++ runtime powered by Wasmer.</p>
        )}
        <footer className="editor-status">
          <span>
            {runner.busy ? (
              <LoaderCircle className="spin" size={12} />
            ) : (
              <span className="live-dot" />
            )}
            {lesson.native
              ? `Local ${info.label} required`
              : `${info.label} · runs on your device`}
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
