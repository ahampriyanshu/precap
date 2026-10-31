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
["order-sensitive boundary", [[1, 2, 3, 4, 5], 3], 6],
["large answer space", [[1000000000000, 1000000000000], 2], 1000000000000],
["empty weights", [[], 1], 0],
["extra days", [[8, 2], 9], 8],
["capacity sample 1", [[6], 2], 6],
["capacity sample 2", [[3, 7], 1], 10],
["capacity sample 3", [[5, 6, 5], 7], 6],
["capacity sample 4", [[3, 8, 6, 1], 1], 18],
["capacity sample 5", [[3, 6, 11, 7, 8], 4], 11],
["capacity sample 6", [[2, 11, 4, 1, 2, 10], 3], 13],
["capacity sample 7", [[3, 11, 6, 11, 3, 3, 10], 4], 14],
["capacity sample 8", [[4, 9, 7, 11, 10, 6, 8, 2], 5], 16],
["capacity sample 9", [[10, 10, 7, 4, 11, 2, 8, 6, 8], 6], 14],
["capacity sample 10", [[11, 3, 7, 7, 5, 5, 7, 3, 7, 11], 6], 12],
["capacity sample 11", [[4, 11, 9, 7, 11, 10, 3, 2, 3, 7, 10], 4], 24],
["capacity sample 12", [[2, 4, 6, 7, 3, 7, 8, 6, 8, 9, 6, 7], 3], 29],
["capacity sample 13", [[7, 10, 11, 7, 1, 5, 6, 9, 4, 2, 6, 4, 5], 4], 21],
["capacity sample 14", [[6, 9, 11, 8, 9, 11, 7, 7, 3, 4, 4, 1, 6, 8], 6], 18],
["capacity sample 15", [[8, 5, 11, 7, 6, 9, 10, 8, 4, 5, 1, 8, 5, 3, 7], 3], 33],
["capacity sample 16", [[7, 6, 5, 11, 6, 10, 7, 9, 3, 2, 6, 5, 3, 2, 2, 1], 7], 16],
["capacity sample 17", [[4, 3, 2, 11, 1, 9, 5, 4, 4, 6, 10, 3, 3, 9, 2, 2, 7], 5], 20]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [[1], 0]], ["invalid input", [[0], 1]]];
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
