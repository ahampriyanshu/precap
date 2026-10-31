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

await test("sequential start and finish",async()=>{const events=[];equal(await e.sequence([async()=>{events.push("a-start");await Promise.resolve();events.push("a-end");return 1;},()=>{events.push("b");return 2;}]),[1,2]);equal(events,["a-start","a-end","b"]);equal(await e.sequence([]),[]);});
await test("failure stops dispatch",async()=>{const failure=new Error("fail");let called=false,caught;try{await e.sequence([()=>{throw failure;},()=>{called=true;}]);}catch(error){caught=error;}if(caught!==failure||called)throw new Error("Do not start later work");});

  } else {

await test("start all but report input order",async()=>{let release;const pending=new Promise(resolve=>release=resolve),started=[];const result=e.allSettledOrdered([()=>{started.push(1);return pending;},()=>{started.push(2);return 2;}]);await Promise.resolve();equal(started,[1,2]);release(1);equal(await result,[{status:"fulfilled",value:1},{status:"fulfilled",value:2}]);});
await test("sync throws, rejections and empty batch",async()=>{const failure=new TypeError("x");const results=await e.allSettledOrdered([()=>{throw failure;},()=>Promise.reject(failure),()=>3]);equal(results[0].status,"rejected");if(results[0].reason!==failure||results[1].reason!==failure)throw new Error("Preserve failure identity");equal(results[2],{status:"fulfilled",value:3});equal(await e.allSettledOrdered([]),[]);});

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
