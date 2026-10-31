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
["first maximum wins", [[8n, 2n, 8n]], [18n, 0]],
["empty input", [[]], [0n, null]],
["one zero", [[0n]], [0n, 0]],
["unbounded integer arithmetic", [[1000000000000000000000000000000n, 1n]], [1000000000000000000000000000001n, 0]],
["generated length 2", [[2n, 6n]], [8n, 1]],
["generated length 3", [[10n, 11n, 15n]], [36n, 2]],
["generated length 4", [[21n, 28n, 6n, 24n]], [79n, 1]],
["generated length 5", [[14n, 21n, 9n, 27n, 17n]], [88n, 3]],
["generated length 6", [[13n, 9n, 3n, 23n, 19n, 7n]], [74n, 3]],
["generated length 7", [[27n, 23n, 9n, 16n, 20n, 5n, 9n]], [109n, 0]],
["generated length 8", [[21n, 22n, 28n, 29n, 22n, 29n, 3n, 16n]], [170n, 3]],
["generated length 9", [[7n, 15n, 15n, 28n, 25n, 26n, 0n, 28n, 23n]], [167n, 3]],
["generated length 10", [[20n, 29n, 22n, 16n, 9n, 24n, 5n, 28n, 28n, 23n]], [204n, 1]],
["generated length 11", [[28n, 19n, 19n, 2n, 18n, 13n, 13n, 4n, 24n, 26n, 20n]], [186n, 0]],
["generated length 12", [[16n, 11n, 6n, 5n, 0n, 5n, 20n, 11n, 6n, 20n, 28n, 12n]], [140n, 10]],
["generated length 13", [[14n, 2n, 12n, 23n, 10n, 28n, 15n, 23n, 14n, 5n, 11n, 0n, 11n]], [168n, 5]],
["generated length 14", [[25n, 25n, 18n, 5n, 17n, 25n, 5n, 4n, 12n, 3n, 12n, 29n, 27n, 26n]], [233n, 11]],
["generated length 15", [[29n, 20n, 3n, 18n, 18n, 23n, 0n, 15n, 24n, 25n, 25n, 28n, 27n, 6n, 4n]], [265n, 0]],
["generated length 16", [[27n, 17n, 6n, 7n, 9n, 16n, 28n, 15n, 7n, 27n, 13n, 16n, 9n, 6n, 15n, 13n]], [231n, 6]],
["generated length 17", [[2n, 4n, 0n, 5n, 26n, 22n, 3n, 12n, 12n, 18n, 18n, 3n, 4n, 1n, 21n, 4n, 25n]], [180n, 4]],
["generated length 18", [[8n, 0n, 29n, 2n, 28n, 8n, 0n, 24n, 1n, 8n, 13n, 2n, 26n, 5n, 6n, 20n, 16n, 2n]], [198n, 2]],
["generated length 19", [[29n, 6n, 10n, 9n, 0n, 8n, 4n, 27n, 16n, 0n, 19n, 3n, 8n, 16n, 8n, 16n, 17n, 13n, 13n]], [222n, 0]]
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
