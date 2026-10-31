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
    await test("half-open overlap invalid boundaries and detached slots",()=>{const c=new exercise.RoomCalendar();equal(c.reserve(2,4),true);equal(c.reserve(0,2),true);equal(c.reserve(1,3),false);expectError(()=>c.reserve(4,4));expectError(()=>c.reserve(true,5));equal(c.slots(),[[0,2],[2,4]]);const view=c.slots();view[0][0]=99;equal(c.slots(),[[0,2],[2,4]]);});
  } else {
    await test("deterministic multiroom selection and atomic failed retry",()=>{const b=new exercise.MeetingRoomBooking({z:4,b:2,a:2});equal(b.book("x",0,2,2,2),["a","b"]);equal(b.book("fail",0,2,2,2),null);equal(b.schedule("z"),[]);equal(b.book("fail",2,4,2,2),["a","b"]);equal(b.book("large",0,2,5),null);});
    await test("all overlap shapes reject and touching remains valid",()=>{const b=new exercise.MeetingRoomBooking({a:2});b.book("base",3,7,1);for(const [i,[start,end]] of [[0,[2,4]],[1,[4,6]],[2,[6,8]],[3,[2,8]],[4,[3,7]]])equal(b.book(`bad${i}`,start,end,1),null);equal(b.book("left",0,3,1),["a"]);equal(b.book("right",7,9,1),["a"]);});
    await test("cancellation releases all successful IDs remain reserved",()=>{const b=new exercise.MeetingRoomBooking({a:2,b:2});b.book("x",0,3,1,2);equal(b.cancel("x"),true);equal(b.cancel("x"),false);equal(b.allocation("x"),null);equal(b.book("x",4,5,1),null);equal(b.book("y",0,3,1,2),["a","b"]);equal(b.schedule("a"),[{id:"y",start:0,end:3,seats:1}]);});
    await test("input snapshots validation precedence and independent instances",()=>{const rooms={a:2},b=new exercise.MeetingRoomBooking(rooms);rooms.a=0;b.book("x",0,1,1);expectError(()=>b.book("x",-1,2,1));expectError(()=>b.schedule("unknown"));const a=b.allocation("x");a.length=0;const view=b.schedule("a");view[0].start=99;equal(b.allocation("x"),["a"]);equal(b.schedule("a")[0].start,0);equal(new exercise.MeetingRoomBooking({}).book("x",0,1,1),null);expectError(()=>new exercise.MeetingRoomBooking({a:true}));});
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
