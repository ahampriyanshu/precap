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
    await test("change exact payment zero and invalid amounts",()=>{equal(exercise.changeDue(100,150),50);equal(exercise.changeDue(0,0),0);for(const v of [-1,true,1.5,NaN,Infinity])expectError(()=>exercise.changeDue(v,5));expectError(()=>exercise.changeDue(5,4));});
  } else {
    await test("purchase credit stock change and sold out",()=>{const m=new exercise.VendingMachine([["x",100,1]]);equal(m.insert(50),50);equal(m.insert(100),150);equal(m.select("x"),{code:"x",change:50});equal(m.balance(),0);equal(m.inventory().x,{price:100,stock:0});expectError(()=>m.select("x"));});
    await test("failed selection retains money inventory and refunds once",()=>{const m=new exercise.VendingMachine([["x",100,1]]);m.insert(50);expectError(()=>m.select("missing"));expectError(()=>m.select("x"));equal(m.balance(),50);equal(m.inventory().x.stock,1);equal(m.refund(),50);equal(m.refund(),0);});
    await test("catalog validation nested copies and special identifiers",()=>{expectError(()=>new exercise.VendingMachine([["x",0,1]]));expectError(()=>new exercise.VendingMachine([["x",1,1],["x",1,2]]));const input=[["__proto__",1,2]];const m=new exercise.VendingMachine(input);input[0][2]=0;const view=m.inventory();view.__proto__.stock=0;equal(m.inventory().__proto__.stock,2);for(const n of [0,true,1.5,NaN])expectError(()=>m.insert(n));equal(m.balance(),0);equal(new exercise.VendingMachine([]).refund(),0);});
    await test("bounded money conservation",()=>{const m=new exercise.VendingMachine([["x",3,20]]);let returned=0;for(let i=0;i<20;i++){m.insert(5);returned+=m.select("x").change;}equal(100-returned,60);equal(m.inventory().x.stock,0);});
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
