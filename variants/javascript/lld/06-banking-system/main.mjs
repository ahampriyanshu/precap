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
    await test("account amounts overdrafts and independent state",()=>{const a=new exercise.BalanceAccount();equal(a.deposit(20),20);equal(a.withdraw(21),false);equal(a.withdraw(5),true);equal(a.balance(),15);for(const n of [0,-1,true,1.2,Infinity])expectError(()=>a.deposit(n));equal(a.balance(),15);equal(new exercise.BalanceAccount().balance(),0);});
  } else {
    await test("transfer conservation original replay result and conflicts",()=>{const b=new exercise.Bank();equal(b.createAccount("a"),true);equal(b.createAccount("a"),false);b.createAccount("b");b.deposit("a",100);equal(b.transfer("r","a","b",30),[70,30]);b.deposit("a",9);const replay=b.transfer("r","a","b",30);equal(replay,[70,30]);replay[0]=999;equal(b.transfer("r","a","b",30),[70,30]);equal(b.balance("a")+b.balance("b"),109);expectError(()=>b.transfer("r","a","b",31));equal(b.balance("b"),30);});
    await test("failed IDs retry and validation precedence",()=>{const b=new exercise.Bank();b.createAccount("a");b.createAccount("b");equal(b.transfer("r","a","b",1),null);b.deposit("a",1);equal(b.transfer("r","a","b",1),[0,1]);expectError(()=>b.deposit("missing",0));expectError(()=>b.transfer("new","missing","also",true));equal(b.balance("missing"),null);});
    await test("spending ranking ties limits and detached results",()=>{const b=new exercise.Bank();b.createAccount("b");b.createAccount("a");equal(b.topSpenders(9),[["a",0],["b",0]]);const view=b.topSpenders(9);view[0][1]=99;view.length=0;equal(b.topSpenders(9),[["a",0],["b",0]]);equal(b.topSpenders(0),[]);expectError(()=>b.topSpenders(-1));equal(new exercise.Bank().balance("a"),null);});
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
