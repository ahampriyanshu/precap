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
["terminal and duplicate", [["cold", "colder", "coal", "cold"], "co", 3], ["coal", "cold", "colder"]],
["empty word and case", [["", "A", "a"], "", 9], ["", "A", "a"]],
["empty word list", [[], "x", 2], []],
["zero limit", [["a"], "a", 0], []],
["prefix='' limit=1", [["caa", "a", "cabb", "ac", "ccb", "bbb", "cb", "baab", "c", "c", "", "", "bcba", "bbaa", "aa", "a", "ab", "cab", "a", "ccc"], "", 1], [""]],
["prefix='' limit=3", [["aab", "aaa", "a", "bca", "ccac", "c", "c", "", "caaa", "", "acb", "", "bcaa", "cb", "aa", "a", "cca", "", "", "cbab"], "", 3], ["", "a", "aa"]],
["prefix='' limit=8", [["bb", "", "b", "ccb", "c", "aa", "cac", "", "", "bc", "a", "c", "a", "a", "bbb", "ccca", "ac", "c", "bcc", "bc"], "", 8], ["", "a", "aa", "ac", "b", "bb", "bbb", "bc"]],
["prefix='a' limit=1", [["", "", "bcba", "aa", "", "b", "", "acbc", "bcb", "", "", "b", "bbbb", "aaa", "", "a", "bb", "b", "aac", "bcb"], "a", 1], ["a"]],
["prefix='a' limit=3", [["bbaa", "cba", "", "", "aca", "", "b", "ca", "c", "a", "a", "c", "ca", "acac", "b", "bcb", "abc", "acba", "bba", "bb"], "a", 3], ["a", "abc", "aca"]],
["prefix='a' limit=8", [["aa", "cc", "bc", "abb", "c", "", "", "", "c", "bcaa", "c", "bb", "cbc", "ba", "baba", "aba", "ac", "", "cba", "c"], "a", 8], ["aa", "aba", "abb", "ac"]],
["prefix='ab' limit=1", [["a", "bab", "cac", "baa", "a", "c", "", "bac", "", "ccb", "bccb", "ac", "cb", "bbab", "c", "bb", "", "", "accb", "ab"], "ab", 1], ["ab"]],
["prefix='ab' limit=3", [["cbaa", "", "ba", "ccc", "bc", "aacb", "cbb", "ac", "baba", "a", "cacb", "ccc", "aca", "b", "", "a", "c", "bbc", "baba", ""], "ab", 3], []],
["prefix='ab' limit=8", [["b", "a", "ca", "ba", "cbc", "acaa", "b", "cc", "bbca", "b", "", "baa", "a", "", "c", "", "c", "c", "bab", "c"], "ab", 8], []],
["prefix='z' limit=1", [["a", "ccb", "cbb", "cb", "a", "", "bb", "cc", "", "cca", "cbbb", "", "acba", "cab", "", "", "", "cc", "bac", "ba"], "z", 1], []],
["prefix='z' limit=3", [["", "bcc", "", "c", "ac", "ac", "aab", "cba", "bbcc", "b", "abac", "ba", "bba", "abcc", "c", "ac", "", "a", "bbcc", "cbb"], "z", 3], []],
["prefix='z' limit=8", [["cab", "c", "a", "ab", "c", "", "", "aabb", "c", "aa", "a", "cac", "cba", "", "", "cb", "ac", "ac", "", ""], "z", 8], []]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  const invalid = [["invalid input", [["a"], "", -1]]];
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
