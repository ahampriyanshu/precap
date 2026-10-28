import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const headings = (markdown) =>
  [...markdown.matchAll(/^## (.+)$/gm)].map((m) =>
    m[1]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  );
const { guides } = JSON.parse(fs.readFileSync("guides.json", "utf8"));
const { cheatsheets } = JSON.parse(fs.readFileSync("cheatsheets.json", "utf8"));
for (const sheet of cheatsheets) {
  test(`${sheet.title} maps each workflow to its engineering context`, () => {
    assert.ok(sheet.title && sheet.description && sheet.keywords.length);
    const guide = guides.find((entry) => entry.slug === sheet.guide.slug);
    const part = guide?.parts.find((entry) => entry.slug === sheet.guide.part);
    assert.ok(part && part.cheatsheet === sheet.slug);
    const guidePath = `/guides/${guide.slug}/${part.slug}/`;
    const sheetPath = `/cheatsheets/${sheet.slug}/`;
    const reading = fs.readFileSync(
      path.join("guides", guide.slug, `${part.slug}.md`),
      "utf8",
    );
    const commands = fs.readFileSync(
      path.join("cheatsheets", `${sheet.slug}.md`),
      "utf8",
    );
    assert.ok(commands.startsWith(`# ${sheet.title}\n`));
    const guideIds = headings(reading),
      sheetIds = headings(commands);
    for (const ids of [guideIds, sheetIds])
      assert.equal(new Set(ids).size, ids.length);
    for (const alias of part.aliases || [])
      if (alias.section) assert.ok(guideIds.includes(alias.section));
    const linkedIds = (text, prefix) =>
      [...text.matchAll(/\]\((\/[^)]+)#([^)]+)\)/g)]
        .filter((m) => m[1] === prefix)
        .map((m) => m[2]);
    assert.deepEqual(
      [...new Set(linkedIds(reading, sheetPath))].sort(),
      [...sheetIds].sort(),
    );
    assert.deepEqual(
      [...new Set(linkedIds(commands, guidePath))].sort(),
      [...guideIds].sort(),
    );
    for (const section of commands.split(/^## /m).slice(1)) {
      assert.ok(
        [...section.matchAll(/^```([^\n]+)\n([\s\S]*?)^```/gm)].some((m) =>
          m[2].trim(),
        ),
        "Each reference section needs a concrete pattern or workflow",
      );
      assert.ok(section.includes(`](${guidePath}#`));
    }
    assert.doesNotMatch(
      reading + commands,
      /^## (Practice|Quiz|Exercises)\s*$/im,
    );
  });
}
