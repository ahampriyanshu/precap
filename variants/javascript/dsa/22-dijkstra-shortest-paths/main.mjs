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
["discovery is not finalization", [4, [[0, 1, 10], [0, 2, 1], [2, 1, 1]], 0], [0, 2, 1, null]],
["zero cycle and stale entry", [3, [[0, 1, 0], [1, 0, 0], [1, 2, 2], [0, 2, 9]], 0], [0, 0, 2]],
["weighted graph 1", [1, [], 0], [0]],
["weighted graph 2", [2, [], 0], [0, null]],
["weighted graph 3", [3, [[2, 1, 2]], 0], [0, null, null]],
["weighted graph 4", [4, [[2, 1, 2]], 0], [0, null, null, null]],
["weighted graph 5", [5, [[0, 0, 7], [4, 0, 8], [4, 1, 0]], 0], [0, null, null, null, null]],
["weighted graph 6", [6, [[2, 1, 8], [2, 3, 7], [3, 0, 6], [4, 0, 1], [4, 2, 7], [5, 0, 1]], 0], [0, null, null, null, null, null]],
["weighted graph 7", [7, [[1, 4, 5], [1, 5, 1], [2, 3, 0], [2, 6, 7], [3, 3, 4], [6, 2, 2], [6, 3, 0]], 0], [0, null, null, null, null, null, null]],
["weighted graph 8", [8, [[0, 3, 0], [0, 4, 6], [1, 0, 2], [1, 4, 3], [1, 5, 5], [1, 7, 7], [4, 6, 1], [4, 7, 6], [5, 0, 0], [5, 1, 6], [5, 4, 0], [5, 5, 2], [7, 6, 8]], 0], [0, null, null, 0, 6, null, 7, 12]],
["weighted graph 9", [9, [[0, 8, 6], [1, 0, 3], [2, 0, 6], [2, 1, 1], [3, 2, 0], [3, 6, 1], [4, 2, 2], [4, 5, 6], [5, 3, 4], [5, 4, 7], [5, 6, 5], [5, 8, 2], [6, 1, 0], [6, 3, 7], [6, 5, 1], [6, 7, 3], [7, 8, 8], [8, 2, 1]], 0], [0, 8, 7, null, null, null, null, null, 6]],
["weighted graph 10", [10, [[0, 0, 8], [0, 7, 8], [0, 9, 2], [1, 2, 7], [2, 2, 6], [2, 3, 5], [2, 8, 7], [2, 9, 2], [3, 0, 4], [3, 3, 6], [4, 5, 5], [5, 4, 3], [5, 9, 8], [6, 2, 3], [6, 6, 5], [6, 8, 5], [6, 9, 0], [7, 1, 1], [7, 2, 3], [8, 8, 1], [8, 9, 1], [9, 0, 4], [9, 4, 3], [9, 5, 8]], 0], [0, 9, 11, 16, 5, 10, null, 8, 18, 2]],
["weighted graph 11", [11, [[0, 8, 4], [1, 0, 0], [1, 1, 1], [1, 2, 3], [1, 3, 2], [1, 7, 3], [1, 8, 5], [2, 3, 3], [3, 4, 5], [3, 5, 2], [3, 8, 3], [4, 1, 0], [4, 2, 8], [4, 9, 8], [5, 3, 3], [5, 6, 2], [6, 0, 2], [7, 0, 0], [7, 9, 2], [8, 10, 8], [9, 7, 6], [10, 3, 1], [10, 7, 0]], 0], [0, 18, 21, 13, 18, 15, 17, 12, 4, 14, 12]],
["weighted graph 12", [12, [[0, 9, 0], [0, 10, 0], [1, 1, 2], [1, 5, 8], [1, 11, 7], [3, 0, 7], [3, 11, 0], [4, 1, 6], [4, 2, 0], [4, 9, 6], [5, 3, 2], [5, 8, 4], [6, 10, 5], [7, 7, 5], [8, 2, 0], [8, 5, 5], [9, 7, 8], [9, 9, 6], [9, 10, 7], [10, 1, 6], [10, 6, 2], [10, 7, 4]], 0], [0, 6, 18, 16, null, 14, 2, 4, 18, 0, 0, 13]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [2, [[0, 1, -1]], 0]], ["invalid input", [0, [], 0]]];
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
