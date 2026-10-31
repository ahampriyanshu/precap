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
["earliest-start trap", [[["long", 0, 10], ["a", 1, 2], ["b", 2, 3], ["c", 3, 4]]], ["a", "b", "c"]],
["tie and touching", [[["b", 0, 2], ["a", 0, 2], ["c", 2, 3]]], ["a", "c"]],
["empty schedule", [[]], []],
["generated schedule 1", [[["j0", 4, 8]]], ["j0"]],
["generated schedule 2", [[["j0", 8, 13], ["j1", 2, 5]]], ["j1", "j0"]],
["generated schedule 3", [[["j0", 5, 9], ["j1", 7, 9], ["j2", 6, 11]]], ["j0"]],
["generated schedule 4", [[["j0", -2, -1], ["j1", 5, 7], ["j2", -3, 0], ["j3", 2, 6]]], ["j0", "j3"]],
["generated schedule 5", [[["j0", 1, 5], ["j1", 0, 2], ["j2", -2, -1], ["j3", 4, 6], ["j4", 4, 9]]], ["j2", "j1", "j3"]],
["generated schedule 6", [[["j0", 0, 4], ["j1", 1, 2], ["j2", 2, 4], ["j3", 0, 3], ["j4", -1, 3], ["j5", 0, 4]]], ["j1", "j2"]],
["generated schedule 7", [[["j0", 2, 6], ["j1", -2, 1], ["j2", 6, 8], ["j3", -1, 1], ["j4", -4, 1], ["j5", 9, 12], ["j6", 6, 8]]], ["j4", "j0", "j2", "j5"]],
["generated schedule 8", [[["j0", 8, 9], ["j1", -1, 2], ["j2", 3, 4], ["j3", 6, 9], ["j4", 4, 7], ["j5", 3, 4], ["j6", 0, 3], ["j7", 9, 12]]], ["j1", "j2", "j4", "j0", "j7"]],
["generated schedule 9", [[["j0", -4, -1], ["j1", 8, 12], ["j2", 6, 8], ["j3", 0, 5], ["j4", 1, 4], ["j5", 9, 11], ["j6", 2, 3], ["j7", -4, -1], ["j8", 6, 11]]], ["j0", "j6", "j2", "j5"]],
["generated schedule 10", [[["j0", 8, 11], ["j1", -3, 1], ["j2", -1, 4], ["j3", 7, 10], ["j4", 6, 11], ["j5", 0, 5], ["j6", 0, 3], ["j7", -2, 3], ["j8", 1, 3], ["j9", 9, 13]]], ["j1", "j8", "j3"]],
["generated schedule 11", [[["j0", 0, 1], ["j1", 2, 5], ["j2", -3, -2], ["j3", -3, -2], ["j4", 9, 10], ["j5", -4, -1], ["j6", -4, 0], ["j7", 3, 8], ["j8", -3, 0], ["j9", 9, 14], ["j10", -1, 0]]], ["j2", "j10", "j0", "j1", "j4"]],
["generated schedule 12", [[["j0", 2, 6], ["j1", -4, -1], ["j2", -1, 3], ["j3", -2, 0], ["j4", 2, 7], ["j5", 4, 7], ["j6", 4, 7], ["j7", -3, 2], ["j8", -2, 3], ["j9", 5, 8], ["j10", 6, 11], ["j11", 8, 11]]], ["j1", "j2", "j5", "j11"]],
["generated schedule 13", [[["j0", 2, 4], ["j1", 1, 4], ["j2", 6, 10], ["j3", -2, 2], ["j4", 8, 10], ["j5", 2, 5], ["j6", 6, 9], ["j7", 3, 7], ["j8", 5, 7], ["j9", 4, 8], ["j10", 6, 10], ["j11", 1, 3], ["j12", 0, 3]]], ["j3", "j0", "j8", "j4"]],
["generated schedule 14", [[["j0", 6, 7], ["j1", 0, 5], ["j2", 9, 14], ["j3", 1, 2], ["j4", 8, 9], ["j5", 7, 11], ["j6", 3, 8], ["j7", 7, 8], ["j8", -4, 1], ["j9", 5, 9], ["j10", 9, 10], ["j11", -3, 0], ["j12", 0, 1], ["j13", 0, 3]]], ["j11", "j12", "j3", "j0", "j7", "j4", "j10"]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [[["x", 2, 2]]]]];
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
