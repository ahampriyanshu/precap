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
["cheap cycle leaves a vertex disconnected", [4, [[0, 1, 1], [1, 2, 1], [0, 2, 1], [2, 3, 9]]], [11, [[0, 1, 1], [0, 2, 1], [2, 3, 9]]]],
["negative edge and self-loop", [3, [[2, 1, -2], [1, 0, 4], [0, 0, -99]]], [2, [[1, 2, -2], [0, 1, 4]]]],
["disconnected", [3, [[0, 1, 1]]], null],
["empty graph", [0, []], [0, []]],
["generated weighted graph 1", [1, []], [0, []]],
["generated weighted graph 2", [2, [[0, 1, -3]]], [-3, [[0, 1, -3]]]],
["generated weighted graph 3", [3, [[0, 1, 5], [0, 2, -2]]], [3, [[0, 2, -2], [0, 1, 5]]]],
["generated weighted graph 4", [4, [[1, 2, 4]]], null],
["generated weighted graph 5", [5, [[1, 2, 2], [1, 4, -1], [2, 3, 7]]], null],
["generated weighted graph 6", [6, [[0, 1, 1], [0, 2, 3], [0, 4, 5], [2, 3, 2], [2, 4, 5], [3, 4, 0], [3, 5, -2], [4, 5, 4]]], [4, [[3, 5, -2], [3, 4, 0], [0, 1, 1], [2, 3, 2], [0, 2, 3]]]],
["generated weighted graph 7", [7, [[0, 1, 0], [0, 4, 6], [1, 3, 3], [1, 4, 3], [1, 5, 6], [1, 6, 3], [2, 3, 5], [3, 4, -2], [4, 5, -1], [5, 6, 7]]], [8, [[3, 4, -2], [4, 5, -1], [0, 1, 0], [1, 3, 3], [1, 6, 3], [2, 3, 5]]]],
["generated weighted graph 8", [8, [[0, 2, 7], [0, 3, 5], [0, 4, 2], [0, 5, 3], [1, 2, 4], [1, 7, 7], [2, 4, 4], [2, 5, 7], [3, 4, 2], [4, 6, 4], [5, 6, 2], [5, 7, 5]]], [22, [[0, 4, 2], [3, 4, 2], [5, 6, 2], [0, 5, 3], [1, 2, 4], [2, 4, 4], [5, 7, 5]]]],
["generated weighted graph 9", [9, [[0, 1, -2], [0, 3, 3], [0, 4, 4], [0, 8, 4], [1, 4, 1], [1, 6, 4], [1, 8, 2], [2, 7, -1], [3, 6, 6], [3, 8, 2], [4, 5, 6], [4, 8, 0], [5, 6, 6], [5, 7, 6], [5, 8, 7]]], [16, [[0, 1, -2], [2, 7, -1], [4, 8, 0], [1, 4, 1], [3, 8, 2], [1, 6, 4], [4, 5, 6], [5, 7, 6]]]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [2, [[0, 2, 4]]]]];
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
