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
    await test("FIFO lifetime duplicate IDs consumed content and independence",()=>{const q=new exercise.MessageQueue();equal(q.publish("",""),true);q.publish("b","B");equal(q.consume(),{id:"",payload:""});equal(q.publish("","new"),false);equal(q.consume(),{id:"b",payload:"B"});equal(q.consume(),null);equal(new exercise.MessageQueue().consume(),null);});
  } else {
    await test("groups start at old messages independent FIFO and duplicate subscriptions",()=>{const b=new exercise.MessageBroker();b.publish("a","A");b.publish("b","B");b.subscribe("x");b.subscribe("y");equal(b.poll("x"),{id:"a",payload:"A",attempt:1});equal(b.poll("x"),{id:"a",payload:"A",attempt:1});equal(b.ack("x","b"),false);equal(b.ack("x","a"),true);equal(b.poll("y").id,"a");equal(b.poll("x").id,"b");equal(b.subscribe("x"),false);equal(b.publish("a","new"),false);});
    await test("retry blocks next delivery and attempt limit dead letters exactly once",()=>{const b=new exercise.MessageBroker(2);b.publish("a","A");b.publish("b","B");b.subscribe("g");b.poll("g");equal(b.nack("g","a"),"retry");equal(b.ack("g","a"),false);equal(b.nack("g","a"),null);equal(b.poll("g"),{id:"a",payload:"A",attempt:2});equal(b.nack("g","a"),"dead-letter");equal(b.deadLetters("g"),[{id:"a",payload:"A",attempts:2}]);equal(b.nack("g","a"),null);equal(b.poll("g"),{id:"b",payload:"B",attempt:1});});
    await test("nested delivery DLQ snapshots unknown groups and constructor",()=>{for(const n of [0,true,1.5,NaN])expectError(()=>new exercise.MessageBroker(n));const b=new exercise.MessageBroker(1);equal(b.poll("unknown"),null);equal(b.deadLetters("unknown"),[]);b.publish("a","A");b.subscribe("g");b.subscribe("h");const delivery=b.poll("g");delivery.payload="bad";equal(b.poll("g").payload,"A");b.nack("g","a");const dlq=b.deadLetters("g");dlq[0].payload="bad";dlq.length=0;equal(b.deadLetters("g"),[{id:"a",payload:"A",attempts:1}]);equal(b.poll("h"),{id:"a",payload:"A",attempt:1});});
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
