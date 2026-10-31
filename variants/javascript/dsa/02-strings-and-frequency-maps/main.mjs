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
["multiplicity beats sets", ["ab", "aaa"], {"a": 2}],
["case and punctuation", ["A-b 2", "BAAA!"], {"a": 2}],
["empty strings", ["", ""], {}],
["unicode letters", ["éÉ", "ééé"], {"é": 1}],
["casefold expansion", ["ß", "SS"], {}],
["generated text 0", ["", " a?A"], {"a": 2}],
["generated text 1", ["C", "A AbB"], {"a": 2, "b": 2}],
["generated text 2", ["!a", "?  ?BB"], {"b": 2}],
["generated text 3", ["c b", "?B abbb"], {"a": 1, "b": 3}],
["generated text 4", ["AAAa", " BBa??AB"], {"b": 3}],
["generated text 5", [" !aca", "??AAbA c?"], {"a": 1, "b": 1}],
["generated text 6", ["bcaaaB", "ABAbcBbAaA"], {"a": 2, "b": 2}],
["generated text 7", ["C!BbA C", "?cbBbbaA ?A"], {"a": 2, "b": 2}],
["generated text 8", ["Cb!aBabA", " b?bb abbba?"], {"b": 3}],
["generated text 9", ["A!cAaC!aC", "ba?aB?Ba?A BB"], {"b": 5}],
["generated text 10", [" cB!cbBB c", " bacAc?? Baaac"], {"a": 5}],
["generated text 11", ["!baBBBabaa!", "  BA?BA cBAaAbA"], {"a": 2, "c": 1}],
["generated text 12", ["bB!bCbAAbbCc", " bAAaABA a  BcBA"], {"a": 5}],
["generated text 13", ["cCc!ba!bcbAcB", "aB?AA  b Babc aaB"], {"a": 4, "b": 1}],
["generated text 14", ["ABAaBaBaBCcCb!", "A ABcB ?A?c?BAc b?"], {}]
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
