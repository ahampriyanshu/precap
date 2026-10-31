import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const { guides } = JSON.parse(fs.readFileSync("guides.json", "utf8"));
const { cheatsheets } = JSON.parse(fs.readFileSync("cheatsheets.json", "utf8"));
test("cheatsheets contain tool workflows and link to a valid lesson context", () => {
  assert.deepEqual(
    cheatsheets.map((sheet) => sheet.slug).sort(),
    [
      "git",
      "docker",
      "kubernetes",
      "aws-cli",
      "terraform",
      "helm",
      "linux-networking",
    ].sort(),
  );
  for (const sheet of cheatsheets) {
    const part = guides
      .find((guide) => guide.slug === sheet.guide.slug)
      ?.parts.find((part) => part.slug === sheet.guide.part);
    assert.ok(part, sheet.slug);
    const source = fs.readFileSync(`cheatsheets/${sheet.slug}.md`, "utf8");
    assert.ok(source.startsWith(`# ${sheet.title}\n`), sheet.slug);
    assert.ok(
      source.includes(`/guides/${sheet.guide.slug}/${part.slug}/`),
      sheet.slug,
    );
    for (const section of source.split(/^## /m).slice(1))
      assert.match(
        section,
        /^```(?:bash|hcl|yaml)\n.+?^```/ms,
        `${sheet.slug}: concrete workflow required`,
      );
  }
});
