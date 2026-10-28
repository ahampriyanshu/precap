import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Engineering groups three independent one-page recaps", () => {
  const { guides } = JSON.parse(fs.readFileSync("guides.json", "utf8"));
  const engineering = guides.find((guide) => guide.slug === "engineering");
  assert.ok(engineering, "Engineering replaces the DevOps category");
  assert.equal(engineering.title, "Engineering");
  assert.equal(engineering.sequential, false);
  assert.deepEqual(
    engineering.parts.map((part) => part.label || part.title),
    ["Frontend Engineering", "Backend Engineering", "DevOps"],
  );
  assert.deepEqual(
    engineering.parts.map((part) => part.slug),
    ["frontend", "backend", "devops"],
  );
  const aliases = engineering.parts.flatMap((part) =>
    (part.aliases || []).map(
      (alias) => `${alias.guide || engineering.slug}/${alias.slug}`,
    ),
  );
  for (const legacy of [
    "devops/production",
    "devops/deploying",
    "devops/scaling",
  ])
    assert.ok(aliases.includes(legacy));
});
