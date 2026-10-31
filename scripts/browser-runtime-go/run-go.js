import { createBrowserEngine } from "@wasm-oj/browser";
import { browserSource } from "@wasm-oj/toolchain-go";

// The standard Go compiler can emit source diagnostics on stdout. The SDK's
// fallback diagnostics currently inspect stderr, so retain real locations.
function sourceDiagnostics(build) {
  const diagnostics = [];
  const pattern = /^(.*?\.go):(\d+)(?::(\d+))?:\s*(.+)$/gm;
  for (const match of `${build.stdout}\n${build.stderr}`.matchAll(pattern)) {
    diagnostics.push({
      severity: "error",
      file: match[1].replace(/^\/work\//, ""),
      line: Number(match[2]),
      column: Number(match[3] || 1),
      message: match[4],
      source: "go",
    });
  }
  return diagnostics.length ? diagnostics : build.diagnostics;
}

/**
 * Compile source and execute one curriculum stage entirely in browser Workers.
 * Run this adapter in a dedicated module Worker. Keep its emitted assets beside
 * this module, and serve the page with COOP/COEP headers.
 * onStatus receives {phase,label,progress}; onOutput receives (stream,chunk).
 */
export async function runGo({
  files,
  stage,
  onStatus = () => {},
  onOutput = () => {},
  signal,
  toolchainBase = new URL("./toolchains/", import.meta.url).href,
  resources = {},
}) {
  if (stage !== "prototype" && stage !== "final")
    throw new TypeError("Unknown exercise stage.");
  if (
    !files ||
    typeof files["exercise.go"] !== "string" ||
    typeof files["main.go"] !== "string"
  ) {
    throw new TypeError(
      "Go execution requires exercise.go and main.go source.",
    );
  }
  if (signal?.aborted) throw new DOMException("Run canceled.", "AbortError");
  const engine = await createBrowserEngine({
    toolchains: [browserSource(toolchainBase)],
    artifactCache: false,
  });
  const cancel = () => engine.cancel();
  const offStatus = engine.onProgress(onStatus);
  const offOutput = engine.onStream(onOutput);
  signal?.addEventListener("abort", cancel, { once: true });
  try {
    await engine.ready();
    if (signal?.aborted) throw new DOMException("Run canceled.", "AbortError");
    const build = await engine.compile(
      {
        language: "go",
        target: "wasip1",
        optimization: "release",
        entry: "main.go",
        files,
      },
      { cache: false },
    );
    if (build.stdout) onOutput("stdout", build.stdout);
    if (build.stderr) onOutput("stderr", build.stderr);
    if (!build.success || !build.artifact) {
      return {
        phase: "compile",
        code: 1,
        exitCode: 1,
        stdout: build.stdout,
        stderr: build.stderr,
        diagnostics: sourceDiagnostics(build),
        termination: "compile-error",
      };
    }
    if (signal?.aborted) throw new DOMException("Run canceled.", "AbortError");
    const result = await engine.run(build.artifact, {
      args: ["--stage", stage],
      stdin: "",
      resources: {
        instructionBudget: 5000000000,
        logicalTimeLimitMs: 30000,
        wallTimeLimitMs: 60000,
        memoryLimitBytes: 536870912,
        outputLimitBytes: 4194304,
        ...resources,
      },
    });
    return {
      phase: "run",
      code: result.code,
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      diagnostics: build.diagnostics,
      termination: result.termination,
      trapMessage: result.trapMessage,
      durationMs: result.durationMs,
      executionDurationMs: result.executionDurationMs,
      metrics: result.metrics,
    };
  } finally {
    signal?.removeEventListener("abort", cancel);
    offStatus();
    offOutput();
    engine.dispose();
  }
}
