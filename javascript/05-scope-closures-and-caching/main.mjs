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

await test("independent private state and defaults",()=>{const a=e.makeCounter(4),b=e.makeCounter();equal(a(),5);equal(a(-2),3);equal(b(),1);});
await test("reject before mutation",()=>{expectError(()=>e.makeCounter(0.5));const count=e.makeCounter(2);expectError(()=>count(Infinity));equal(count(),3);const big=e.makeCounter(Number.MAX_SAFE_INTEGER);expectError(()=>big());equal(big(-1),Number.MAX_SAFE_INTEGER-1);});

  } else {

await test("identity, arity and bounded last-entry behavior",()=>{let calls=0;const f=e.memoizeOne((...args)=>({args,calls:++calls})),a={};const first=f(a);if(f(a)!==first)throw new Error("Must reuse result");f({});f(a);equal(calls,3);f(a,undefined);equal(calls,4);});
await test("receiver identity is part of key",()=>{let calls=0;const f=e.memoizeOne(function(x){calls++;return this.base+x;}),a={base:2,f},b={base:5,f};equal(a.f(1),3);equal(a.f(1),3);equal(b.f(1),6);equal(calls,2);});
await test("Object.is and failed calls",()=>{let calls=0;const f=e.memoizeOne(x=>{calls++;if(x==="bad")throw new TypeError();return {};});const old=f(NaN);if(f(NaN)!==old)throw new Error();expectError(()=>f("bad"),TypeError);if(f(NaN)!==old)throw new Error("Failure must preserve prior entry");f(0);f(-0);equal(calls,4);});

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
