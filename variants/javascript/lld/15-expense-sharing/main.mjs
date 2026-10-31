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
    await test("sorted cent remainder zero input ownership and invalid split",()=>{const input=["c","a","b"];equal(exercise.splitEqual(5,input),{a:2,b:2,c:1});equal(exercise.splitEqual(0,input),{a:0,b:0,c:0});equal(input,["c","a","b"]);expectError(()=>exercise.splitEqual(1,["a","a"]));expectError(()=>exercise.splitEqual(1,[]));for(const n of [-1,true,1.5,NaN])expectError(()=>exercise.splitEqual(n,["a"]));});
    await test("numeric-looking names still allocate remainder lexically",()=>{const shares=exercise.splitEqual(1,["2","10"]);equal(shares["10"],1);equal(shares["2"],0);});
  } else {
    await test("cent conservation canonical expense retries and conflicting IDs",()=>{const e=new exercise.ExpenseSharing(["a","b","c"]);equal(e.addExpense("x","a",5,["c","b","a"]),true);equal(e.balances(),{a:3,b:-2,c:-1});equal(e.addExpense("x","a",5,["a","b","c"]),false);expectError(()=>e.addExpense("x","a",6,["a","b","c"]));equal(Object.values(e.balances()).reduce((a,b)=>a+b,0),0);});
    await test("settlement exact replay before balance checks and failed-ID retry",()=>{const e=new exercise.ExpenseSharing(["a","b"]);e.addExpense("x","a",10,["b"]);equal(e.settle("s","b","a",10),true);equal(e.settle("s","b","a",10),false);expectError(()=>e.settle("x","b","a",1));expectError(()=>e.settle("failed","b","a",1));e.addExpense("new","a",2,["b"]);equal(e.settle("failed","b","a",1),true);equal(e.balances(),{a:1,b:-1});});
    await test("deterministic suggestions detached and nonmutating",()=>{const e=new exercise.ExpenseSharing(["d","c","b","a"]);e.addExpense("x","c",6,["a","b"]);e.addExpense("y","d",2,["a"]);const before=e.balances();equal(e.suggestSettlements(),[["a","c",5],["b","c",1],["b","d",2]]);equal(e.balances(),before);const out=e.suggestSettlements();out[0][2]=999;out.length=0;const view=e.balances();view.a=999;equal(e.balances(),before);});
    await test("constructor membership validation and retained input ownership",()=>{expectError(()=>new exercise.ExpenseSharing([]));expectError(()=>new exercise.ExpenseSharing(["a","a"]));const members=["a","b"],e=new exercise.ExpenseSharing(members);members.length=0;expectError(()=>e.addExpense("bad","a",1,["missing"]));expectError(()=>e.settle("bad","a","a",1));expectError(()=>e.addExpense("bad","a",true,["b"]));equal(e.addExpense("bad","a",1,["b"]),true);equal(e.balances(),{a:1,b:-1});equal(new exercise.ExpenseSharing(["a"]).balances(),{a:0});});
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
