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
    await test("touch existing new empty and input isolation",()=>{const keys=["a","b"];equal(exercise.touchOrder(keys,"a"),["b","a"]);equal(exercise.touchOrder(keys,"c"),["a","b","c"]);equal(exercise.touchOrder([],"x"),["x"]);equal(keys,["a","b"]);});
  } else {
    await test("read update recency and eviction",()=>{const c=new exercise.LRUCache(2);equal(c.put("a",1),undefined);c.put("b",2);equal(c.get("a"),1);c.put("c",3);equal(c.items(),[["a",1],["c",3]]);c.put("a",9);equal(c.items(),[["c",3],["a",9]]);});
    await test("miss fallback identity delete and zero capacity",()=>{const c=new exercise.LRUCache(1),marker={};equal(c.get("missing",marker)===marker,true);c.put("a",-1);equal(c.delete("a"),true);equal(c.delete("a"),false);const z=new exercise.LRUCache(0);z.put("a",1);equal(z.items(),[]);});
    await test("validation preserves order values and snapshots detach",()=>{for(const n of [-1,true,1.2,Infinity])expectError(()=>new exercise.LRUCache(n));const c=new exercise.LRUCache(2);c.put("a",1);c.put("b",2);expectError(()=>c.put("a",NaN));expectError(()=>c.get(""));equal(c.items(),[["a",1],["b",2]]);const view=c.items();view[0][1]=9;view.length=0;equal(c.items(),[["a",1],["b",2]]);equal(new exercise.LRUCache(2).items(),[]);});
    await test("bounded recency cycles",()=>{const c=new exercise.LRUCache(3);for(let i=0;i<80;i++)c.put(`k${i%5}`,i);equal(c.items(),[["k2",77],["k3",78],["k4",79]]);});
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
