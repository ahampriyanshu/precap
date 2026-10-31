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
["duplicate removal", [["food", "food", "water", "fuel", "water"], 2], 3],
["empty", [[], 2], 0],
["no kinds allowed", [["a"], 0], 0],
["window n=1 k=0", [["b"], 0], 0],
["window n=1 k=1", [["c"], 1], 1],
["window n=1 k=2", [["b"], 2], 1],
["window n=1 k=3", [["c"], 3], 1],
["window n=2 k=0", [["a", "a"], 0], 0],
["window n=2 k=1", [["a", "b"], 1], 1],
["window n=2 k=2", [["a", "a"], 2], 2],
["window n=2 k=3", [["a", "b"], 3], 2],
["window n=3 k=0", [["b", "a", "a"], 0], 0],
["window n=3 k=1", [["a", "c", "a"], 1], 1],
["window n=3 k=2", [["c", "c", "c"], 2], 3],
["window n=3 k=3", [["c", "a", "c"], 3], 3],
["window n=4 k=0", [["b", "c", "a", "a"], 0], 0],
["window n=4 k=1", [["b", "c", "c", "a"], 1], 2],
["window n=4 k=2", [["a", "c", "c", "b"], 2], 3],
["window n=4 k=3", [["c", "b", "c", "c"], 3], 4],
["window n=5 k=0", [["c", "a", "c", "c", "c"], 0], 0],
["window n=5 k=1", [["b", "a", "b", "a", "a"], 1], 2],
["window n=5 k=2", [["a", "a", "b", "b", "c"], 2], 4],
["window n=5 k=3", [["a", "b", "b", "a", "a"], 3], 5],
["window n=6 k=0", [["b", "a", "b", "b", "c", "a"], 0], 0],
["window n=6 k=1", [["c", "a", "c", "a", "a", "a"], 1], 3],
["window n=6 k=2", [["a", "a", "b", "a", "b", "b"], 2], 6],
["window n=6 k=3", [["b", "a", "b", "b", "b", "a"], 3], 6],
["window n=7 k=0", [["a", "c", "a", "b", "b", "a", "a"], 0], 0],
["window n=7 k=1", [["b", "b", "b", "b", "c", "c", "c"], 1], 4],
["window n=7 k=2", [["b", "b", "a", "a", "c", "b", "c"], 2], 4],
["window n=7 k=3", [["b", "a", "a", "c", "b", "c", "c"], 3], 7],
["window n=8 k=0", [["a", "c", "c", "a", "c", "a", "a", "c"], 0], 0],
["window n=8 k=1", [["b", "a", "c", "b", "c", "b", "a", "c"], 1], 1],
["window n=8 k=2", [["c", "a", "a", "c", "a", "b", "a", "c"], 2], 5],
["window n=8 k=3", [["b", "a", "c", "c", "c", "a", "a", "b"], 3], 8],
["window n=9 k=0", [["b", "c", "b", "c", "a", "c", "a", "b", "b"], 0], 0],
["window n=9 k=1", [["a", "b", "c", "a", "a", "b", "a", "b", "b"], 1], 2],
["window n=9 k=2", [["a", "b", "b", "b", "c", "c", "a", "c", "b"], 2], 5],
["window n=9 k=3", [["c", "a", "b", "a", "b", "b", "c", "b", "c"], 3], 9],
["window n=10 k=0", [["b", "c", "b", "a", "c", "a", "b", "a", "a", "c"], 0], 0],
["window n=10 k=1", [["a", "b", "a", "b", "c", "c", "c", "a", "b", "c"], 1], 3],
["window n=10 k=2", [["a", "b", "c", "c", "c", "b", "a", "c", "c", "b"], 2], 5],
["window n=10 k=3", [["a", "a", "b", "a", "c", "c", "c", "c", "c", "b"], 3], 10],
["window n=11 k=0", [["b", "a", "c", "c", "c", "c", "c", "c", "a", "c", "a"], 0], 0],
["window n=11 k=1", [["a", "b", "b", "b", "a", "a", "b", "b", "b", "c", "c"], 1], 3],
["window n=11 k=2", [["c", "b", "c", "c", "a", "b", "c", "b", "b", "a", "b"], 2], 4],
["window n=11 k=3", [["a", "a", "b", "c", "a", "c", "c", "c", "c", "c", "b"], 3], 11]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["negative limit", [["a"], -1]]];
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
