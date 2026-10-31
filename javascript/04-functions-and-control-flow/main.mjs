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

await test("callback count and order",()=>{const seen=[];equal(e.sumSelected([3,4,5],(value,index)=>{seen.push([value,index]);return value%2===1;}),8);equal(seen,[[3,0],[4,1],[5,2]]);equal(e.sumSelected([],()=>true),0);});
await test("a thrown callback stops later work",()=>{const seen=[];expectError(()=>e.sumSelected([1,2,3],x=>{seen.push(x);if(x===2)throw new TypeError("stop");return true;}),TypeError);equal(seen,[1,2]);});

  } else {

await test("stable groups and item identity",()=>{const a={kind:"b"},b={kind:"a"},c={kind:"b"},items=[a,b,c],seen=[];const groups=e.groupBy(items,(x,i)=>{seen.push(i);return x.kind;});if(!(groups instanceof Map))throw new Error("Return a Map");equal([...groups.keys()],["b","a"]);if(groups.get("b")[0]!==a||groups.get("b")[1]!==c)throw new Error("Preserve original item identity");groups.get("b").pop();equal(items.length,3);equal(seen,[0,1,2]);});
await test("empty and failure",()=>{equal(e.groupBy([],x=>x).size,0);const seen=[];expectError(()=>e.groupBy([1,2,3],x=>{seen.push(x);if(x===2)throw new TypeError();return x;}),TypeError);equal(seen,[1,2]);});

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
