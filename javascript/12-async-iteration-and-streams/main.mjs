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

await test("await promised values in order",async()=>{const out=[];for await(const value of e.fromIterable([Promise.resolve(1),2]))out.push(value);equal(out,[1,2]);});
await test("identity and empty input",async()=>{const value={},out=[];for await(const item of e.fromIterable([value]))out.push(item);if(out[0]!==value)throw new Error("Preserve identity");const empty=[];for await(const item of e.fromIterable([]))empty.push(item);equal(empty,[]);});

  } else {

await test("full and partial batches",async()=>{const out=[];for await(const batch of e.batchStream([1,2,3,4,5],2))out.push(batch);equal(out,[[1,2],[3,4],[5]]);out[0].push(99);equal(out[1],[3,4]);});
await test("backpressure and consumer cleanup",async()=>{let reads=0,closed=0;async function* source(){try{for(let i=0;i<10;i++){reads++;yield i;}}finally{closed++;}}const iterator=e.batchStream(source(),2);equal((await iterator.next()).value,[0,1]);equal(reads,2);await iterator.return();equal(reads,2);equal(closed,1);});
await test("failure does not flush partial work",async()=>{const failure=new Error("source");async function* source(){yield 1;throw failure;}const out=[];let caught;try{for await(const batch of e.batchStream(source(),2))out.push(batch);}catch(error){caught=error;}equal(out,[]);if(caught!==failure)throw new Error("Propagate source error");let invalid;try{for await(const batch of e.batchStream([],0)){} }catch(error){invalid=error;}if(!(invalid instanceof RangeError))throw new Error("Invalid batch size");});

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
