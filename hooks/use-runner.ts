"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { languageInfo } from "@/lib/languages";
import type { Lesson, Report, RunState, Stage } from "@/lib/types";
const compiledLanguages = new Set(["go", "java", "cpp"]);
const activeStates = new Set(["loading", "compiling", "running"]);
export function useRunner(onReport: (report: Report, stage: Stage) => void) {
  const [state, setState] = useState<RunState>("idle");
  const [report, setReport] = useState<Report | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const worker = useRef<Worker | null>(null);
  const compiledWorker = useRef(false);
  const pageRunner = useRef<AbortController | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef(0);
  const onReportRef = useRef(onReport);
  useEffect(() => {
    onReportRef.current = onReport;
  }, [onReport]);
  const dispose = useCallback(() => {
    pageRunner.current?.abort();
    pageRunner.current = null;
    const current = worker.current;
    worker.current = null;
    if (current) {
      current.onmessage = null;
      current.onerror = null;
      if (compiledWorker.current) {
        // Let the adapter cancel its owned compiler/JVM workers before the hard stop.
        try {
          current.postMessage({ type: "cancel" });
        } catch {}
        setTimeout(() => current.terminate(), 250);
      } else current.terminate();
    }
    compiledWorker.current = false;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(
    () => () => {
      request.current++;
      dispose();
    },
    [dispose],
  );
  const stop = useCallback(() => {
    request.current++;
    dispose();
    setState("stopped");
    setError("Execution stopped. Your code is saved.");
    setMessage("");
  }, [dispose]);
  const run = useCallback(
    (lesson: Lesson, code: string, stage: Stage) => {
      if (lesson.native) return;
      dispose();
      const language = lesson.language || "python",
        label = languageInfo[language].label;
      const compiled = compiledLanguages.has(language),
        id = ++request.current;
      setReport(null);
      setOutput("");
      setError("");
      setMessage("");
      setState("loading");
      const fail = (detail: string) => {
        if (request.current !== id) return;
        dispose();
        setState("error");
        setError(detail);
        setMessage("");
      };
      let phase = "loading";
      const arm = (next: string) => {
        if (timer.current) clearTimeout(timer.current);
        const milliseconds = compiled
          ? next === "loading"
            ? 300000
            : next === "compiling"
              ? 180000
              : 60000
          : next === "loading"
            ? 90000
            : 15000;
        timer.current = setTimeout(
          () =>
            fail(
              next === "loading"
                ? `${label} took too long to load. Check your connection and try again.`
                : next === "compiling"
                  ? "Compilation stopped after three minutes. Your code is saved."
                  : `Stopped after ${compiled ? 60 : 15} seconds. Check for an infinite loop or an unfinished wait.`,
            ),
          milliseconds,
        );
      };
      arm("loading");
      const receive = (data: {
        requestId: number;
        type: string;
        status?: RunState;
        message?: string;
        text?: string;
        report?: Report;
      }) => {
        if (data.requestId !== id || request.current !== id) return;
        if (
          data.type === "status" &&
          data.status &&
          activeStates.has(data.status)
        ) {
          setState(data.status);
          setMessage(typeof data.message === "string" ? data.message : "");
          if (data.status !== phase) {
            phase = data.status;
            arm(phase);
          }
        } else if (data.type === "output") {
          setOutput((current) =>
            (current + (data.text || "") + "\n").slice(0, 26000),
          );
        } else if (data.type === "result" && data.report) {
          dispose();
          setReport(data.report);
          setState("done");
          setMessage("");
          onReportRef.current(data.report, stage);
        } else if (data.type === "error")
          fail(data.message || "Execution failed.");
      };
      const payload = {
        type: "run",
        requestId: id,
        code,
        tests: lesson.tests,
        files: compiled ? lesson.files : undefined,
        starterFilename: lesson.starterFilename,
        testFilename: lesson.testFilename,
        language,
        track: lesson.track,
        stage,
      };
      if (language === "cpp") {
        const controller = new AbortController();
        pageRunner.current = controller;
        const modulePath = "/compiled-runtime.mjs";
        void import(/* webpackIgnore: true */ modulePath)
          .then((module) => {
            if (request.current === id && !controller.signal.aborted)
              return module.runCompiled(
                payload,
                (value: {
                  type: string;
                  status?: RunState;
                  message?: string;
                  text?: string;
                  report?: Report;
                }) => receive({ requestId: id, ...value }),
                controller.signal,
              );
          })
          .catch((error) =>
            fail(error.message || "C++ couldn’t start. Refresh and try again."),
          );
      } else {
        let runner: Worker;
        try {
          runner = compiled
            ? new Worker("/compiled.worker.js")
            : new Worker(
                language === "javascript"
                  ? "/javascript.worker.js"
                  : "/python.worker.js",
                { type: "module" },
              );
          worker.current = runner;
          compiledWorker.current = compiled;
        } catch {
          fail(
            `This browser couldn’t start a ${label} worker. Download the chapter to run it locally.`,
          );
          return;
        }
        runner.onmessage = ({ data }) => receive(data);
        runner.onerror = (event) =>
          fail(
            event.message ||
              `${label} couldn’t start. Refresh the page and try again.`,
          );
        runner.postMessage(payload);
      }
    },
    [dispose],
  );
  const clear = useCallback(() => {
    request.current++;
    dispose();
    setReport(null);
    setOutput("");
    setError("");
    setMessage("");
    setState("idle");
  }, [dispose]);
  return {
    state,
    report,
    output,
    error,
    message,
    run,
    stop,
    clear,
    busy: activeStates.has(state),
  };
}
