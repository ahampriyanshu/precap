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
["old minimum increases", [[1, 5], [["min", 0, 2], ["set", 0, 9], ["min", 0, 2], ["min", 1, 1]]], [1, 5, null]],
["empty values", [[], [["min", 0, 0]]], [null]],
["point replacements 0", [[-8, 7, 2, -2, -6, 2, -9, 2], [["min", 0, 1], ["set", 0, 0], ["min", 0, 5], ["min", 0, 8], ["min", 0, 4], ["min", 0, 4], ["set", 0, 3], ["set", 0, 0], ["min", 0, 4], ["set", 0, 5], ["set", 0, 1], ["set", 0, 8], ["min", 0, 5], ["set", 0, 1], ["min", 0, 7], ["set", 0, 6], ["set", 0, 2], ["set", 0, 7], ["set", 0, 3], ["set", 0, 5]]], [-8, -6, -9, -2, -2, -2, -6, -9]],
["point replacements 1", [[0, 4, 8, -1, -7, -1, -1, 0], [["set", 0, 3], ["set", 0, 3], ["set", 0, 6], ["set", 0, 3], ["min", 0, 4], ["min", 0, 8], ["min", 0, 0], ["set", 0, 2], ["min", 0, 0], ["min", 0, 6], ["set", 0, 1], ["set", 0, 4], ["set", 0, 6], ["min", 0, 7], ["min", 0, 0], ["set", 0, 3], ["min", 0, 6], ["set", 0, 6], ["set", 0, 8], ["min", 0, 4]]], [-1, -7, null, null, -7, -7, null, -7, -1]],
["point replacements 2", [[-3, -2, -1, 5, -4, -7, 3, -5], [["set", 0, 4], ["set", 0, 5], ["set", 0, 2], ["min", 0, 6], ["set", 0, 5], ["set", 0, 6], ["min", 0, 2], ["set", 0, 3], ["set", 0, 7], ["set", 0, 7], ["set", 0, 2], ["set", 0, 6], ["set", 0, 6], ["set", 0, 6], ["set", 0, 7], ["min", 0, 6], ["min", 0, 2], ["min", 0, 8], ["min", 0, 8], ["min", 0, 4]]], [-7, -2, -7, -2, -7, -7, -2]],
["point replacements 3", [[5, -7, -8, 7, 1, 0, 4, 6], [["min", 0, 5], ["set", 0, 2], ["min", 0, 0], ["min", 0, 6], ["set", 0, 2], ["min", 0, 1], ["min", 0, 1], ["set", 0, 4], ["set", 0, 5], ["min", 0, 4], ["set", 0, 7], ["min", 0, 8], ["set", 0, 3], ["set", 0, 5], ["min", 0, 6], ["min", 0, 7], ["min", 0, 6], ["set", 0, 8], ["min", 0, 4], ["set", 0, 7]]], [-8, null, -8, 2, 2, -8, -8, -8, -8, -8, -8]],
["point replacements 4", [[1, -3, 2, 8, -1, 6, -9, 5], [["set", 0, 0], ["min", 0, 3], ["set", 0, 2], ["min", 0, 2], ["set", 0, 1], ["set", 0, 3], ["min", 0, 5], ["set", 0, 7], ["set", 0, 6], ["set", 0, 3], ["set", 0, 4], ["set", 0, 3], ["min", 0, 0], ["min", 0, 4], ["set", 0, 4], ["min", 0, 3], ["set", 0, 0], ["set", 0, 3], ["set", 0, 3], ["set", 0, 1]]], [-3, -3, -3, null, -3, -3]],
["point replacements 5", [[-7, 8, 7, 3, 3, 0, -4, -2], [["set", 0, 3], ["set", 0, 0], ["min", 0, 2], ["set", 0, 0], ["min", 0, 5], ["min", 0, 5], ["set", 0, 5], ["set", 0, 2], ["min", 0, 1], ["set", 0, 5], ["min", 0, 8], ["set", 0, 5], ["set", 0, 8], ["min", 0, 3], ["set", 0, 4], ["min", 0, 4], ["min", 0, 2], ["set", 0, 0], ["set", 0, 8], ["min", 0, 7]]], [0, 0, 0, 2, -4, 7, 3, 4, -4]],
["point replacements 6", [[3, 1, -6, 7, 0, -2, 5, -7], [["set", 0, 5], ["set", 0, 3], ["min", 0, 4], ["min", 0, 5], ["min", 0, 4], ["min", 0, 8], ["set", 0, 8], ["min", 0, 8], ["min", 0, 8], ["min", 0, 1], ["min", 0, 2], ["set", 0, 1], ["min", 0, 0], ["min", 0, 1], ["set", 0, 6], ["set", 0, 6], ["min", 0, 8], ["min", 0, 0], ["min", 0, 2], ["min", 0, 7]]], [-6, -6, -6, -7, -7, -7, 8, 1, null, 1, -7, null, 1, -6]],
["point replacements 7", [[7, 8, -2, 3, -1, 3, -4, 2], [["min", 0, 0], ["min", 0, 8], ["set", 0, 1], ["min", 0, 3], ["set", 0, 3], ["set", 0, 1], ["min", 0, 8], ["min", 0, 1], ["min", 0, 6], ["set", 0, 1], ["set", 0, 8], ["set", 0, 7], ["min", 0, 3], ["min", 0, 3], ["min", 0, 4], ["set", 0, 6], ["min", 0, 0], ["min", 0, 1], ["set", 0, 2], ["set", 0, 4]]], [null, -4, -2, -4, 1, -2, -2, -2, -2, null, 6]],
["point replacements 8", [[-7, 7, -4, -1, -8, -7, 3, 1], [["set", 0, 5], ["min", 0, 5], ["min", 0, 4], ["min", 0, 4], ["set", 0, 7], ["min", 0, 4], ["min", 0, 4], ["set", 0, 1], ["min", 0, 7], ["set", 0, 1], ["min", 0, 6], ["set", 0, 2], ["min", 0, 3], ["set", 0, 2], ["min", 0, 1], ["min", 0, 6], ["min", 0, 1], ["min", 0, 6], ["set", 0, 7], ["set", 0, 2]]], [-8, -4, -4, -4, -4, -8, -8, -4, 2, -8, 2, -8]],
["point replacements 9", [[0, -8, 7, -2, -6, -1, 1, -1], [["min", 0, 3], ["min", 0, 5], ["set", 0, 1], ["set", 0, 3], ["set", 0, 7], ["min", 0, 0], ["set", 0, 1], ["min", 0, 1], ["min", 0, 5], ["set", 0, 1], ["set", 0, 8], ["set", 0, 2], ["min", 0, 1], ["min", 0, 1], ["set", 0, 0], ["set", 0, 2], ["min", 0, 0], ["min", 0, 3], ["set", 0, 4], ["set", 0, 6]]], [-8, -8, null, 1, -8, 2, 2, null, -8]],
["point replacements 10", [[8, -3, -2, -2, 5, 5, 4, -7], [["min", 0, 2], ["min", 0, 3], ["min", 0, 0], ["set", 0, 8], ["min", 0, 5], ["min", 0, 6], ["set", 0, 5], ["set", 0, 6], ["min", 0, 5], ["min", 0, 3], ["set", 0, 2], ["min", 0, 1], ["min", 0, 0], ["set", 0, 0], ["set", 0, 4], ["set", 0, 2], ["set", 0, 0], ["min", 0, 1], ["min", 0, 2], ["set", 0, 6]]], [-3, -3, null, -3, -3, -3, -3, 2, null, 0, -3]],
["point replacements 11", [[-3, 0, -8, -2, -6, 6, 5, -3], [["min", 0, 3], ["min", 0, 2], ["set", 0, 6], ["set", 0, 0], ["min", 0, 2], ["min", 0, 0], ["set", 0, 7], ["set", 0, 0], ["min", 0, 1], ["min", 0, 8], ["set", 0, 8], ["set", 0, 7], ["min", 0, 8], ["min", 0, 7], ["set", 0, 8], ["min", 0, 4], ["set", 0, 1], ["min", 0, 1], ["min", 0, 7], ["set", 0, 2]]], [-8, -3, 0, null, 0, -8, -8, -8, -8, 1, -8]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [[1], [["set", 1, 2]]]], ["invalid input", [[1], [["min", 0, 2]]]], ["invalid input", [[1], [["add", 0, 2]]]]];
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
