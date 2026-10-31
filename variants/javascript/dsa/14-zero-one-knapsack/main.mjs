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
["greedy ratio counterexample", [[[2, 3], [3, 4], [4, 5]], 6], 8],
["no item reuse", [[[2, 3]], 4], 3],
["no items", [[], 0], 0],
["zero value", [[[2, 0], [2, 7]], 2], 7],
["item selection 0", [[], 8], 0],
["item selection 1", [[[4, 7]], 2], 0],
["item selection 2", [[[3, 10], [3, 8]], 5], 10],
["item selection 3", [[[4, 2], [1, 10], [3, 0]], 13], 12],
["item selection 4", [[[6, 5], [3, 2], [3, 11], [4, 10]], 7], 21],
["item selection 5", [[[3, 3], [2, 5], [6, 8], [1, 6], [3, 11]], 8], 22],
["item selection 6", [[[4, 1], [1, 5], [5, 6], [4, 3], [6, 7], [2, 3]], 7], 12],
["item selection 7", [[[5, 4], [5, 1], [6, 4], [6, 9], [4, 9], [3, 8], [2, 9]], 7], 18],
["item selection 8", [[[3, 3], [4, 8], [2, 3], [3, 7], [2, 3], [3, 0], [2, 1], [3, 3]], 11], 21],
["item selection 9", [[[5, 1], [2, 1], [3, 11], [4, 3], [2, 11], [1, 5], [2, 10], [6, 2], [1, 0]], 0], 0],
["item selection 10", [[[3, 2], [5, 7], [5, 5], [6, 5], [4, 7], [6, 1], [5, 0], [3, 7], [6, 9], [3, 7]], 9], 16],
["item selection 11", [[[2, 2], [3, 1], [1, 7], [5, 11], [1, 4], [3, 4], [4, 8], [2, 3], [3, 1], [1, 0], [5, 1]], 11], 30]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [[[0, 2]], 3]], ["invalid input", [[], -1]]];
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
