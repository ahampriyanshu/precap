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
  const fn = exercise[stage === "prototype" ? "prototype" : "solve"];
  const cases = [
["head and adjacent removals", [[1, 2, 3, 2, 4], [1, 2]], [3, 4]],
["empty list", [[], [1]], []],
["all values removed", [[1, 1], [1]], []],
["no blocked values", [[1, 2], []], [1, 2]],
["linked list 0", [[], [1, 4]], []],
["linked list 1", [[0], [1, 4]], [0]],
["linked list 2", [[5, 3], [1, 4]], [5, 3]],
["linked list 3", [[1, 1, 2], [1, 4]], [2]],
["linked list 4", [[3, 3, 5, 0], [1, 4]], [3, 3, 5, 0]],
["linked list 5", [[0, 2, 4, 5, 2], [1, 4]], [0, 2, 5, 2]],
["linked list 6", [[2, 5, 5, 4, 0, 2], [1, 4]], [2, 5, 5, 0, 2]],
["linked list 7", [[1, 5, 5, 3, 3, 5, 5], [1, 4]], [5, 5, 3, 3, 5, 5]],
["linked list 8", [[3, 4, 2, 2, 4, 4, 5, 4], [1, 4]], [3, 2, 2, 5]],
["linked list 9", [[1, 1, 3, 5, 5, 0, 4, 4, 3], [1, 4]], [3, 5, 5, 0, 3]],
["linked list 10", [[4, 1, 1, 0, 1, 5, 2, 0, 5, 4], [1, 4]], [0, 5, 2, 0, 5]],
["linked list 11", [[3, 3, 5, 1, 5, 5, 2, 1, 4, 5, 5], [1, 4]], [3, 3, 5, 5, 5, 2, 5, 5]],
["linked list 12", [[5, 0, 0, 5, 3, 3, 1, 1, 2, 1, 5, 4], [1, 4]], [5, 0, 0, 5, 3, 3, 2, 5]],
["linked list 13", [[4, 5, 2, 4, 4, 0, 0, 1, 0, 3, 1, 2, 5], [1, 4]], [5, 2, 0, 0, 0, 3, 2, 5]],
["linked list 14", [[1, 0, 5, 4, 1, 3, 0, 0, 5, 0, 4, 5, 1, 5], [1, 4]], [0, 5, 3, 0, 0, 5, 0, 5, 5]]
];
  for (const [name, original, expected] of cases) await test(name, () => {
    const args = structuredClone(original), before = structuredClone(args);
    let actual;
    try { actual = fn(...args); } finally { equal(args, before, "caller-owned input"); }
    equal(actual, expected);
  });
  await test("surviving node identity and cycle-free links", () => {
    const nodes = [1,2,3,2,4].map(value => new exercise.Node(value));
    nodes.forEach((node,i) => { node.next = nodes[i+1] ?? null; });
    const blocked = new Set([1,2]);
    const head = exercise.detach(nodes[0], blocked);
    if (head !== nodes[2] || head.next !== nodes[4] || head.next.next !== null) throw new Error("Relink the original surviving nodes in order");
    equal([...blocked], [1,2]);
  });
  await test("empty and complete removal", () => {
    equal(exercise.detach(null, new Set([1])), null);
    equal(exercise.detach(new exercise.Node(1), new Set([1])), null);
  });
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
