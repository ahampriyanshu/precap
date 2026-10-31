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
["no self pairing", [[5], 10], null],
["two equal values", [[5, 5], 10], [5, 5]],
["canonical tie", [[4, 1, 3, 2], 5], [1, 4]],
["empty", [[], 0], null],
["negative adjustment", [[-4, 0, 4], 0], [-4, 4]],
["generated pair 0", [[], 5], null],
["generated pair 1", [[-6], 6], null],
["generated pair 2", [[2, 1], -5], null],
["generated pair 3", [[-1, 3, 3], 1], null],
["generated pair 4", [[7, 5, -2, -4], 2], null],
["generated pair 5", [[7, 4, -3, -4, 3], 0], [-4, 4]],
["generated pair 6", [[-3, 2, 3, 2, -5, 4], -2], [-5, 3]],
["generated pair 7", [[1, 5, -5, -5, 6, 2, -4], 4], null],
["generated pair 8", [[3, 0, 3, 6, 0, -2, -4, 1], 0], [0, 0]],
["generated pair 9", [[-5, 6, -3, -3, 6, 7, 6, -1, 5], 5], [-1, 6]],
["generated pair 10", [[2, 3, -2, 1, 6, 3, 6, 4, 0, -1], 0], [-2, 2]],
["generated pair 11", [[4, 0, 0, 7, 1, 3, 0, 0, 0, 4, -2], 1], [-2, 3]],
["generated pair 12", [[2, 6, 2, -4, 6, 7, -1, 3, -3, -3, -3, 5], -2], [-4, 2]],
["generated pair 13", [[-1, 2, -4, -1, 1, -6, 1, 5, 4, -2, 6, 5, -5], 7], [1, 6]],
["generated pair 14", [[7, 2, 1, -3, 5, 6, -2, 7, 1, -1, 4, 3, -1, 1], -4], [-3, -1]],
["generated pair 15", [[-3, 3, 0, -2, -5, -4, -1, -2, 6, 0, 4, 3, -3, -6, 3], 3], [-3, 6]],
["generated pair 16", [[5, -1, -2, -1, 7, 3, 4, -4, 1, -1, -3, -5, -3, -1, 5, -3], -2], [-5, 3]],
["generated pair 17", [[6, 3, -5, -4, 6, 0, 2, 3, 4, 7, 5, -1, -4, 1, -1, -5, 5], 5], [-1, 6]],
["generated pair 18", [[-6, 7, 5, 7, 7, 7, -1, 4, 5, -3, -1, -2, 5, -1, -3, 4, 6, 4], 6], [-1, 7]],
["generated pair 19", [[5, -5, -3, 2, 7, -4, -2, 5, 4, 4, -1, 4, 7, 3, 0, 7, -4, -3, 3], -1], [-5, 4]],
["generated pair 20", [[7, 7, 2, 7, -6, 2, 5, -6, -3, 3, -6, -6, -2, -2, 2, 6, -4, -2, -1, -1], -4], [-6, 2]],
["generated pair 21", [[-6, -2, 3, 5, 5, 2, 5, 1, 5, -3, 2, 6, -1, -1, 1, 4, 0, 2, 1, 2, -2], -5], [-6, 1]],
["generated pair 22", [[0, -3, 2, -4, -1, -5, -5, 1, 5, 7, 1, 7, 0, 5, -6, 1, -1, 4, 2, -4, 6, 2], -5], [-6, 1]],
["generated pair 23", [[3, -5, -3, -5, 0, -5, 3, 4, -6, -3, -4, 2, -4, -5, 2, -4, 1, 5, 0, 2, -3, 5, 4], -2], [-6, 4]],
["generated pair 24", [[6, 2, -6, -3, 2, -5, 6, 5, 0, -2, 3, 0, -6, 6, -1, 2, 4, 0, -3, -4, -6, 3, -6, -1], 6], [0, 6]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
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
