import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const { chapters } = JSON.parse(fs.readFileSync("curriculum.json", "utf8"));
const { guides } = JSON.parse(fs.readFileSync("guides.json", "utf8"));
const { cheatsheets } = JSON.parse(fs.readFileSync("cheatsheets.json", "utf8"));
const files = [
  ...cheatsheets.map((sheet) => path.join("cheatsheets", `${sheet.slug}.md`)),
  ...chapters.map((chapter) => path.join(chapter.directory, "README.md")),
  ...guides.flatMap((guide) =>
    guide.parts.map((part) =>
      path.join("guides", guide.slug, `${part.slug}.md`),
    ),
  ),
];
test("every reading page explains a concrete technical example in context", () => {
  for (const file of files) {
    const teaching = fs
      .readFileSync(file, "utf8")
      .split(/^## Practice\s*$/m)[0];
    const examples = [
      ...teaching.matchAll(/^```([^\n]+)\n([\s\S]*?)^```/gm),
    ].filter((match) => !/^(text|output|console)$/.test(match[1].trim()));
    assert.ok(
      examples.length,
      `${file}: needs code or configuration alongside the explanation`,
    );
    for (const example of examples) {
      assert.ok(example[2].trim(), `${file}: empty example`);
      const before = teaching.slice(0, example.index).trim();
      const after = teaching.slice(example.index + example[0].length).trim();
      assert.ok(
        before && after,
        `${file}: explain the example before and after the snippet`,
      );
    }
  }
});
