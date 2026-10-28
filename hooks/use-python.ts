"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lesson, Report, RunState, Stage } from "@/lib/types";

export function usePython(onReport: (report: Report, stage: Stage) => void) {
  const [state, setState] = useState<RunState>("idle");
  const [report, setReport] = useState<Report | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef(0);
  const onReportRef = useRef(onReport);
  useEffect(() => {
    onReportRef.current = onReport;
  }, [onReport]);

  const dispose = useCallback(() => {
    worker.current?.terminate();
    worker.current = null;
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
  }, [dispose]);

  const run = useCallback(
    (lesson: Lesson, code: string, stage: Stage) => {
      if (lesson.native) return;
      dispose();
      const id = ++request.current;
      setReport(null);
      setOutput("");
      setError("");
      setState("loading");
      const fail = (message: string) => {
        if (request.current !== id) return;
        dispose();
        setState("error");
        setError(message);
      };
      let runner: Worker;
      try {
        runner = new Worker("/python.worker.js", { type: "module" });
        worker.current = runner;
      } catch {
        fail(
          "This browser couldn’t start a Python worker. Download the chapter to run it locally.",
        );
        return;
      }
      timer.current = setTimeout(
        () =>
          fail(
            "Python took too long to load. Check your connection and try again.",
          ),
        90000,
      );
      runner.onmessage = ({ data }) => {
        if (data.requestId !== id || request.current !== id) return;
        if (data.type === "status") {
          setState(data.status);
          if (data.status === "running") {
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(
              () =>
                fail(
                  "Stopped after 15 seconds. Check for an infinite loop or an unfinished wait.",
                ),
              15000,
            );
          }
        } else if (data.type === "output") {
          setOutput((current) => (current + data.text + "\n").slice(0, 26000));
        } else if (data.type === "result") {
          dispose();
          setReport(data.report);
          setState("done");
          onReportRef.current(data.report, stage);
        } else if (data.type === "error") {
          fail(data.message);
        }
      };
      runner.onerror = (event) =>
        fail(
          event.message ||
            "Python couldn’t start. Refresh the page and try again.",
        );
      runner.postMessage({
        type: "run",
        requestId: id,
        code,
        tests: lesson.tests,
        track: lesson.track,
        stage,
      });
    },
    [dispose],
  );

  const clear = useCallback(() => {
    setReport(null);
    setOutput("");
    setError("");
    setState("idle");
  }, []);
  return {
    state,
    report,
    output,
    error,
    run,
    stop,
    clear,
    busy: state === "loading" || state === "running",
  };
}
