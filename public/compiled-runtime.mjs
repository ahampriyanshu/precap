// Shared orchestration: C++ starts its runner on the page; Go and Java own an outer worker.
export async function runCompiled(data, emit, signal) {
  const send = (value) => {
    if (!signal.aborted) emit(value);
  };
  const { language, stage } = data;
  let adapter;
  try {
    if (
      !["go", "java", "cpp"].includes(language) ||
      !["prototype", "final"].includes(stage)
    )
      throw new Error("Unknown compiler language or stage.");
    if (
      !globalThis.crossOriginIsolated ||
      typeof SharedArrayBuffer === "undefined"
    )
      throw new Error(
        "Browser compilation requires cross-origin isolation. Serve precap with npm start, or configure the COOP/COEP headers described in README, then reload.",
      );
    send({
      type: "status",
      status: "loading",
      message: `Loading ${language === "cpp" ? "C++" : language === "java" ? "Java" : "Go"} compiler…`,
    });
    const { instrumentHarness, readCompiledReport } =
      await import("/compiled-protocol.mjs");
    const marker = "PRECAP_" + crypto.randomUUID().replaceAll("-", "") + "_";
    const files = { ...data.files, [data.starterFilename]: data.code };
    files[data.testFilename] = instrumentHarness(language, data.tests, marker);
    if (
      Object.entries(files).some(
        ([name, source]) =>
          !name ||
          name.includes("/") ||
          name.includes("\\") ||
          typeof source !== "string",
      )
    )
      throw new Error("The exercise contains an invalid source file.");
    let phase = "loading",
      remaining = 26000,
      messages = 0,
      executionStart;
    const order = { loading: 0, compiling: 1, running: 2 };
    const onStatus = (value) => {
      const name = value?.phase || "",
        label = value?.label || "";
      let next =
        name === "running"
          ? "running"
          : ["checking", "compiling", "linking", "packaging"].includes(name)
            ? "compiling"
            : "loading";
      if (order[next] < order[phase]) next = phase;
      phase = next;
      const progress =
        Number.isFinite(value?.progress) &&
        value.progress >= 0 &&
        value.progress < 1
          ? ` ${Math.round(value.progress * 100)}%`
          : "";
      if (next === "running" && executionStart === undefined)
        executionStart = performance.now();
      send({ type: "status", status: phase, message: label + progress });
    };
    const pending = { stdout: "", stderr: "" };
    const emit = (line) => {
      if (!line || line.startsWith(marker) || remaining <= 0 || messages >= 200)
        return;
      const text = line.slice(0, remaining);
      remaining -= text.length + 1;
      messages++;
      send({ type: "output", text });
    };
    const onOutput = (stream, text) => {
      const key = stream === "stderr" ? "stderr" : "stdout";
      pending[key] += String(text);
      const lines = pending[key].split(/\r?\n/);
      pending[key] = lines.pop() || "";
      for (const line of lines) emit(line);
      if (pending[key].length > 26000) {
        emit(pending[key]);
        pending[key] = "";
      }
    };
    adapter = await import(`/runtimes/${language}/adapter.mjs`);
    const run =
      language === "go"
        ? adapter.runGo
        : language === "java"
          ? adapter.runJava
          : adapter.runCpp;
    if (typeof run !== "function")
      throw new Error("The browser compiler could not be loaded.");
    if (signal.aborted) return;
    const result = await run({
      files,
      stage,
      onStatus,
      onOutput,
      signal: signal,
    });
    emit(pending.stdout);
    emit(pending.stderr);
    if (signal.aborted) return;
    if (result.phase === "compile") {
      const detail =
        result.error ||
        result.stderr ||
        result.stdout ||
        result.diagnostics?.map((item) => item.message).join("\n") ||
        "Compilation failed.";
      send({ type: "error", message: `Compilation failed\n${detail}` });
      return;
    }
    const normalized = {
      ...result,
      code: result.code ?? result.exitCode,
      stderr: result.stderr || result.error || "",
      durationMs:
        result.executionDurationMs ??
        result.runMs ??
        (executionStart === undefined ? 0 : performance.now() - executionStart),
    };
    send({ type: "result", report: readCompiledReport(normalized, marker) });
  } catch (error) {
    if (!signal.aborted)
      send({ type: "error", message: error?.message || String(error) });
  } finally {
    adapter?.stopJava?.();
  }
}
