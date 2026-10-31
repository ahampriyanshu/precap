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
    await test("draft input output nested copies shape empty duplicates",()=>{const ingredients=["x","x"],steps=[""];const d=new exercise.RecipeDraft("",ingredients,steps);ingredients.length=0;steps[0]="bad";const view=d.snapshot();equal(view,{name:"",ingredients:["x","x"],steps:[""]});view.ingredients.length=0;view.steps[0]="bad";equal(d.snapshot(),{name:"",ingredients:["x","x"],steps:[""]});});
  } else {
    await test("explicit permissions IDs validation and duplicate users",()=>{const m=new exercise.RecipeManager();m.addUser("w",["write"]);m.addUser("r",["read"]);equal(m.add("r","denied",[],[]),null);equal(m.add("w","A",["x"],[]),"recipe1");equal(m.get("w","recipe1"),null);equal(m.addUser("r",["write"]),false);equal(m.add("r","B",[],[]),null);expectError(()=>m.addUser("r",["admin"]));expectError(()=>m.add("unknown","",[],[]));equal(m.get("r","recipe1",1).name,"A");});
    await test("immutable versions current names rollback conflicts and append",()=>{const m=new exercise.RecipeManager();m.addUser("u",["read","write"]);const input=["x","x"],id=m.add("u","A",input,["step"]);input.length=0;equal(m.update("u",id,"B",["y"],[]),2);equal(m.get("u",id,1).ingredients,["x","x"]);m.add("u","A",["x"],[]);equal(m.rollback("u",id,1),null);equal(m.update("u","recipe2","C",["x"],[]),2);equal(m.rollback("u",id,1),3);equal(m.history("u",id).length,3);equal(m.byIngredient("u","x"),["recipe2","recipe1"]);});
    await test("snapshots permissions lists and independent instances",()=>{const m=new exercise.RecipeManager(),permissions=["read","write"];m.addUser("u",permissions);permissions.length=0;const id=m.add("u","A",["x"],["s"]);m.get("u",id).steps.length=0;m.history("u",id)[0].ingredients.length=0;equal(m.get("u",id,1).ingredients,["x"]);equal(m.get("u",id,1).steps,["s"]);equal(m.get("u",id,0),null);equal(m.get("u",id,99),null);expectError(()=>m.get("u",id,1.5));equal(new exercise.RecipeManager().history("u",id),[]);});
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
