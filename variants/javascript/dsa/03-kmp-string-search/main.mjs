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
["overlapping matches", ["ababa", "aba"], [0, 2]],
["repeated prefix", ["aaaaa", "aa"], [0, 1, 2, 3]],
["all boundaries", ["abc", ""], [0, 1, 2, 3]],
["empty text", ["", "x"], []],
["unicode indices", ["ééé", "éé"], [0, 1]],
["generated transcript 0", ["aaaab", "bab"], []],
["generated transcript 1", ["abaaab", "abb"], []],
["generated transcript 2", ["babaaaa", "aab"], []],
["generated transcript 3", ["bbbaabab", "bba"], [1]],
["generated transcript 4", ["bbbbbabba", "aab"], []],
["generated transcript 5", ["bbaaabbaab", "baa"], [1, 6]],
["generated transcript 6", ["aaababaabbb", "abb"], [7]],
["generated transcript 7", ["abaabaabbbab", "bba"], [8]],
["generated transcript 8", ["babaaabbbbaba", "bba"], [8]],
["generated transcript 9", ["bbaabbaaaabbbb", "aaa"], [6, 7]],
["generated transcript 10", ["bbbaaabbaabaaab", "aaa"], [3, 11]],
["generated transcript 11", ["baabaaabaabaaabb", "bba"], []],
["generated transcript 12", ["abbabbababbaababa", "bbb"], []],
["generated transcript 13", ["baabbbbbaaabaaaaab", "aaa"], [8, 12, 13, 14]],
["generated transcript 14", ["bbbabbbbaaaabbaabaa", "abb"], [3, 11]],
["generated transcript 15", ["bbabbbabaaaababaabba", "aaa"], [8, 9]],
["generated transcript 16", ["ababaaabbbbbbaaabbbbb", "aaa"], [4, 13]],
["generated transcript 17", ["abbbabbbbaabbaababbbab", "abb"], [0, 4, 10, 16]]
];
  if (stage === "final") cases.push(...[
["long repeated prefix", ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"], [260]]
]);
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  await test("astral symbols use code-point positions", () => equal(fn("😀a😀", "😀"), [0,2]));
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
