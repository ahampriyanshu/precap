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
["parallel edges and ordered intermediates", [4, [[0, 1, 7], [0, 1, 3], [1, 2, -1], [2, 3, 2]]], [[0, 3, 2, 4], [null, 0, -1, 1], [null, null, 0, 2], [null, null, null, 0]]],
["wrong loop order misses this route", [4, [[0, 3, 1], [3, 2, 1], [2, 1, 1]]], [[0, 3, 2, 1], [null, 0, null, null], [null, 1, 0, null], [null, 2, 1, 0]]],
["unreachable pairs and diagonal", [2, []], [[0, null], [null, 0]]],
["empty graph", [0, []], []],
["all-pairs DAG 1", [1, []], [[0]]],
["all-pairs DAG 2", [2, [[0, 1, -2]]], [[0, -2], [null, 0]]],
["all-pairs DAG 3", [3, [[0, 1, 4], [0, 2, -2], [1, 2, -1]]], [[0, 4, -2], [null, 0, -1], [null, null, 0]]],
["all-pairs DAG 4", [4, [[0, 1, -1]]], [[0, -1, null, null], [null, 0, null, null], [null, null, 0, null], [null, null, null, 0]]],
["all-pairs DAG 5", [5, [[0, 4, -1], [1, 2, 6], [1, 3, 7], [1, 4, 0], [2, 4, 3]]], [[0, null, null, null, -1], [null, 0, 6, 7, 0], [null, null, 0, null, 3], [null, null, null, 0, null], [null, null, null, null, 0]]],
["all-pairs DAG 6", [6, [[0, 1, 4], [0, 2, -1], [0, 3, 1], [0, 5, 7], [2, 5, 5], [3, 4, 4], [4, 5, 6]]], [[0, 4, -1, 1, 5, 4], [null, 0, null, null, null, null], [null, null, 0, null, null, 5], [null, null, null, 0, 4, 10], [null, null, null, null, 0, 6], [null, null, null, null, null, 0]]],
["all-pairs DAG 7", [7, [[0, 1, 2], [0, 2, 7], [0, 3, 5], [0, 4, 6], [1, 3, 2], [1, 4, 2], [1, 5, 0], [1, 6, 4], [2, 4, 7], [3, 4, 2], [3, 6, 2], [4, 5, 7], [5, 6, 0]]], [[0, 2, 7, 4, 4, 2, 2], [null, 0, null, 2, 2, 0, 0], [null, null, 0, null, 7, 14, 14], [null, null, null, 0, 2, 9, 2], [null, null, null, null, 0, 7, 7], [null, null, null, null, null, 0, 0], [null, null, null, null, null, null, 0]]],
["all-pairs DAG 8", [8, [[0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 2], [0, 7, 2], [1, 2, 0], [1, 3, -2], [1, 5, 0], [1, 6, 1], [1, 7, -2], [2, 3, 5], [2, 4, 4], [2, 6, 4], [3, 4, 3], [3, 6, 3], [4, 6, 2], [5, 6, 1], [5, 7, 0], [6, 7, 4]]], [[0, null, 2, 3, 4, 2, 3, 2], [null, 0, 0, -2, 1, 0, 1, -2], [null, null, 0, 5, 4, null, 4, 8], [null, null, null, 0, 3, null, 3, 7], [null, null, null, null, 0, null, 2, 6], [null, null, null, null, null, 0, 1, 0], [null, null, null, null, null, null, 0, 4], [null, null, null, null, null, null, null, 0]]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["negative cycle anywhere", [2, [[0, 1, -2], [1, 0, 1]]]]];
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
