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
["ties and empty sequence", [[[], [1, 4], [1, 2, 8]]], [1, 1, 2, 4, 8]],
["no sequences", [[]], []],
["all empty", [[[], []]], []],
["1 feeds", [[[-8, 14, 16]]], [-8, 14, 16]],
["2 feeds", [[[-9, -8, -7, -6], []]], [-9, -8, -7, -6]],
["3 feeds", [[[-5, 0, 4, 14], [-7, -5, -3, -2, -1, 6, 15], [1, 3, 5, 6, 16, 18]]], [-7, -5, -5, -3, -2, -1, 0, 1, 3, 4, 5, 6, 6, 14, 15, 16, 18]],
["4 feeds", [[[-10, -7, 4, 5, 9, 10, 18], [], [-1, -1, -1, 9, 16, 18], [-8, 0, 14, 18]]], [-10, -8, -7, -1, -1, -1, 0, 4, 5, 9, 9, 10, 14, 16, 18, 18, 18]],
["5 feeds", [[[-7, 16, 17], [], [13], [-1, 0], [2, 17]]], [-7, -1, 0, 2, 13, 16, 17, 17]],
["6 feeds", [[[-9], [3], [-5, -4, 4], [-3], [-10, -9, 12], [-10, -7, -6, -2, 1, 14]]], [-10, -10, -9, -9, -7, -6, -5, -4, -3, -2, 1, 3, 4, 12, 14]],
["7 feeds", [[[0, 4, 5, 19], [1, 8], [-10, -1, 5, 5, 7, 15, 17], [16], [0, 0, 5, 17], [-7], [-4, 0, 1, 2, 7, 19]]], [-10, -7, -4, -1, 0, 0, 0, 0, 1, 1, 2, 4, 5, 5, 5, 5, 7, 7, 8, 15, 16, 17, 17, 19, 19]],
["8 feeds", [[[5, 16, 16, 17], [-5, 9, 11], [-2, 2, 18, 19], [-10, -6, 11, 15, 15, 19], [-3, -1, 6, 10], [-9, -3, 4, 4, 10, 12], [-8, -2, 10, 16], [6]]], [-10, -9, -8, -6, -5, -3, -3, -2, -2, -1, 2, 4, 4, 5, 6, 6, 9, 10, 10, 10, 11, 11, 12, 15, 15, 16, 16, 16, 17, 18, 19, 19]],
["9 feeds", [[[17], [-9, -8, -1, 4, 8, 12], [-10, -8, 0, 5, 18, 19], [7, 8, 12], [-7, -7, -1, 10, 11, 15, 17], [0, 4, 8, 10, 11, 16, 18], [-10, -1, 17], [-10, -10, 13], [-4, -3, -1, 11, 13]]], [-10, -10, -10, -10, -9, -8, -8, -7, -7, -4, -3, -1, -1, -1, -1, 0, 0, 4, 4, 5, 7, 8, 8, 8, 10, 10, 11, 11, 11, 12, 12, 13, 13, 15, 16, 17, 17, 17, 18, 18, 19]],
["10 feeds", [[[7, 10, 17], [-4, -2, 6, 11, 15], [-9, -7, 4, 4, 5, 12, 12], [-2], [-8, 10], [4, 8, 19], [-9, -8, -6, -3, -1, 0], [-8, -5, 5, 6, 8, 13], [-10, -6, -2, -2, 4, 15, 16], [-3, -3, 3, 4, 8]]], [-10, -9, -9, -8, -8, -8, -7, -6, -6, -5, -4, -3, -3, -3, -2, -2, -2, -2, -1, 0, 3, 4, 4, 4, 4, 4, 5, 5, 6, 6, 7, 8, 8, 8, 10, 10, 11, 12, 12, 13, 15, 15, 16, 17, 19]],
["11 feeds", [[[0, 0, 4, 6], [-9, 1, 5, 9, 16], [-4, 0, 4, 7, 13, 16], [-6, -5, -3, 5], [18], [], [-8, 1, 5, 10, 12, 18], [4, 19], [-1, 4, 16], [-6, -3, 1, 15], [-10, -9, -9, -7, 5, 7, 11]]], [-10, -9, -9, -9, -8, -7, -6, -6, -5, -4, -3, -3, -1, 0, 0, 0, 1, 1, 1, 4, 4, 4, 4, 5, 5, 5, 5, 6, 7, 7, 9, 10, 11, 12, 13, 15, 16, 16, 16, 18, 18, 19]],
["12 feeds", [[[-8, -8, -1, 5, 18], [-1, 3, 5, 10], [-9, -7, -2, 0, 1, 13, 14], [-4, 15], [-4, 1, 4, 4, 8, 13], [-9, -2, 4, 11, 17, 18, 19], [-4, 6, 16, 16], [1, 16], [], [], [-9, -7, 2, 7, 8], [-8, 10]]], [-9, -9, -9, -8, -8, -8, -7, -7, -4, -4, -4, -2, -2, -1, -1, 0, 1, 1, 1, 2, 3, 4, 4, 4, 5, 5, 6, 7, 8, 8, 10, 10, 11, 13, 13, 14, 15, 16, 16, 16, 17, 18, 18, 19]],
["13 feeds", [[[], [0, 5, 6, 8, 15], [-7], [-9, -7, -1, 7, 19], [-9, -8, 6, 15], [-5, 2, 3, 10, 14], [-9, -6, -6, 13, 18], [-1, 0, 4, 8, 15, 16], [-10, -4, 3, 15, 17], [-8, 0, 4, 6, 11], [-10, -6, -4], [8], [-10, -6, 11, 17, 17]]], [-10, -10, -10, -9, -9, -9, -8, -8, -7, -7, -6, -6, -6, -6, -5, -4, -4, -1, -1, 0, 0, 0, 2, 3, 3, 4, 4, 5, 6, 6, 6, 7, 8, 8, 8, 10, 11, 11, 13, 14, 15, 15, 15, 15, 16, 17, 17, 17, 18, 19]],
["14 feeds", [[[-2, 1, 11, 13, 13, 14, 18], [-5, 18], [-5], [-10, -2, 0, 5, 11, 13, 14], [-7, 4, 5, 13, 16], [-7, -1, 9, 16], [], [16], [4, 5, 6, 19], [], [-8, 0, 1, 3, 7, 18], [], [6, 10, 10, 13, 16], [-9, -8, -1, 19]]], [-10, -9, -8, -8, -7, -7, -5, -5, -2, -2, -1, -1, 0, 0, 1, 1, 3, 4, 4, 5, 5, 5, 6, 6, 7, 9, 10, 10, 11, 11, 13, 13, 13, 13, 13, 14, 14, 16, 16, 16, 16, 18, 18, 18, 19, 19]],
["15 feeds", [[[-1, 11, 13], [-8, 2, 10], [-10, -4, -1, 2, 6, 8, 9], [4], [-6, -2, 3, 3, 7, 16, 16], [], [-3, 7, 14, 18], [-8, -6, 1, 15, 16, 16], [16], [2, 6, 6, 8, 13, 17], [-5, -4, 10], [-3, -3, 1, 8, 12, 18], [-3, 7, 13, 15, 16], [-9, -9, -2, 0, 1, 3], [-2, 4, 4, 8, 17, 18]]], [-10, -9, -9, -8, -8, -6, -6, -5, -4, -4, -3, -3, -3, -3, -2, -2, -2, -1, -1, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 10, 10, 11, 12, 13, 13, 13, 14, 15, 15, 16, 16, 16, 16, 16, 16, 17, 17, 18, 18, 18]],
["16 feeds", [[[-10, 10, 14], [-9, -6, 11, 17], [2], [-8, -2, 13, 17, 18], [-8, -6, 3, 16], [-9, -6, 9, 9, 12, 15], [-5, 5, 10, 16, 19], [-8, -4, 15, 19], [6, 19], [-2, -1, 8, 11, 16], [], [], [], [-6, -5, -1, -1, 0, 9, 12], [-8, -6, -6], [1]]], [-10, -9, -9, -8, -8, -8, -8, -6, -6, -6, -6, -6, -6, -5, -5, -4, -2, -2, -1, -1, -1, 0, 1, 2, 3, 5, 6, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 18, 19, 19, 19]],
["17 feeds", [[[-10, -9, 3], [-9, -3, -1, 14], [2, 5, 15], [-5, 5], [-7, -3, 16, 18], [13, 19], [-6, 19], [-3, -3, 7, 9, 11, 14], [], [], [-7, 5, 7, 7, 8, 9], [-9, 15], [], [-9, -4, -4, 5, 10, 14, 15], [-1, 1, 9, 9, 9], [-2, -1, 5, 9, 14], [-5, 3]]], [-10, -9, -9, -9, -9, -7, -7, -6, -5, -5, -4, -4, -3, -3, -3, -3, -2, -1, -1, -1, 1, 2, 3, 3, 5, 5, 5, 5, 5, 7, 7, 7, 8, 9, 9, 9, 9, 9, 9, 10, 11, 13, 14, 14, 14, 14, 15, 15, 15, 16, 18, 19, 19]]
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
