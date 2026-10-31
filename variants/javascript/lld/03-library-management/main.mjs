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
  if (stage === "prototype") {
    await test("availability filter case sorting and ownership",()=>{const input=[["b","T",true],["a","T",true],["c","T",false]];equal(exercise.availableCopies(input,"T"),["a","b"]);equal(exercise.availableCopies(input,"t"),[]);equal(input,[["b","T",true],["a","T",true],["c","T",false]]);});
  } else {
    await test("allocation duplicate exhaustion and owner release",()=>{const l=new exercise.Library([["b","T"],["a","T"]]);equal(l.borrow("u","T"),"a");expectError(()=>l.borrow("u","T"));equal(l.borrow("v","T"),"b");equal(l.borrow("w","T"),null);expectError(()=>l.borrow("u","T"));expectError(()=>l.returnCopy("a","v"));equal(l.returnCopy("a","u"),true);equal(l.returnCopy("a","u"),false);equal(l.borrow("u","T"),"a");});
    await test("nested snapshots and constructor ownership",()=>{const input=[["a","T"]];const l=new exercise.Library(input);input[0][1]="bad";l.available("T").length=0;l.borrow("u","T");const view=l.loans();view[0].memberId="bad";view.length=0;equal(l.loans(),[{copyId:"a",title:"T",memberId:"u"}]);equal(new exercise.Library([]).loans(),[]);});
    await test("invalid IDs inventory and case identity",()=>{expectError(()=>new exercise.Library([["a","T"],["a","X"]]));const l=new exercise.Library([["a","T"]]);expectError(()=>l.borrow("","T"));expectError(()=>l.returnCopy("a",""));equal(l.available("t"),[]);equal(l.available("T"),["a"]);});
  }
  return {checks, duration: (performance.now() - started) / 1000, methods: checks.length, skipped: 0, passed: checks.length > 0 && checks.every(check => check.status === "passed")};
}
if (typeof process !== "undefined" && process.versions?.node && process.argv[1]?.endsWith("main.mjs")) {
  const index = process.argv.indexOf("--stage");
  const stage = index < 0 ? "final" : process.argv[index + 1];
  try {
    if (!["prototype","final"].includes(stage)) throw new RangeError("Expected --stage prototype|final");
    const report = await runTests(await import("./exercise.mjs"), stage);
    for (const check of report.checks) console.log(`${check.status.toUpperCase()} ${check.name}${check.detail ? "\n" + check.detail : ""}`);
    console.log(`${report.checks.filter(c => c.status === "passed").length}/${report.methods} checks passed`);
    process.exitCode = report.passed ? 0 : 1;
  } catch (error) { console.error(error); process.exitCode = 1; }
}
