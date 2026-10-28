import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadPyodide } from "pyodide";

// Small synthetic exercises test the runner without distributing curriculum answers.
const pyodide = await loadPyodide();
const harness = await readFile(
  new URL("../public/python-harness.py", import.meta.url),
  "utf8",
);
async function run(tests, options = {}) {
  pyodide.globals.set(
    "__lesson_payload",
    JSON.stringify({
      code: "value = 7",
      tests,
      track: "python",
      stage: "final",
      ...options,
    }),
  );
  return JSON.parse(await pyodide.runPythonAsync(harness));
}

test("stage selection and every subtest result are preserved", async () => {
  const tests = `import unittest, exercise
class PrototypeTests(unittest.TestCase):
    def test_proto(self): self.assertEqual(exercise.value, 7)
class FinalTests(unittest.TestCase):
    def test_values(self):
        for value in [7, 8]:
            with self.subTest(value=value): self.assertEqual(exercise.value, value)
`;
  const prototype = await run(tests, { stage: "prototype" });
  assert.equal(prototype.passed, true);
  const final = await run(tests);
  assert.equal(final.passed, false);
  assert.deepEqual(
    final.checks.map((check) => check.status),
    ["passed", "failed"],
  );
  assert.match(final.checks[1].detail, /AssertionError/);
});

test("async tests await setup, execution, teardown and cleanups", async () => {
  const report = await run(`import unittest, asyncio
class FinalTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        await asyncio.sleep(0)
        self.ready = True
    async def test_async(self):
        self.assertTrue(self.ready)
        await asyncio.sleep(0)
        self.addAsyncCleanup(asyncio.sleep, 0)
    async def asyncTearDown(self): await asyncio.sleep(0)
PrototypeTests = FinalTests
`);
  assert.equal(report.passed, true);
  assert.equal(report.methods, 1);
});

test("unfinished async work and skipped tests cannot grant completion", async () => {
  const leaked = await run(`import unittest, asyncio
class FinalTests(unittest.IsolatedAsyncioTestCase):
    async def test_leak(self): asyncio.create_task(asyncio.sleep(100))
PrototypeTests = FinalTests
`);
  assert.equal(leaked.passed, false);
  assert.match(leaked.checks[0].detail, /unfinished async tasks/);
  const skipped = await run(`import unittest
class FinalTests(unittest.TestCase):
    @unittest.skip("unimplemented")
    def test_skip(self): pass
PrototypeTests = FinalTests
`);
  assert.equal(skipped.passed, false);
  assert.equal(skipped.skipped, 1);
});

test("syntax errors point into learner source; empty suites do not pass", async () => {
  const syntax = await run("", { code: "def invalid(" });
  assert.equal(syntax.passed, false);
  assert.match(syntax.checks[0].detail, /exercise.py/);
  assert.match(syntax.checks[0].detail, /SyntaxError/);
  const empty = await run(
    "import unittest\nclass FinalTests(unittest.TestCase): pass\nPrototypeTests = FinalTests",
  );
  assert.equal(empty.passed, false);
});
