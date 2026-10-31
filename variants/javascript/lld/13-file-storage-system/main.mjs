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
    await test("zero-byte catalog duplicates validation and case",()=>{const c=new exercise.FileCatalog();equal(c.upload("x",0),true);equal(c.upload("x",9),false);equal(c.get("x"),0);equal(c.get("X"),null);expectError(()=>c.upload("",1));for(const n of [-1,true,1.5,NaN])expectError(()=>c.upload("y",n));equal(c.get("y"),null);});
  } else {
    await test("quota failure exact expiry reuse and idempotent delete",()=>{const f=new exercise.FileStorage(10);equal(f.upload("x",6,5),true);equal(f.upload("y",5),false);equal(f.usage(),6);f.advanceTo(4);equal(f.get("x"),{name:"x",size:6,expiresAt:5});f.advanceTo(5);equal(f.get("x"),null);equal(f.usage(),0);equal(f.upload("x",10),true);equal(f.delete("x"),true);equal(f.delete("x"),false);equal(f.usage(),0);});
    await test("copy absolute expiry and independent accounting",()=>{const f=new exercise.FileStorage(20);f.upload("a",5,5);f.advanceTo(2);equal(f.copy("a","b"),true);equal(f.get("b"),{name:"b",size:5,expiresAt:5});equal(f.usage(),10);equal(f.copy("a","a"),false);f.delete("a");equal(f.usage(),5);f.advanceTo(5);equal(f.usage(),0);equal(f.get("b"),null);equal(f.copy("b","c"),false);});
    await test("search rank snapshots failed validation and clock atomicity",()=>{const f=new exercise.FileStorage(10);f.upload("b",2);f.upload("a",2);f.upload("A",1);equal(f.search(""),[{name:"a",size:2,expiresAt:null},{name:"b",size:2,expiresAt:null},{name:"A",size:1,expiresAt:null}]);const view=f.search("");view[0].size=99;view.length=0;f.get("a").size=99;equal(f.usage(),5);expectError(()=>f.upload("a",-1,0));f.advanceTo(1);expectError(()=>f.advanceTo(0));expectError(()=>f.copy("missing",""));expectError(()=>f.search("",true));equal(f.usage(),5);equal(new exercise.FileStorage(0).usage(),0);});
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
