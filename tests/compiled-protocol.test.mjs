import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  instrumentHarness,
  readCompiledReport,
} from "../public/compiled-protocol.mjs";
const marker = "PRECAP_TEST_123";
const line = (kind, value) => `\n${marker}${kind} ${JSON.stringify(value)}\n`;
const check = { name: "boundary: exact expiry", status: "passed" };
const result = (overrides) => ({
  code: 0,
  stdout: line("CHECK", check) + line("SUMMARY", { methods: 1, failed: 0 }),
  stderr: "",
  durationMs: 12,
  ...overrides,
});
test("framed native checks require matching summary and successful process exit", () => {
  const report = readCompiledReport(result(), marker);
  assert.equal(report.passed, true);
  assert.deepEqual(report.checks, [check]);
  assert.equal(report.methods, 1);
  for (const variant of [
    result({ code: 1 }),
    result({ stdout: line("CHECK", check) }),
    result({ stdout: line("SUMMARY", { methods: 0, failed: 0 }) }),
    result({
      stdout: line("CHECK", check) + line("SUMMARY", { methods: 2, failed: 0 }),
    }),
    result({
      stdout: line("CHECK", check) + line("SUMMARY", { methods: 1, failed: 1 }),
    }),
    result({
      stdout:
        line("CHECK", { name: " ", status: "passed" }) +
        line("SUMMARY", { methods: 1, failed: 0 }),
    }),
    result({
      stdout:
        line("CHECK", { name: "skipped", status: "skipped" }) +
        line("SUMMARY", { methods: 1, failed: 0 }),
    }),
    result({
      stdout:
        line("CHECK", check) +
        line("SUMMARY", { methods: 1, failed: 0 }) +
        line("SUMMARY", { methods: 1, failed: 0 }),
    }),
  ]) {
    const failure = readCompiledReport(variant, marker);
    assert.equal(failure.passed, false);
    assert.ok(failure.checks.some((c) => c.status !== "passed"));
  }
});
test("ordinary learner output cannot act as a native check report", () => {
  assert.equal(
    readCompiledReport(result({ stdout: "PASS invented\n0 failed\n" }), marker)
      .passed,
    false,
  );
  assert.equal(
    readCompiledReport(
      result({
        stdout:
          line("CHECK", check).replace(marker, "OTHER") +
          line("SUMMARY", { methods: 1, failed: 0 }),
      }),
      marker,
    ).passed,
    false,
  );
  const failed = readCompiledReport(
    result({
      code: 1,
      stdout:
        line("CHECK", {
          name: "edge",
          status: "failed",
          detail: "invalid\nvalue",
        }) + line("SUMMARY", { methods: 1, failed: 1 }),
    }),
    marker,
  );
  assert.equal(failed.passed, false);
  assert.equal(failed.checks[0].detail, "invalid\nvalue");
});
test("malformed, duplicated, reordered, and skipped native frames fail closed", () => {
  const validSummary = line("SUMMARY", { methods: 1, failed: 0 });
  for (const stdout of [
    line("CHECK", check) + `\n${marker}SUMMARY {broken json}\n` + validSummary,
    `\n${marker}CHECK {"name":"unterminated}\n` + validSummary,
    line("CHECK", check) + `\n${marker}SUMMARY null\n`,
    line("CHECK", check) + line("SUMMARY", { methods: 1.5, failed: 0 }),
    line("CHECK", check) +
      line("SUMMARY", { methods: 1, failed: 0, skipped: 1 }),
    line("CHECK", check) +
      line("CHECK", check) +
      line("SUMMARY", { methods: 2, failed: 0 }),
    validSummary + line("CHECK", check),
    line("CHECK", { ...check, detail: null }) + validSummary,
    line("CHECK", check) + validSummary + `\n${marker}UNKNOWN {}\n`,
  ]) {
    const report = readCompiledReport(result({ stdout }), marker);
    assert.equal(report.passed, false);
    assert.ok(report.checks.some((c) => c.status === "error"));
  }
  for (const overrides of [
    { termination: "trap", stderr: "native crash\nsecond line ☃" },
    { code: undefined },
    { code: 0, exitCode: 2 },
  ]) {
    const report = readCompiledReport(result(overrides), marker);
    assert.equal(report.passed, false);
    assert.ok(report.checks.some((c) => c.status === "error"));
  }
});
test("native check details preserve quotes, slashes, control characters, and Unicode", () => {
  const detail =
    '"quoted" \\ slash\nline\rreturn\ttab\bbackspace\fform feed\u0000zero\u0001one ☃ 😀\u2028separator';
  const nativeCheck = { name: 'edge "☃"\ncase', status: "failed", detail };
  const report = readCompiledReport(
    result({
      code: 1,
      stdout:
        line("CHECK", nativeCheck) + line("SUMMARY", { methods: 1, failed: 1 }),
    }),
    marker,
  );
  assert.deepEqual(report.checks, [nativeCheck]);
  assert.equal(report.passed, false);
  assert.equal(report.duration, 0.012);
  for (const invalidMarker of [
    "",
    null,
    "space marker",
    'quote"',
    "dash-marker",
    "line\nmarker",
  ]) {
    assert.throws(() => readCompiledReport(result(), invalidMarker), /marker/i);
  }
});
test("every compiled harness can be instrumented without changing saved original files", () => {
  const { chapters } = JSON.parse(fs.readFileSync("curriculum.json", "utf8"));
  const entry = { go: "main.go", java: "Main.java", cpp: "main.cpp" };
  for (const language of Object.keys(entry))
    for (const chapter of chapters.filter((c) =>
      [language, "dsa", "lld"].includes(c.track),
    )) {
      const folder =
        chapter.track === language
          ? chapter.directory
          : path.join("variants", language, chapter.directory);
      const filename = path.join(folder, entry[language]);
      const source = fs.readFileSync(filename, "utf8");
      const instrumented = instrumentHarness(language, source, marker);
      assert.notEqual(instrumented, source, filename);
      assert.ok(instrumented.includes(marker), filename);
      assert.equal(fs.readFileSync(filename, "utf8"), source, filename);
    }
  assert.throws(
    () => instrumentHarness("go", "package main\nfunc main(){}", marker),
    /harness/i,
  );
  assert.throws(() => instrumentHarness("go", "", "unsafe marker;"), /marker/i);
});
test("instrumentation preserves the original readonly harness line mappings", () => {
  const { chapters } = JSON.parse(fs.readFileSync("curriculum.json", "utf8"));
  for (const [language, entry, hook] of [
    ["go", "main.go", "var passed, failed int"],
    ["java", "Main.java", "public class Main {"],
    ["cpp", "main.cpp", "namespace test {"],
  ]) {
    const chapter = chapters.find((c) => c.track === language);
    const source = fs.readFileSync(path.join(chapter.directory, entry), "utf8");
    const instrumented = instrumentHarness(language, source, marker);
    const originalLine = source
      .slice(0, source.indexOf(hook))
      .split("\n").length;
    if (language === "java") {
      assert.equal(instrumented.split("\n").length, source.split("\n").length);
      assert.equal(
        instrumented
          .split("\n")
          .findIndex((line) => line.includes("static void suites()")),
        source
          .split("\n")
          .findIndex((line) => line.includes("static void suites()")),
      );
    } else {
      assert.ok(
        instrumented.includes(
          language === "go"
            ? `//line main.go:${originalLine}\n${hook}`
            : `#line ${originalLine} "main.cpp"\n${hook}`,
        ),
      );
    }
  }
});
