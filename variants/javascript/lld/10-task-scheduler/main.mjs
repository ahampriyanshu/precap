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
    await test("priority ties numeric IDs duplicate names and no reuse",()=>{const q=new exercise.PriorityQueue();equal(q.pop(),null);q.add("low",-1);q.add("same",2);q.add("same",2);equal(q.pop(),[2,"same"]);equal(q.pop(),[3,"same"]);equal(q.pop(),[1,"low"]);equal(q.add("new",0),4);expectError(()=>q.add("bad",true));});
  } else {
    await test("priority quotas failures and token allocation",()=>{const s=new exercise.TaskScheduler();const a=s.addTask("low",1),b=s.addTask("high",2);equal(s.addWorker("w",1),true);equal(s.addWorker("w",99),false);equal(s.dispatch(0,"missing",2),null);equal(s.dispatch(0,"w",2),{id:b,name:"high",priority:2,status:"running",worker:"w",expiresAt:2,token:1});equal(s.dispatch(0,"w",2),null);equal(s.complete(1,b,1),true);equal(s.dispatch(1,"w",2).id,a);});
    await test("exact expiration stale completion and completed metadata",()=>{const s=new exercise.TaskScheduler();const id=s.addTask("a",1);s.addWorker("w",1);const first=s.dispatch(0,"w",3);equal(s.getTask(3,id).status,"pending");const next=s.dispatch(3,"w",2);equal(next.token,2);equal(s.complete(3,id,first.token),false);equal(s.complete(4,id,next.token),true);equal(s.getTask(4,id),{id,name:"a",priority:1,status:"done",worker:null,expiresAt:null,token:null});});
    await test("invalid requests preserve clock and valid failed calls advance",()=>{const s=new exercise.TaskScheduler();const id=s.addTask("a",0);s.addWorker("w",1);s.dispatch(1,"w",2);expectError(()=>s.dispatch(10,"w",0));equal(s.getTask(2,id).status,"running");expectError(()=>s.getTask(1,id));equal(s.dispatch(5,"unknown",1),null);expectError(()=>s.getTask(4,id));});
    await test("numeric ties nested snapshot isolation and independent clocks",()=>{const s=new exercise.TaskScheduler();s.addWorker("a",20);s.addWorker("b",1);for(let i=0;i<12;i++)s.addTask("same",1);for(let i=1;i<=12;i++)equal(s.dispatch(0,"a",5).id,i);const active=s.active(0,"a");active[0].status="bad";active.length=0;equal(s.active(0,"a").length,12);equal(s.active(0,"b"),[]);equal(new exercise.TaskScheduler().getTask(0,1),null);});
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
