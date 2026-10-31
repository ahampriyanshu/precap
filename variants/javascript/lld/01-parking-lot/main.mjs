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
    await test("allocation rank tie compatibility and empty",()=>{equal(exercise.chooseSpot([["v","van"],["c2","car"],["c1","car"]],"car"),"c1");equal(exercise.chooseSpot([["c","car"]],"van"),null);equal(exercise.chooseSpot([],"car"),null);});
    await test("whole inventory validation and input ownership",()=>{const input=[["a","car"],["b","van"]];exercise.chooseSpot(input,"car");equal(input,[["a","car"],["b","van"]]);expectError(()=>exercise.chooseSpot([["a","car"],["a","van"]],"car"));expectError(()=>exercise.chooseSpot([["a","car"],["b","bad"]],"car"));});
  } else {
    await test("ticket lifecycle capacity failures and lifetime IDs",()=>{const lot=new exercise.ParkingLot([["c","car"]]);const first=lot.park("a","car");equal(first,{ticketId:1,vehicleId:"a",vehicleKind:"car",spotId:"c"});equal(lot.park("b","car"),null);equal(lot.release(1),first);equal(lot.release(1),null);equal(lot.park("b","car").ticketId,2);});
    await test("duplicate and invalid requests preserve allocation and next ID",()=>{const lot=new exercise.ParkingLot([["a","car"],["b","van"]]);lot.park("x","car");expectError(()=>lot.park("x","car"));expectError(()=>lot.park("","car"));expectError(()=>lot.release(true));equal(lot.activeTickets().length,1);equal(lot.park("y","van").ticketId,2);});
    await test("nested snapshots constructor inputs and instances",()=>{const input=[["a","car"]];const lot=new exercise.ParkingLot(input);input[0][0]="changed";const free=lot.availableSpots();free[0][0]="changed";const ticket=lot.park("u","car");ticket.spotId="bad";const active=lot.activeTickets();active[0].vehicleId="bad";active.length=0;equal(lot.activeTickets(),[{ticketId:1,vehicleId:"u",vehicleKind:"car",spotId:"a"}]);equal(new exercise.ParkingLot([]).park("x","car"),null);});
    await test("bounded allocation release cycles",()=>{const lot=new exercise.ParkingLot([["m","motorcycle"]]);for(let i=1;i<=40;i++){equal(lot.park("x","motorcycle").ticketId,i);equal(lot.availableSpots(),[]);lot.release(i);equal(lot.availableSpots(),[["m","motorcycle"]]);}});
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
