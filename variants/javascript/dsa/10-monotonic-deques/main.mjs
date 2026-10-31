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
["expiring descending maximum", [[9, 8, 7, 6], 2], [9, 8, 7]],
["duplicate peak", [[4, 4, 1, 4], 2], [4, 4, 4]],
["empty", [[], 1], []],
["no full window", [[1], 2], []],
["peak n=1 w=1", [[0], 1], [0]],
["peak n=1 w=3", [[-9], 3], []],
["peak n=1 w=5", [[-6], 5], []],
["peak n=2 w=1", [[9, -3], 1], [9, -3]],
["peak n=2 w=3", [[-2, -10], 3], []],
["peak n=2 w=5", [[-9, 5], 5], []],
["peak n=3 w=1", [[-4, 10, 7], 1], [-4, 10, 7]],
["peak n=3 w=3", [[1, 10, -6], 3], [10]],
["peak n=3 w=5", [[-9, 1, 0], 5], []],
["peak n=4 w=1", [[-5, -4, 5, -6], 1], [-5, -4, 5, -6]],
["peak n=4 w=3", [[1, -7, 2, 1], 3], [2, 2]],
["peak n=4 w=5", [[8, 3, -7, 5], 5], []],
["peak n=5 w=1", [[-8, -4, -5, 6, 0], 1], [-8, -4, -5, 6, 0]],
["peak n=5 w=3", [[7, 6, -7, 1, -2], 3], [7, 6, 1]],
["peak n=5 w=5", [[-5, 9, 9, 2, -9], 5], [9]],
["peak n=6 w=1", [[-6, 10, -10, 6, 4, -7], 1], [-6, 10, -10, 6, 4, -7]],
["peak n=6 w=3", [[-8, -8, 3, -4, -4, -7], 3], [3, 3, 3, -4]],
["peak n=6 w=5", [[3, 5, 10, -1, 5, 7], 5], [10, 10]],
["peak n=7 w=1", [[1, -3, -6, 1, 6, 5, 7], 1], [1, -3, -6, 1, 6, 5, 7]],
["peak n=7 w=3", [[7, 6, 4, -3, -4, -5, 1], 3], [7, 6, 4, -3, 1]],
["peak n=7 w=5", [[6, -6, -5, 10, -9, 10, -3], 5], [10, 10, 10]],
["peak n=8 w=1", [[-5, -10, -5, -6, 2, 0, 5, 7], 1], [-5, -10, -5, -6, 2, 0, 5, 7]],
["peak n=8 w=3", [[5, -6, -10, -3, -9, 2, -4, 2], 3], [5, -3, -3, 2, 2, 2]],
["peak n=8 w=5", [[-8, -3, -9, -10, -9, 6, 5, -6], 5], [-3, 6, 6, 6]],
["peak n=9 w=1", [[9, -8, 6, -2, 3, -9, -9, 1, 5], 1], [9, -8, 6, -2, 3, -9, -9, 1, 5]],
["peak n=9 w=3", [[-10, 1, -6, -9, -10, 9, -7, -9, -10], 3], [1, 1, -6, 9, 9, 9, -7]],
["peak n=9 w=5", [[-7, -2, 2, 9, -7, -9, -2, -4, -10], 5], [9, 9, 9, 9, -2]],
["peak n=10 w=1", [[-2, 7, -9, -7, -3, 5, 6, 6, -8, 7], 1], [-2, 7, -9, -7, -3, 5, 6, 6, -8, 7]],
["peak n=10 w=3", [[-3, 0, -10, -2, -5, 4, 10, -3, 3, -1], 3], [0, 0, -2, 4, 10, 10, 10, 3]],
["peak n=10 w=5", [[8, 0, 7, 9, 10, -10, 9, -3, 9, 7], 5], [10, 10, 10, 10, 10, 9]],
["peak n=11 w=1", [[9, -8, 7, 9, -6, -8, 8, -2, -10, 10, -4], 1], [9, -8, 7, 9, -6, -8, 8, -2, -10, 10, -4]],
["peak n=11 w=3", [[6, 5, -6, -9, -5, -9, -10, 2, 7, 8, -4], 3], [6, 5, -5, -5, -5, 2, 7, 8, 8]],
["peak n=11 w=5", [[-2, -10, -3, 0, -4, -3, -9, 4, 3, -4, 8], 5], [0, 0, 0, 4, 4, 4, 8]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [[1], 0]]];
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
