let attempt = 0;
async function loadModule(source, filename, id) {
  const url = `data:text/javascript;charset=utf-8,${encodeURIComponent(`${source}\n//# sourceURL=${filename}\n`)}#${id}`;
  try {
    return await import(url);
  } catch (error) {
    throw new Error(`${filename}: ${error?.message || error}`, {
      cause: error,
    });
  }
}

export async function runJavaScript({ code, tests, stage }) {
  if (!["prototype", "final"].includes(stage))
    throw new RangeError("Unknown implementation stage");
  const started = performance.now();
  const id = ++attempt;
  const exercise = await loadModule(code, "exercise.mjs", id);
  const suite = await loadModule(tests, "main.mjs", id);
  if (typeof suite.runTests !== "function")
    throw new Error("main.mjs must export runTests(exercise, stage)");
  const raw = await suite.runTests(exercise, stage);
  if (!raw || !Array.isArray(raw.checks))
    throw new Error("The test suite returned an invalid report");
  const valid = new Set(["passed", "failed", "error", "skipped"]);
  const checks = Array.from(raw.checks, (check, index) => {
    if (
      !check ||
      typeof check.name !== "string" ||
      !check.name.trim() ||
      !valid.has(check.status)
    ) {
      return {
        name: `Invalid check ${index + 1}`,
        status: "error",
        detail: "The test suite returned an invalid check.",
      };
    }
    return {
      name: check.name,
      status: check.status,
      ...(typeof check.detail === "string" ? { detail: check.detail } : {}),
    };
  });
  const methods =
    Number.isInteger(raw.methods) && raw.methods >= 0 ? raw.methods : 0;
  const skipped = Math.max(
    checks.filter((check) => check.status === "skipped").length,
    Number.isInteger(raw.skipped) ? raw.skipped : 0,
  );
  return {
    checks,
    duration: (performance.now() - started) / 1000,
    methods,
    skipped,
    passed:
      raw.passed === true &&
      Number.isInteger(raw.skipped) &&
      raw.skipped >= 0 &&
      checks.length > 0 &&
      methods === checks.length &&
      skipped === 0 &&
      checks.every((check) => check.status === "passed"),
  };
}
