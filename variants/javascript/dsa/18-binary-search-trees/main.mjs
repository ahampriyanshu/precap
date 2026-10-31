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
["two-child deletion", [[["add", 5], ["add", 3], ["add", 8], ["add", 6], ["remove", 5], ["floor", 7], ["contains", 5]]], [true, true, true, true, true, 6, false]],
["duplicate and missing", [[["add", 2], ["add", 2], ["remove", 9], ["floor", 1]]], [true, false, false, null]],
["no commands", [[]], []],
["command history 0", [[["remove", -5], ["floor", 0], ["floor", 9], ["contains", -2], ["contains", 4], ["contains", 7], ["remove", -2], ["contains", 2], ["floor", 1], ["remove", 0], ["remove", 8], ["contains", 9], ["contains", 5], ["add", -1], ["floor", 9], ["add", 1], ["remove", -4], ["floor", -2], ["add", 6], ["add", -4], ["remove", 8], ["floor", -3], ["floor", 9], ["add", 9], ["contains", 2], ["contains", -3], ["add", 6], ["contains", -2], ["add", 7], ["contains", 8], ["add", 8], ["floor", 6], ["contains", -3], ["add", 3], ["contains", 7]]], [false, null, null, false, false, false, false, false, null, false, false, false, false, true, -1, true, false, null, true, true, false, -4, 6, true, false, false, false, false, true, false, true, 6, false, true, true]],
["command history 1", [[["remove", -1], ["contains", 6], ["add", 0], ["floor", 2], ["floor", 6], ["remove", 8], ["add", 5], ["add", 7], ["floor", -2], ["contains", -4], ["remove", 4], ["remove", 3], ["remove", -5], ["contains", 7], ["add", -4], ["contains", 0], ["contains", 4], ["floor", 8], ["add", -3], ["floor", 1], ["add", 0], ["add", -4], ["add", -5], ["add", 1], ["contains", -5], ["contains", -5], ["add", 7], ["floor", 0], ["add", 5], ["floor", 1], ["remove", 5], ["contains", -1], ["add", 1], ["remove", -2], ["floor", 1]]], [false, false, true, 0, 0, false, true, true, null, false, false, false, false, true, true, true, false, 7, true, 0, false, false, true, true, true, true, false, 0, false, 1, true, false, false, false, 1]],
["command history 2", [[["add", 7], ["remove", 7], ["contains", 5], ["floor", 2], ["contains", 7], ["remove", 8], ["remove", 4], ["remove", 1], ["add", -4], ["floor", 3], ["remove", -5], ["floor", 5], ["floor", 0], ["contains", 8], ["floor", -5], ["remove", -3], ["floor", 5], ["contains", 4], ["contains", -5], ["contains", 3], ["add", 2], ["remove", -1], ["add", 3], ["add", 0], ["add", -3], ["add", 7], ["contains", 7], ["contains", 8], ["remove", 1], ["contains", 7], ["floor", -4], ["contains", -5], ["contains", 2], ["add", -1], ["add", -4]]], [true, true, false, null, false, false, false, false, true, -4, false, -4, -4, false, null, false, -4, false, false, false, true, false, true, true, true, true, true, false, false, true, -4, false, true, true, false]],
["command history 3", [[["floor", 0], ["floor", 2], ["add", -1], ["add", 2], ["add", -4], ["remove", 9], ["remove", -4], ["contains", 8], ["add", 2], ["add", 4], ["contains", -1], ["contains", 1], ["remove", -5], ["remove", -5], ["remove", 4], ["add", 4], ["remove", -5], ["contains", -2], ["remove", -3], ["floor", 8], ["floor", -3], ["floor", 0], ["floor", 0], ["contains", 9], ["floor", 9], ["contains", -2], ["contains", 8], ["remove", -5], ["add", 0], ["floor", 5], ["remove", -5], ["remove", 7], ["contains", 1], ["add", 7], ["contains", 6]]], [null, null, true, true, true, false, true, false, false, true, true, false, false, false, true, true, false, false, false, 4, null, -1, -1, false, 4, false, false, false, true, 4, false, false, false, true, false]],
["command history 4", [[["contains", 0], ["remove", -4], ["contains", -4], ["floor", 6], ["add", 6], ["floor", 6], ["remove", 2], ["add", 6], ["add", 7], ["remove", -1], ["contains", 6], ["contains", 9], ["contains", 0], ["remove", 0], ["floor", 7], ["remove", 4], ["contains", -4], ["add", 1], ["remove", 9], ["floor", -1], ["remove", 0], ["floor", 8], ["add", -4], ["remove", 5], ["remove", 0], ["add", 7], ["add", 7], ["contains", 7], ["contains", 2], ["floor", -5], ["add", 0], ["add", 0], ["remove", 0], ["contains", -2], ["floor", 8]]], [false, false, false, null, true, 6, false, false, true, false, true, false, false, false, 7, false, false, true, false, null, false, 7, true, false, false, false, false, true, false, null, true, false, true, false, 7]],
["command history 5", [[["contains", -3], ["add", 7], ["remove", 5], ["add", 3], ["remove", 3], ["remove", 5], ["contains", -3], ["floor", 5], ["add", -4], ["floor", 0], ["floor", 5], ["add", 7], ["floor", -3], ["contains", 5], ["contains", 3], ["add", 3], ["remove", -5], ["floor", 5], ["floor", -1], ["add", 9], ["contains", 3], ["contains", -1], ["remove", 0], ["remove", -1], ["floor", 0], ["add", 3], ["contains", 0], ["add", 9], ["add", 1], ["add", -5], ["remove", 2], ["remove", 4], ["add", -4], ["add", 7], ["floor", 4]]], [false, true, false, true, true, false, false, null, true, -4, -4, false, -4, false, false, true, false, 3, -4, true, true, false, false, false, -4, false, false, false, true, true, false, false, false, false, 3]],
["command history 6", [[["remove", -1], ["add", 4], ["contains", 2], ["contains", 5], ["add", -1], ["add", -3], ["remove", 8], ["add", 6], ["floor", 7], ["contains", 6], ["add", 4], ["floor", -1], ["contains", 6], ["add", 3], ["contains", 6], ["remove", 8], ["contains", 4], ["floor", 0], ["add", -3], ["floor", -2], ["floor", 6], ["contains", 6], ["contains", 3], ["contains", -1], ["add", -2], ["remove", 3], ["add", -4], ["contains", 0], ["add", -1], ["add", 9], ["remove", -1], ["floor", -5], ["remove", 0], ["floor", 4], ["add", 5]]], [false, true, false, false, true, true, false, true, 6, true, false, -1, true, true, true, false, true, -1, false, -3, 6, true, true, true, true, true, true, false, false, true, true, null, false, 4, true]],
["command history 7", [[["add", 9], ["floor", -5], ["contains", 1], ["contains", -1], ["add", 7], ["contains", -3], ["add", 0], ["add", 7], ["contains", 0], ["contains", 3], ["remove", 2], ["add", 1], ["floor", 0], ["floor", 6], ["add", 6], ["add", -5], ["contains", 8], ["add", 1], ["contains", -3], ["add", -4], ["floor", 5], ["floor", -5], ["floor", 4], ["remove", 2], ["floor", 0], ["contains", -2], ["contains", 6], ["add", 9], ["floor", 1], ["floor", 2], ["remove", 6], ["contains", 8], ["add", -5], ["remove", 4], ["remove", -2]]], [true, null, false, false, true, false, true, false, true, false, false, true, 0, 1, true, true, false, false, false, true, 1, -5, 1, false, 0, false, true, false, 1, 1, true, false, false, false, false]],
["command history 8", [[["contains", 5], ["contains", -5], ["remove", 6], ["floor", -3], ["remove", -3], ["contains", 4], ["floor", -1], ["remove", 7], ["contains", 6], ["contains", 9], ["add", -2], ["contains", 8], ["remove", -5], ["floor", -3], ["contains", 1], ["contains", -3], ["add", -5], ["contains", 3], ["add", 9], ["add", -2], ["remove", 8], ["remove", -2], ["add", 2], ["contains", 0], ["floor", 4], ["remove", -4], ["add", -4], ["contains", 0], ["add", 3], ["add", -2], ["contains", 5], ["add", 4], ["add", 1], ["floor", 4], ["floor", 8]]], [false, false, false, null, false, false, null, false, false, false, true, false, false, null, false, false, true, false, true, false, false, true, true, false, 2, false, true, false, true, true, false, true, true, 4, 4]],
["command history 9", [[["floor", -1], ["add", 4], ["floor", 7], ["floor", 6], ["floor", 6], ["remove", -2], ["floor", 8], ["remove", 7], ["add", 5], ["floor", 2], ["remove", 0], ["contains", -4], ["floor", 0], ["remove", 7], ["remove", -4], ["remove", -5], ["contains", 6], ["remove", 8], ["remove", 2], ["contains", 1], ["remove", -2], ["floor", -1], ["floor", 8], ["contains", 5], ["floor", -5], ["add", 0], ["remove", 1], ["floor", 1], ["contains", -5], ["contains", 2], ["remove", 4], ["add", -1], ["floor", -1], ["remove", 9], ["contains", 1]]], [null, true, 4, 4, 4, false, 4, false, true, null, false, false, null, false, false, false, false, false, false, false, false, null, 5, true, null, true, false, 0, false, false, true, true, -1, false, false]],
["command history 10", [[["remove", 0], ["add", 1], ["contains", -4], ["remove", 3], ["contains", 3], ["remove", 8], ["contains", 1], ["remove", 3], ["floor", -2], ["add", 3], ["floor", -2], ["contains", -5], ["add", -5], ["add", -4], ["contains", -3], ["floor", -3], ["remove", -4], ["contains", -2], ["remove", 8], ["remove", 3], ["add", 3], ["add", 8], ["add", 0], ["contains", 6], ["contains", 0], ["floor", 5], ["contains", -5], ["floor", -5], ["contains", 4], ["floor", 9], ["add", 7], ["floor", 2], ["contains", 2], ["contains", -5], ["add", -1]]], [false, true, false, false, false, false, true, false, null, true, null, false, true, true, false, -4, true, false, false, true, true, true, true, false, true, 3, true, -5, false, 8, true, 1, false, true, true]],
["command history 11", [[["floor", -2], ["floor", 1], ["floor", 1], ["add", 5], ["contains", 9], ["floor", -5], ["floor", 4], ["floor", -3], ["contains", -5], ["floor", 1], ["remove", 6], ["remove", 6], ["add", 4], ["remove", 2], ["floor", -3], ["floor", 2], ["add", -4], ["add", 7], ["add", 2], ["remove", 6], ["add", 1], ["remove", 3], ["contains", 3], ["floor", 7], ["remove", 7], ["contains", 8], ["remove", 4], ["floor", 2], ["floor", 0], ["contains", 1], ["remove", -3], ["add", -3], ["floor", -4], ["remove", 4], ["remove", -1]]], [null, null, null, true, false, null, null, null, false, null, false, false, true, false, null, null, true, true, true, false, true, false, false, 7, true, false, true, 2, -4, true, false, true, -4, false, false]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [[["unknown", 1]]]]];
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
