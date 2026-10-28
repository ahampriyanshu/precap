"use client";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  Circle,
  LoaderCircle,
  Terminal,
  X,
} from "lucide-react";
import type { Report, RunState } from "@/lib/types";

export function Results({
  state,
  report,
  output,
  error,
}: {
  state: RunState;
  report: Report | null;
  output: string;
  error: string;
}) {
  const [tab, setTab] = useState<"checks" | "output">("checks");
  useEffect(() => {
    if (state === "loading") setTab("checks");
  }, [state]);
  const busy = state === "loading" || state === "running";
  const passed =
    report?.checks.filter((c) => c.status === "passed").length ?? 0;
  const failed =
    report?.checks.filter((c) => c.status === "failed" || c.status === "error")
      .length ?? 0;
  const firstFailure =
    report?.checks.findIndex((c) => c.status !== "passed") ?? -1;
  return (
    <section className="results-panel" aria-label="Execution results">
      <div className="results-header">
        <div className="file-tabs" role="tablist" aria-label="Run output">
          <button
            role="tab"
            aria-selected={tab === "checks"}
            onClick={() => setTab("checks")}
          >
            Results
            {report && (
              <span
                className={`result-count ${report.passed ? "good" : "bad"}`}
              >
                {passed}/{report.checks.length}
              </span>
            )}
          </button>
          <button
            role="tab"
            aria-selected={tab === "output"}
            onClick={() => setTab("output")}
          >
            Console{output && <span className="output-dot" />}
          </button>
        </div>
        {report && (
          <span className="result-duration">{report.duration.toFixed(2)}s</span>
        )}
      </div>
      <div
        className="results-body"
        role="tabpanel"
        tabIndex={0}
        aria-live="polite"
      >
        {tab === "output" ? (
          <pre className="console-output">
            {output || "Output from print() will appear here."}
          </pre>
        ) : busy ? (
          <div className="result-placeholder running-placeholder">
            <LoaderCircle className="spin" size={20} />
            <div>
              <strong>
                {state === "loading" ? "Loading Python…" : "Running checks…"}
              </strong>
              <p>
                {state === "loading"
                  ? "The first run takes a moment. Everything runs on your device."
                  : "Your code is running in a separate browser worker."}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="execution-error">
            <span className="error-heading">
              {state === "stopped" ? "Stopped" : "Couldn’t finish this run"}
            </span>
            <pre>{error}</pre>
          </div>
        ) : report ? (
          <div className="check-results">
            <div
              className={`run-summary ${report.passed ? "passed" : "failed"}`}
            >
              {report.passed ? <Check size={15} /> : <Circle size={13} />}
              <span>
                {report.passed
                  ? "All checks passed."
                  : `${failed} ${failed === 1 ? "check needs" : "checks need"} another look.`}
              </span>
            </div>
            {report.checks.map((check, index) => {
              const name = check.name
                .replace(/ \(chapter_tests\.[^)]+\)/, "")
                .replace(/^test_/, "")
                .replaceAll("_", " ");
              return (
                <details
                  className={`check-row check-${check.status}`}
                  key={`${index}-${check.name}`}
                  open={index === firstFailure}
                >
                  <summary>
                    {check.status === "passed" ? (
                      <Check size={13} />
                    ) : (
                      <X size={13} />
                    )}
                    <span>{name}</span>
                    {check.detail && (
                      <ChevronRight className="check-chevron" size={13} />
                    )}
                  </summary>
                  {check.detail && <pre>{check.detail}</pre>}
                </details>
              );
            })}
          </div>
        ) : (
          <div className="result-placeholder">
            <Terminal size={22} strokeWidth={1.5} />
            <div>
              <strong>No results yet.</strong>
              <p>
                Complete the starter code, then run the checks.
                <br />
                Results and errors will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
