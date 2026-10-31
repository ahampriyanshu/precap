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

await test("falsy thrown values are failures",()=>{let caught=false;try{e.withResource({close(){}},()=>{throw undefined;});}catch(error){caught=true;equal(error,undefined);}if(!caught)throw new Error("Must propagate thrown undefined");});
await test("return after cleanup",()=>{const events=[],resource={close(){events.push("close");}};equal(e.withResource(resource,r=>{if(r!==resource)throw new Error();events.push("body");return 7;}),7);equal(events,["body","close"]);});
await test("body and cleanup failures preserve both",()=>{const a=new Error("body"),b=new Error("close");let caught;try{e.withResource({close(){throw b;}},()=>{throw a;});}catch(error){caught=error;}if(!(caught instanceof AggregateError))throw new Error("Preserve both failures");if(caught.errors.length!==2||caught.errors[0]!==a||caught.errors[1]!==b)throw new Error("Preserve exact error identities and order");});
await test("one failure retains identity",()=>{const failure=new Error();let caught;try{e.withResource({close(){}},()=>{throw failure;});}catch(error){caught=error;}if(caught!==failure)throw new Error("Preserve original error");});

  } else {

await test("falsy asynchronous failures retain order",async()=>{let caught=false;try{await e.usingResource(async()=>({async close(){throw 0;}}),async()=>{throw undefined;});}catch(error){caught=true;if(!(error instanceof AggregateError))throw new Error("Preserve both thrown values");equal(error.errors,[undefined,0]);}if(!caught)throw new Error("Must reject");});
await test("asynchronous ordering and result",async()=>{const events=[];const result=await e.usingResource(async()=>{events.push("open");return {async close(){events.push("close");}};},async()=>{await Promise.resolve();events.push("body");return 9;});equal(result,9);equal(events,["open","body","close"]);});
await test("unresolved cleanup delays both successful and failed body outcomes",async()=>{
  const checkpoint=()=>new Promise(resolve=>{const {port1,port2}=new MessageChannel();port1.onmessage=()=>{port1.close();port2.close();resolve();};port2.postMessage(null);});
  for(const bodyFails of [false,true]){
    let enterClose,releaseClose,closed=false,settled=false,closeCalls=0;
    const closeStarted=new Promise(resolve=>enterClose=resolve),closeGate=new Promise(resolve=>releaseClose=resolve),failure=new Error("body identity");
    const result=Promise.resolve(e.usingResource(async()=>({async close(){closeCalls++;enterClose();await closeGate;closed=true;}}),async()=>{if(bodyFails)throw failure;return 9;}));
    const observed=result.then(value=>{settled=true;if(!closed)throw new Error("Resolved before cleanup finished");return value;},error=>{settled=true;if(!closed)throw new Error("Rejected before cleanup finished");throw error;});
    observed.catch(()=>{});
    try{
      await Promise.race([closeStarted,observed.then(()=>{throw new Error("Cleanup was never invoked");})]);
      await checkpoint();
      equal(closeCalls,1);equal(closed,false);equal(settled,false);
      releaseClose();
      if(bodyFails){let rejected=false;try{await observed;}catch(error){rejected=true;if(error!==failure)throw new Error("Preserve original body error after cleanup");}if(!rejected)throw new Error("Failed body must reject");}
      else equal(await observed,9);
      equal(closed,true);equal(settled,true);equal(closeCalls,1);
    }finally{releaseClose();}
  }
});
await test("failed acquisition owns no resource",async()=>{const failure=new Error("open");let called=false,caught;try{await e.usingResource(async()=>{throw failure;},()=>{called=true;});}catch(error){caught=error;}if(caught!==failure||called)throw new Error("Acquisition boundary violated");});
await test("dual asynchronous failures",async()=>{const a=new Error("body"),b=new Error("close");let caught;try{await e.usingResource(async()=>({async close(){throw b;}}),async()=>{throw a;});}catch(error){caught=error;}if(!(caught instanceof AggregateError))throw new Error();if(caught.errors.length!==2||caught.errors[0]!==a||caught.errors[1]!==b)throw new Error("Preserve exact error identities and order");});

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
