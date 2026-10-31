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
    await test("ASCII tokens case digits non-ASCII separators and duplicates",()=>{equal(exercise.tokenize("A-a 22 café 中文"),["a","a","22","caf"]);equal(exercise.tokenize("!!!"),[]);const t=exercise.tokenize("x");t.length=0;equal(exercise.tokenize("x"),["x"]);});
  } else {
    await test("term ranking phrase overlap and exact stored text",()=>{const s=new exercise.SearchEngine();s.add("b","A a a");s.add("a","a a");s.add("empty","");equal(s.search("A"),[["b",3],["a",2]]);equal(s.searchPhrase("a a"),[["b",2],["a",1]]);equal(s.get("b"),"A a a");equal(s.stats(),[3,5]);});
    await test("updates deletion duplicates and identifier reuse remove stale matches",()=>{const s=new exercise.SearchEngine();equal(s.add("x","old old"),true);equal(s.add("x","new"),false);equal(s.update("x","new"),true);equal(s.search("old"),[]);equal(s.search("new"),[["x",1]]);equal(s.delete("x"),true);equal(s.delete("x"),false);s.add("x","reuse");equal(s.search("new"),[]);equal(s.stats(),[1,1]);equal(s.update("missing","x"),false);});
    await test("query validation zero limits nested snapshots and independent instances",()=>{const s=new exercise.SearchEngine();s.add("x","a");expectError(()=>s.search("a b",0));expectError(()=>s.search("",0));for(const n of [-1,true,1.2,NaN])expectError(()=>s.search("a",n));equal(s.searchPhrase("!!!"),[]);equal(s.search("a",0),[]);const view=s.search("a");view[0][1]=99;equal(s.search("a"),[["x",1]]);equal(new exercise.SearchEngine().stats(),[0,0]);});
    await test("default limit and deterministic lexical ties",()=>{const s=new exercise.SearchEngine();for(let i=11;i>=0;i--)s.add(`d${String(i).padStart(2,"0")}`,"word");equal(s.search("word").length,10);equal(s.search("word")[0],["d00",1]);equal(s.searchPhrase("word",2),[["d00",1],["d01",1]]);});
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
