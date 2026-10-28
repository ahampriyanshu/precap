import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("four guide areas provide connected reading and an Engineering collection", () => {
  const { guides } = JSON.parse(fs.readFileSync("guides.json", "utf8"));
  assert.deepEqual(
    guides.map((guide) => guide.slug),
    ["engineering", "observability", "product-management", "llms-and-ai"],
  );
  const ids = new Set();
  for (const guide of guides) {
    assert.ok(guide.parts.length > 0);
    assert.ok(guide.title && guide.description);
    for (const part of guide.parts) {
      const id = `${guide.slug}/${part.slug}`;
      assert.ok(!ids.has(id));
      ids.add(id);
      const file = path.join("guides", guide.slug, `${part.slug}.md`);
      const content = fs.readFileSync(file, "utf8");
      assert.ok(content.startsWith(`# ${part.title}\n`), file);
      assert.ok(part.description && part.keywords.length);
      const headings = [...content.matchAll(/^## (.+)$/gm)].map(
        (match) => match[1],
      );
      assert.ok(headings.length >= 3, file);
      assert.equal(new Set(headings).size, headings.length, file);
      assert.doesNotMatch(
        content,
        /^## (Practice|Exercises|Quiz|Problem statement)\s*$/im,
      );
      assert.match(content, /\]\(https:\/\//, file);
    }
    assert.deepEqual(
      fs.readdirSync(path.join("guides", guide.slug)).sort(),
      guide.parts.map((part) => `${part.slug}.md`).sort(),
    );
  }
});
