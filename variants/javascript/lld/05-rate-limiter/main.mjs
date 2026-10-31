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
    await test("exact expiration boundary duplicates and overfull history",()=>{const recent=[0,1,1];equal(exercise.allowRequest(recent,2,2,2),{allowed:false,history:[1,1]});equal(exercise.allowRequest([0],1,2,2),{allowed:true,history:[2]});equal(recent,[0,1,1]);});
    await test("invalid histories numeric settings and timestamps",()=>{expectError(()=>exercise.allowRequest([2,1],2,5,3));expectError(()=>exercise.allowRequest([4],2,5,3));for(const n of [0,true,1.5,NaN])expectError(()=>exercise.allowRequest([],n,1,0));expectError(()=>exercise.allowRequest([],1,1,-1));});
  } else {
    await test("denials advance clock exact expiry and client independence",()=>{const l=new exercise.SlidingWindowLimiter(1,3);equal(l.allow("a",0),true);equal(l.allow("a",2),false);expectError(()=>l.allow("a",1));equal(l.history("a"),[0]);equal(l.allow("b",0),true);equal(l.allow("a",3),true);equal(l.history("a"),[3]);});
    await test("history snapshots passive reads and separate instances",()=>{const l=new exercise.SlidingWindowLimiter(2,5);l.allow("a",1);l.allow("b",100);equal(l.history("a"),[1]);l.history("a").length=0;equal(l.history("a"),[1]);equal(l.history("new"),[]);equal(new exercise.SlidingWindowLimiter(1,1).history("a"),[]);});
    await test("invalid settings requests preserve history and time",()=>{expectError(()=>new exercise.SlidingWindowLimiter(0,1));const l=new exercise.SlidingWindowLimiter(1,1);expectError(()=>l.allow("",5));equal(l.allow("a",0),true);expectError(()=>l.allow("a",true));expectError(()=>l.allow("a",-1));equal(l.history("a"),[0]);});
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
