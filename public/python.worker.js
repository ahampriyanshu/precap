// One module Worker per run: a fresh interpreter, with hard cancellation from the UI.
let active = false;
self.onmessage = async ({ data }) => {
  if (active || data.type !== "run") return;
  active = true;
  const post = (message) =>
    self.postMessage({ requestId: data.requestId, ...message });
  let outputSize = 0;
  const output = (stream) => (text) => {
    if (outputSize > 24000) return;
    outputSize += text.length;
    post({
      type: "output",
      stream,
      text:
        outputSize > 24000
          ? "Output limit reached. Further output is hidden."
          : text,
    });
  };
  try {
    post({ type: "status", status: "loading" });
    const [{ loadPyodide }, response] = await Promise.all([
      import("/runtime/pyodide.mjs"),
      fetch("/python-harness.py"),
    ]);
    if (!response.ok) throw new Error("The test runner could not be loaded.");
    const pyodide = await loadPyodide({
      indexURL: new URL("/runtime/", self.location.origin).href,
      stdin: () => null,
    });
    pyodide.setStdout({ batched: output("stdout") });
    pyodide.setStderr({ batched: output("stderr") });
    const harness = await response.text();
    pyodide.globals.set(
      "__lesson_payload",
      JSON.stringify({
        code: data.code,
        tests: data.tests,
        track: data.track,
        stage: data.stage,
      }),
    );
    post({ type: "status", status: "running" });
    const result = await pyodide.runPythonAsync(harness);
    post({ type: "result", report: JSON.parse(result) });
  } catch (error) {
    post({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
