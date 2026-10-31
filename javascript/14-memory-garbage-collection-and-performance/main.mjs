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
  const e = exercise;
  if(stage === "prototype") {

await test("capacity and ownership",()=>{const item={},values=[1,item,3],copy=e.retainRecent(values,2);equal(copy.length,2);if(copy[0]!==item)throw new Error("Preserve identity");copy.pop();equal(values.length,3);equal(e.retainRecent(values,0),[]);equal(e.retainRecent([],3),[]);});
await test("invalid limits",()=>{for(const limit of [-1,1.5,NaN,true])expectError(()=>e.retainRecent([],limit));});

  } else {

await test("registration identity and idempotent unsubscribe",()=>{const hub=new e.EventHub(),seen=[],fn=x=>seen.push(x),off=hub.subscribe(fn);hub.subscribe(fn);equal(hub.size(),2);off();off();hub.publish(4);equal(seen,[4]);equal(hub.size(),1);});
await test("snapshot lifecycle during publish",()=>{const hub=new e.EventHub(),seen=[];let offB;hub.subscribe(()=>{seen.push("a");offB();hub.subscribe(()=>seen.push("new"));});offB=hub.subscribe(()=>seen.push("b"));hub.publish();equal(seen,["a","b"]);seen.length=0;hub.publish();equal(seen,["a","new"]);});
await test("listener failures do not starve peers",()=>{const hub=new e.EventHub(),failure=new Error("listener"),seen=[];hub.subscribe(()=>{throw failure;});hub.subscribe(()=>seen.push("ok"));let caught;try{hub.publish();}catch(error){caught=error;}if(!(caught instanceof AggregateError)||caught.errors[0]!==failure)throw new Error("Aggregate exact failures");equal(seen,["ok"]);});
await test("dispose releases and invalidates",()=>{const hub=new e.EventHub();hub.subscribe(()=>{throw new Error("must not run");});hub.dispose();hub.dispose();equal(hub.size(),0);hub.publish();expectError(()=>hub.subscribe(()=>{}),Error);equal(new e.EventHub().size(),0);});
await test("dispose during publish preserves the entire current snapshot and its failures",()=>{
  const hub=new e.EventHub(),seen=[],first=new Error("first"),second=new Error("second");
  hub.subscribe(()=>{seen.push("a");hub.dispose();throw first;});
  hub.subscribe(()=>{seen.push("b");expectError(()=>hub.subscribe(()=>{}),Error);throw second;});
  hub.subscribe(()=>seen.push("c"));
  let caught;try{hub.publish("current");}catch(error){caught=error;}
  if(!(caught instanceof AggregateError)||caught.errors.length!==2||caught.errors[0]!==first||caught.errors[1]!==second)throw new Error("Aggregate exact current-snapshot failures after dispose");
  equal(seen,["a","b","c"]);equal(hub.size(),0);hub.publish("later");equal(seen,["a","b","c"]);hub.dispose();
});

  }
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
