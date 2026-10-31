// Standard-library-only executable checks. Learner implementation is imported only by the CLI.
const show = value => JSON.stringify(value, (_, item) => typeof item === "bigint" ? `${item}n` : item);
function equal(actual, expected, path = "result") {
  if (Object.is(actual, expected)) return;
  if (actual instanceof Error || expected instanceof Error) throw new Error(`${path}: preserve the original error object`);
  if (Array.isArray(actual) && Array.isArray(expected) && actual.length !== expected.length) throw new Error(`${path}: array length differs`);
  if (actual === null || expected === null || typeof actual !== typeof expected || typeof actual !== "object") throw new Error(`${path}: expected ${show(expected)}, got ${show(actual)}`);
  if (Array.isArray(actual) !== Array.isArray(expected)) throw new Error(`${path}: incorrect collection type`);
  if (Object.prototype.toString.call(actual) !== Object.prototype.toString.call(expected)) throw new Error(`${path}: incorrect object type`);
  if (expected instanceof Map) { equal([...actual.entries()], [...expected.entries()], path); return; }
  if (expected instanceof Set) { equal([...actual], [...expected], path); return; }
  if (expected instanceof ArrayBuffer) { equal([...new Uint8Array(actual)], [...new Uint8Array(expected)], path); return; }
  const keys = Object.keys(expected);
  if (show(Object.keys(actual)) !== show(keys)) throw new Error(`${path}: keys/order differ: ${show(Object.keys(actual))} vs ${show(keys)}`);
  for (const key of keys) equal(actual[key], expected[key], `${path}.${key}`);
}
function expectError(operation, kind = RangeError) {
  try { operation(); } catch (error) { if (error instanceof kind) return; throw new Error(`Expected ${kind.name}, got ${error?.constructor?.name}: ${error?.message}`); }
  throw new Error(`Expected ${kind.name}`);
}
export async function runTests(exercise, stage = "final") {
  if (!["prototype", "final"].includes(stage)) throw new RangeError("Unknown stage");
  const checks = [], started = performance.now();
  async function test(name, body) {
    try { await body(); checks.push({name, status: "passed"}); }
    catch (error) { checks.push({name, status: "failed", detail: error?.stack || String(error)}); }
  }
  const fn = exercise[stage === "prototype" ? "prototype" : "solve"];
  const cases = [
["cycle and unreachable vertex", [5, [[0, 1], [1, 2], [2, 0], [2, 3]], 0], [0, 1, 1, 2, null]],
["self loop", [1, [[0, 0]], 0], [0]],
["generated graph 2", [2, [[0, 1]], 0], [0, 1]],
["generated graph 3", [3, [], 0], [0, null, null]],
["generated graph 4", [4, [[0, 3], [1, 2], [1, 3]], 0], [0, 2, 3, 1]],
["generated graph 5", [5, [[0, 1], [0, 2], [1, 2], [1, 4], [2, 3], [2, 4], [3, 4]], 0], [0, 1, 1, 2, 2]],
["generated graph 6", [6, [[2, 3], [3, 5], [4, 5]], 0], [0, null, null, null, null, null]],
["generated graph 7", [7, [[0, 1], [0, 4], [0, 5], [0, 6], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5], [4, 5], [4, 6], [5, 6]], 0], [0, 1, 2, 3, 1, 1, 1]],
["generated graph 8", [8, [[0, 3], [0, 6], [1, 2], [1, 3], [1, 5], [3, 4], [3, 5], [3, 7], [5, 6]], 0], [0, 2, 3, 1, 2, 2, 1, 2]],
["generated graph 9", [9, [[0, 1], [0, 2], [0, 3], [1, 6], [1, 8], [2, 3], [5, 7], [6, 7]], 0], [0, 1, 1, 1, null, 4, 2, 3, 2]],
["generated graph 10", [10, [[0, 1], [0, 2], [0, 4], [0, 6], [0, 8], [1, 2], [1, 3], [1, 4], [1, 9], [2, 4], [2, 5], [2, 6], [3, 9], [6, 8]], 0], [0, 1, 1, 2, 1, 2, 1, null, 1, 2]],
["generated graph 11", [11, [[0, 3], [0, 4], [0, 7], [0, 9], [0, 10], [1, 3], [1, 6], [2, 9], [3, 5], [3, 6], [4, 7], [4, 8], [5, 10], [6, 8], [7, 9], [7, 10]], 0], [0, 2, 2, 1, 1, 2, 2, 1, 2, 1, 1]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [0, [], 0]], ["invalid input", [2, [[0, 2]], 0]]];
  for (const [name, original] of invalid) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    try { expectError(() => fn(...args)); } finally { equal(args, before, "input on rejection"); }
  });
  return {checks, duration: (performance.now() - started) / 1000, methods: checks.length, skipped: 0, passed: checks.length > 0 && checks.every(check => check.status === "passed")};
}
if (typeof process !== "undefined" && process.versions?.node && process.argv[1]?.endsWith("main.mjs")) {
  const index = process.argv.indexOf("--stage");
  const stage = index < 0 ? "final" : process.argv[index + 1];
  try {
    if (!["prototype", "final"].includes(stage)) throw new RangeError("--stage requires prototype or final");
    const report = await runTests(await import("./exercise.mjs"), stage);
    for (const check of report.checks) console.log(`${check.status.toUpperCase()} ${check.name}${check.detail ? "\n" + check.detail : ""}`);
    console.log(`${report.checks.filter(c => c.status === "passed").length}/${report.methods} checks passed`);
    process.exitCode = report.passed ? 0 : 1;
  } catch (error) { console.error(error); process.exitCode = 1; }
}
