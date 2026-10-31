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
["correction and empty range", [[4, -2, 7], [[0, 3], [1, 3], [2, 2]]], [9, 5, 0]],
["empty values", [[], [[0, 0]]], [0]],
["generated range 1", [[-4], [[0, 1], [0, 1], [0, 0]]], [-4, -4, 0]],
["generated range 2", [[-5, -5], [[0, 2], [1, 2], [0, 0]]], [-10, -5, 0]],
["generated range 3", [[4, 7, 6], [[0, 3], [1, 3], [0, 0]]], [17, 13, 0]],
["generated range 4", [[2, 0, 1, 4], [[0, 4], [2, 4], [0, 0]]], [7, 5, 0]],
["generated range 5", [[-5, 5, -3, -2, -9], [[0, 5], [2, 5], [0, 0]]], [-14, -14, 0]],
["generated range 6", [[6, 5, -2, -5, 4, 2], [[0, 6], [3, 6], [0, 0]]], [10, 1, 0]],
["generated range 7", [[3, -5, -6, -4, -8, 9, 0], [[0, 7], [3, 7], [0, 0]]], [-11, -3, 0]],
["generated range 8", [[-9, 0, 1, -7, -7, -2, -9, -7], [[0, 8], [4, 8], [0, 0]]], [-40, -25, 0]],
["generated range 9", [[-7, 5, 5, -2, 0, 7, 0, -1, 7], [[0, 9], [4, 9], [0, 0]]], [14, 13, 0]],
["generated range 10", [[-9, -2, -4, 3, -1, -3, -5, 3, 5, -3], [[0, 10], [5, 10], [0, 0]]], [-16, -3, 0]],
["generated range 11", [[-9, 9, -8, 1, -1, -1, -2, -9, -1, 0, 0], [[0, 11], [5, 11], [0, 0]]], [-21, -13, 0]],
["generated range 12", [[-8, 3, -2, -8, 8, -2, -8, -9, -2, 9, -8, 3], [[0, 12], [6, 12], [0, 0]]], [-24, -15, 0]],
["generated range 13", [[6, 2, 7, 5, -9, -8, -2, 4, 3, 3, 8, -3, -9], [[0, 13], [6, 13], [0, 0]]], [7, 4, 0]],
["generated range 14", [[-1, -1, -4, 1, -8, -3, -6, 8, -2, 2, 2, -4, -8, -8], [[0, 14], [7, 14], [0, 0]]], [-32, -10, 0]],
["generated range 15", [[-8, -1, 6, -2, -1, 4, 8, -8, -9, 3, -5, -6, 2, -4, -4], [[0, 15], [7, 15], [0, 0]]], [-25, -31, 0]],
["generated range 16", [[-5, -9, -1, 1, -1, -9, -6, 6, 2, 0, -6, 9, -2, 7, -1, 8], [[0, 16], [8, 16], [0, 0]]], [-7, 17, 0]],
["generated range 17", [[-1, -7, -3, -5, 6, 6, -6, 7, -7, 5, 1, -8, 7, -4, -8, 2, 5], [[0, 17], [8, 17], [0, 0]]], [-10, -7, 0]],
["generated range 18", [[4, 7, 3, 6, 0, -1, -7, -1, -9, -1, 1, -4, 2, -5, 9, -2, -7, 3], [[0, 18], [9, 18], [0, 0]]], [-2, -4, 0]],
["generated range 19", [[9, -1, 0, -3, 6, -3, 8, 0, -5, -1, 9, 3, 5, 1, -4, -3, 2, 0, -8], [[0, 19], [9, 19], [0, 0]]], [15, 4, 0]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["right out of bounds", [[1], [[0, 2]]]], ["reversed", [[1], [[1, 0]]]], ["negative index", [[1], [[-1, 0]]]]];
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
