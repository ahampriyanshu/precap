import { test } from "node:test";
import assert from "node:assert/strict";
import { runJavaScript } from "../public/javascript-runtime.mjs";
const suite = `export async function runTests(exercise, stage) {
  const result = await exercise.answer(stage);
  const checks = [{name:'selected stage',status:result === stage ? 'passed':'failed'}];
  return {checks,methods:1,skipped:0,passed:true};
}`;
test("JavaScript runner awaits async code and preserves stage selection", async () => {
  for (const stage of ["prototype", "final"]) {
    const report = await runJavaScript({
      code: "export async function answer(stage) { await Promise.resolve(); return stage; }",
      tests: suite,
      stage,
    });
    assert.equal(report.passed, true);
    assert.equal(report.methods, 1);
    assert.equal(report.checks[0].name, "selected stage");
  }
});
test("failed, skipped, empty or malformed suites cannot grant completion", async () => {
  const failed = await runJavaScript({
    code: 'export function answer() { return "wrong"; }',
    tests: suite,
    stage: "final",
  });
  assert.equal(failed.passed, false);
  for (const checks of [[], [{ name: "skipped", status: "skipped" }]]) {
    const report = await runJavaScript({
      code: "",
      tests: `export function runTests(){return {checks:${JSON.stringify(checks)},methods:${checks.length},skipped:0,passed:true};}`,
      stage: "final",
    });
    assert.equal(report.passed, false);
  }
  await assert.rejects(
    () =>
      runJavaScript({
        code: "",
        tests: "export function runTests(){ return null; }",
        stage: "final",
      }),
    /report/i,
  );
});
test("syntax failures retain the learner filename and module instances are fresh", async () => {
  await assert.rejects(
    () =>
      runJavaScript({
        code: "export function answer( {",
        tests: suite,
        stage: "final",
      }),
    /exercise\.mjs/,
  );
  const code =
    'let calls=0; export function answer(stage){calls++;return calls===1?stage:"leaked";}';
  assert.equal(
    (await runJavaScript({ code, tests: suite, stage: "final" })).passed,
    true,
  );
  assert.equal(
    (await runJavaScript({ code, tests: suite, stage: "final" })).passed,
    true,
  );
});
test("Unicode source is preserved and an invalid stage is rejected", async () => {
  const code =
    'export function answer(stage){const title="😀 café";if(title.length<2)throw new Error();return stage;}';
  assert.equal(
    (await runJavaScript({ code, tests: suite, stage: "prototype" })).passed,
    true,
  );
  await assert.rejects(
    () => runJavaScript({ code, tests: suite, stage: "other" }),
    /stage/i,
  );
});
test("inconsistent counts or an explicit suite failure cannot grant completion", async () => {
  for (const report of [
    {
      checks: [{ name: "one", status: "passed" }],
      methods: 0,
      skipped: 0,
      passed: true,
    },
    {
      checks: [{ name: "one", status: "passed" }],
      methods: 1,
      skipped: 0,
      passed: false,
    },
    {
      checks: [{ name: "one", status: "passed" }],
      methods: 1,
      skipped: 1,
      passed: true,
    },
    {
      checks: [{ name: "one", status: "unknown" }],
      methods: 1,
      skipped: 0,
      passed: true,
    },
  ]) {
    const result = await runJavaScript({
      code: "",
      tests: `export function runTests(){return ${JSON.stringify(report)};}`,
      stage: "final",
    });
    assert.equal(result.passed, false);
  }
});
test("incomplete or invalid report metadata cannot grant completion", async () => {
  for (const report of [
    { checks: [{ name: "one", status: "passed" }], methods: 1, skipped: 0 },
    {
      checks: [{ name: "one", status: "passed" }],
      methods: 1,
      skipped: -1,
      passed: true,
    },
    {
      checks: [{ name: "one", status: "passed" }],
      methods: 1,
      skipped: "0",
      passed: true,
    },
    {
      checks: [{ name: "one", status: "passed" }],
      methods: 1,
      skipped: 0,
      passed: "true",
    },
  ]) {
    const result = await runJavaScript({
      code: "",
      tests: `export function runTests(){return ${JSON.stringify(report)};}`,
      stage: "final",
    });
    assert.equal(result.passed, false);
  }
});
test("sparse suites and blank check names cannot grant completion", async () => {
  for (const checks of ["Array(1)", '[{name:" ",status:"passed"}]']) {
    const report = await runJavaScript({
      code: "",
      tests: `export function runTests(){return {checks:${checks},methods:1,skipped:0,passed:true};}`,
      stage: "final",
    });
    assert.equal(report.passed, false);
  }
});
