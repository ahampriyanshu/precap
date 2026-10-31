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

await test("pre-abort prevents work",async()=>{const controller=new AbortController(),reason=new Error("stop");controller.abort(reason);let called=false,caught;try{await e.runWithSignal(()=>{called=true;},controller.signal);}catch(error){caught=error;}if(caught!==reason||called)throw new Error("Respect pre-abort");});
await test("pass signal and await result",async()=>{const controller=new AbortController();equal(await e.runWithSignal(async signal=>{if(signal!==controller.signal)throw new Error();await Promise.resolve();return 3;},controller.signal),3);});

  } else {

function deferred(){let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve};}
function checkpoint(){return new Promise(resolve=>{const {port1,port2}=new MessageChannel();port1.onmessage=()=>{port1.close();port2.close();resolve();};port2.postMessage(null);});}
function waitForStart(signal,result){return Promise.race([signal.promise,result.then(()=>{throw new Error("Batch settled before expected work started");})]);}
await test("bounded calls and stable output order use explicit start barriers",async()=>{
  let active=0,max=0;const items=[0,1,2,3],started=[],starts=items.map(()=>deferred()),gates=items.map(()=>deferred());
  const result=Promise.resolve(e.mapLimit(items,2,async(value,index)=>{equal(index,value);started.push(value);active++;max=Math.max(max,active);starts[value].resolve();try{await gates[value].promise;return value*2;}finally{active--;}}));
  result.catch(()=>{});
  try{
    await Promise.all([waitForStart(starts[0],result),waitForStart(starts[1],result)]);
    equal(started,[0,1]);equal(active,2);
    gates[1].resolve();await waitForStart(starts[2],result);equal(active,2);
    gates[0].resolve();await waitForStart(starts[3],result);equal(active,2);
    gates[2].resolve();gates[3].resolve();equal(await result,[0,2,4,6]);equal(max,2);equal(active,0);equal(items,[0,1,2,3]);
  }finally{for(const gate of gates)gate.resolve();}
});
await test("failure stops dispatch and drains every started call before rejection",async()=>{
  const failure=new Error("first failure"),laterFailure=new Error("later failure"),starts=[deferred(),deferred()],gates=[deferred(),deferred()],started=[];let settled=false,drained=false;
  const result=Promise.resolve(e.mapLimit([0,1,2],2,async value=>{started.push(value);if(value>1)return value;starts[value].resolve();await gates[value].promise;if(value===0)throw failure;drained=true;throw laterFailure;}));
  const observed=result.then(value=>{settled=true;return value;},error=>{settled=true;if(!drained)throw new Error("Rejected before active work drained");throw error;});observed.catch(()=>{});
  try{
    await Promise.all(starts.map(start=>waitForStart(start,observed)));
    gates[0].resolve();await checkpoint();equal(started,[0,1]);equal(settled,false);
    gates[1].resolve();let rejected=false;try{await observed;}catch(error){rejected=true;if(error!==failure)throw new Error("Preserve first observed failure identity");}if(!rejected)throw new Error("Failed batch must reject");
    equal(drained,true);equal(started,[0,1]);
  }finally{for(const gate of gates)gate.resolve();}
});
await test("mid-flight abort stops pending dispatch and waits for two active calls to drain",async()=>{
  const controller=new AbortController(),reason=new Error("exact abort reason"),starts=[deferred(),deferred()],finished=[deferred(),deferred()],gates=[deferred(),deferred()],started=[];let settled=false,completed=0;
  const result=Promise.resolve(e.mapLimit([0,1,2,3],2,async(value,index,signal)=>{if(signal!==controller.signal)throw new Error("Pass the exact signal");equal(index,value);started.push(value);if(value>1)return value;starts[value].resolve();await gates[value].promise;completed++;finished[value].resolve();return value;},{signal:controller.signal}));
  const observed=result.then(value=>{settled=true;return value;},error=>{settled=true;if(completed!==2)throw new Error("Abort rejected before draining both active calls");throw error;});observed.catch(()=>{});
  try{
    await Promise.all(starts.map(start=>waitForStart(start,observed)));
    controller.abort(reason);await checkpoint();equal(started,[0,1]);equal(settled,false);
    gates[0].resolve();await finished[0].promise;await checkpoint();equal(started,[0,1]);equal(settled,false);
    gates[1].resolve();let rejected=false;try{await observed;}catch(error){rejected=true;if(error!==reason)throw new Error("Preserve exact abort reason identity");}if(!rejected)throw new Error("Aborted batch must reject");
    equal(completed,2);equal(started,[0,1]);
  }finally{for(const gate of gates)gate.resolve();}
});
await test("empty invalid and pre-aborted admission must reject when required",async()=>{
  equal(await e.mapLimit([],2,x=>x),[]);
  for(const limit of [0,-1,true,1.5,NaN,Infinity]){let rejected=false;try{await e.mapLimit([1],limit,x=>x);}catch(error){rejected=true;if(!(error instanceof RangeError))throw new Error("Invalid concurrency must reject with RangeError");}if(!rejected)throw new Error("Invalid concurrency must reject");}
  const controller=new AbortController(),reason={kind:"pre-aborted"};controller.abort(reason);let calls=0,rejected=false;
  try{await e.mapLimit([1],1,()=>{calls++;},{signal:controller.signal});}catch(error){rejected=true;if(error!==reason)throw new Error("Preserve exact pre-abort reason");}
  if(!rejected)throw new Error("Pre-aborted batch must reject");equal(calls,0);
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
