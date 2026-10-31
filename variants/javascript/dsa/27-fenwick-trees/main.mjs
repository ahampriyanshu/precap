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
["correction invalidates prefix", [[2, 4, 6], [["sum", 0, 3], ["add", 0, -5], ["sum", 0, 2], ["sum", 2, 2]]], [12, 1, 0]],
["empty values", [[], [["sum", 0, 0]]], [0]],
["point additions 0", [[3, 3, 7, 0, 0, 2, 8, 4], [["sum", 0, 3], ["sum", 0, 4], ["sum", 0, 1], ["sum", 0, 7], ["add", 0, 7], ["add", 0, 6], ["sum", 0, 6], ["add", 0, 3], ["add", 0, 8], ["sum", 0, 3], ["sum", 0, 1], ["sum", 0, 6], ["add", 0, 5], ["sum", 0, 6], ["sum", 0, 7]]], [13, 13, 3, 23, 28, 37, 27, 39, 44, 52]],
["point additions 1", [[0, 9, 2, 4, 1, 8, 3, 6], [["sum", 0, 4], ["add", 0, 0], ["add", 0, 6], ["add", 0, 4], ["add", 0, 7], ["add", 0, 6], ["add", 0, 4], ["sum", 0, 8], ["add", 0, 1], ["sum", 0, 7], ["add", 0, 1], ["add", 0, 6], ["sum", 0, 4], ["add", 0, 8], ["add", 0, 8]]], [15, 60, 55, 50]],
["point additions 2", [[1, 5, 8, 7, 6, 6, 7, 9], [["sum", 0, 7], ["add", 0, 3], ["sum", 0, 4], ["sum", 0, 2], ["add", 0, 8], ["sum", 0, 4], ["add", 0, 8], ["add", 0, 2], ["add", 0, 0], ["add", 0, 4], ["add", 0, 8], ["add", 0, 2], ["sum", 0, 7], ["add", 0, 4], ["add", 0, 6]]], [40, 24, 9, 32, 75]],
["point additions 3", [[6, 0, 5, 1, 6, 6, 3, 2], [["sum", 0, 3], ["sum", 0, 4], ["add", 0, 8], ["sum", 0, 8], ["sum", 0, 2], ["add", 0, 0], ["add", 0, 8], ["sum", 0, 7], ["sum", 0, 8], ["sum", 0, 0], ["sum", 0, 8], ["sum", 0, 6], ["add", 0, 1], ["sum", 0, 5], ["sum", 0, 4]]], [11, 12, 37, 14, 43, 45, 0, 45, 40, 35, 29]],
["point additions 4", [[5, 6, 0, 6, 3, 5, 9, 2], [["sum", 0, 8], ["add", 0, 4], ["sum", 0, 1], ["add", 0, 6], ["add", 0, 0], ["sum", 0, 8], ["sum", 0, 6], ["sum", 0, 3], ["sum", 0, 1], ["add", 0, 0], ["sum", 0, 0], ["add", 0, 1], ["add", 0, 3], ["sum", 0, 8], ["add", 0, 4]]], [36, 9, 46, 35, 21, 15, 0, 50]],
["point additions 5", [[1, 6, 4, 3, 7, 9, 6, 0], [["add", 0, 0], ["add", 0, 8], ["sum", 0, 8], ["sum", 0, 6], ["add", 0, 6], ["sum", 0, 2], ["sum", 0, 6], ["add", 0, 7], ["sum", 0, 5], ["add", 0, 6], ["sum", 0, 7], ["add", 0, 0], ["add", 0, 0], ["sum", 0, 6], ["sum", 0, 6]]], [44, 38, 21, 44, 42, 63, 57, 57]],
["point additions 6", [[1, 0, 9, 2, 9, 0, 1, 7], [["sum", 0, 6], ["sum", 0, 5], ["sum", 0, 3], ["add", 0, 6], ["add", 0, 7], ["sum", 0, 6], ["add", 0, 4], ["add", 0, 0], ["sum", 0, 6], ["add", 0, 7], ["add", 0, 4], ["sum", 0, 8], ["sum", 0, 5], ["add", 0, 0], ["sum", 0, 8]]], [21, 21, 10, 34, 38, 57, 49, 57]],
["point additions 7", [[6, 1, 1, 2, 7, 0, 0, 9], [["sum", 0, 2], ["add", 0, 7], ["sum", 0, 0], ["sum", 0, 5], ["add", 0, 7], ["add", 0, 7], ["sum", 0, 8], ["add", 0, 6], ["add", 0, 8], ["sum", 0, 8], ["add", 0, 8], ["add", 0, 2], ["add", 0, 4], ["add", 0, 8], ["add", 0, 2]]], [7, 0, 24, 47, 61]],
["point additions 8", [[3, 3, 0, 3, 5, 1, 5, 1], [["add", 0, 4], ["add", 0, 5], ["add", 0, 6], ["add", 0, 4], ["sum", 0, 1], ["add", 0, 5], ["sum", 0, 1], ["sum", 0, 4], ["sum", 0, 3], ["add", 0, 7], ["sum", 0, 5], ["sum", 0, 2], ["add", 0, 4], ["add", 0, 1], ["sum", 0, 1]]], [22, 27, 33, 30, 45, 37, 39]],
["point additions 9", [[3, 2, 3, 1, 2, 3, 3, 6], [["sum", 0, 6], ["sum", 0, 7], ["sum", 0, 7], ["sum", 0, 1], ["sum", 0, 0], ["sum", 0, 8], ["sum", 0, 8], ["sum", 0, 6], ["sum", 0, 3], ["add", 0, 8], ["sum", 0, 8], ["sum", 0, 1], ["add", 0, 7], ["add", 0, 8], ["add", 0, 8]]], [14, 17, 17, 3, 0, 23, 23, 14, 8, 31, 11]],
["point additions 10", [[6, 0, 6, 3, 2, 9, 2, 8], [["add", 0, 2], ["add", 0, 5], ["add", 0, 2], ["sum", 0, 5], ["sum", 0, 6], ["add", 0, 7], ["sum", 0, 5], ["add", 0, 4], ["sum", 0, 6], ["add", 0, 8], ["sum", 0, 7], ["sum", 0, 2], ["sum", 0, 5], ["sum", 0, 2], ["add", 0, 4]]], [26, 35, 33, 46, 56, 34, 45, 34]],
["point additions 11", [[1, 8, 3, 3, 8, 7, 2, 8], [["add", 0, 5], ["sum", 0, 2], ["add", 0, 5], ["add", 0, 1], ["add", 0, 1], ["add", 0, 3], ["sum", 0, 3], ["sum", 0, 8], ["sum", 0, 7], ["sum", 0, 1], ["sum", 0, 1], ["add", 0, 5], ["add", 0, 0], ["add", 0, 1], ["sum", 0, 8]]], [14, 27, 55, 47, 16, 16, 61]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [[], [["add", 0, 1]]]], ["invalid input", [[1], [["sum", 1, 0]]]], ["invalid input", [[1], [["set", 0, 1]]]]];
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
