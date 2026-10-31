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
    await test("CRUD empty values special keys and independence",()=>{const s=new exercise.KeyValueStore();equal(s.set("",""),undefined);equal(s.get(""),"");s.set("__proto__","safe");equal(s.get("__proto__"),"safe");equal(s.delete(""),true);equal(s.delete(""),false);equal(s.get(""),null);equal(new exercise.KeyValueStore().get("__proto__"),null);});
  } else {
    await test("inner commit is undone by outer rollback",()=>{const s=new exercise.TransactionalStore();s.set("k","base");equal(s.begin(),1);s.set("k","outer");equal(s.begin(),2);s.set("k","inner");equal(s.commit(),1);equal(s.get("k"),"inner");equal(s.rollback(),0);equal(s.get("k"),"base");});
    await test("deletion hides parent inner rollback and recreation",()=>{const s=new exercise.TransactionalStore();s.set("a","");s.begin();equal(s.delete("a"),true);equal(s.get("a"),null);s.begin();s.set("a","child");s.rollback();equal(s.get("a"),null);s.commit();equal(s.get("a"),null);s.set("a","new");equal(s.get("a"),"new");});
    await test("prefix lexical snapshots empty boundary errors and isolation",()=>{const s=new exercise.TransactionalStore();s.set("z","1");s.set("a","2");s.set("ab","3");equal(s.snapshot("a"),{a:"2",ab:"3"});const view=s.snapshot();view.a="bad";delete view.z;equal(s.snapshot(),{a:"2",ab:"3",z:"1"});expectError(()=>s.commit());expectError(()=>s.rollback());equal(s.depth(),0);equal(new exercise.TransactionalStore().snapshot(),{});});
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
