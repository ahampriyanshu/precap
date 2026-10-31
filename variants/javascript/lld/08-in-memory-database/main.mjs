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
    await test("records overwrite empty values prefix order and copies",()=>{const s=new exercise.RecordStore();s.set("r","z","1");s.set("r","a","");equal(s.get("r","a"),"");equal(s.scan("r"),[["a",""],["z","1"]]);const view=s.scan("r");view[0][1]="bad";equal(s.scan("r","a"),[["a",""]]);equal(s.get("missing","a"),null);});
  } else {
    await test("TTL exact boundary history and no resurrection",()=>{const d=new exercise.TemporalDatabase();d.set(2,"r","f","old");d.set(5,"r","f","new",3);equal(d.get(7,"r","f"),"new");equal(d.get(8,"r","f"),null);equal(d.getAt(8,"r","f",4),"old");equal(d.getAt(8,"r","f",7),"new");equal(d.getAt(8,"r","f",8),null);});
    await test("same timestamp last write deletion CAS lifetime",()=>{const d=new exercise.TemporalDatabase();d.set(1,"r","f","a",2);equal(d.compareAndSet(1,"r","f","wrong","b"),false);equal(d.compareAndSet(1,"r","f","a","b"),true);equal(d.get(3,"r","f"),"b");equal(d.delete(3,"r","f"),true);equal(d.getAt(3,"r","f",3),null);d.set(3,"r","f","c");equal(d.getAt(3,"r","f",3),"c");});
    await test("validation never advances time and failed valid calls do",()=>{const d=new exercise.TemporalDatabase();d.set(2,"r","f","a");expectError(()=>d.set(10,"r","f","bad",0));equal(d.get(3,"r","f"),"a");expectError(()=>d.getAt(10,"r","f",11));equal(d.get(4,"r","f"),"a");expectError(()=>d.get(3,"r","f"));equal(d.delete(5,"r","missing"),false);expectError(()=>d.set(4,"r","x","b"));expectError(()=>d.compareAndSet(10,"r","f","wrong","b",true));equal(d.get(5,"r","f"),"a");});
    await test("sorted detached scans and instance clocks",()=>{const d=new exercise.TemporalDatabase();d.set(0,"r","b","2");d.set(0,"r","a","1");equal(d.scan(0,"r"),[["a","1"],["b","2"]]);const view=d.scan(0,"r");view[0][1]="bad";equal(d.scan(0,"r","a"),[["a","1"]]);equal(new exercise.TemporalDatabase().get(0,"r","a"),null);});
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
