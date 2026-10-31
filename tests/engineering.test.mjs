import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const { guides } = JSON.parse(fs.readFileSync("guides.json", "utf8"));
test("Frontend, Backend, and DevOps have independent modular curricula", () => {
  assert.ok(!guides.some((guide) => guide.slug === "engineering"));
  for (const slug of ["frontend", "backend", "devops"]) {
    const guide = guides.find((item) => item.slug === slug);
    assert.ok(guide, slug);
    assert.ok(new Set(guide.parts.map((part) => part.module)).size > 1, slug);
    assert.ok(
      guide.parts.every((part) => part.module),
      slug,
    );
    assert.ok(
      guide.parts.every(
        (part) => !["frontend", "backend", "devops"].includes(part.cheatsheet),
      ),
      slug,
    );
  }
  const aliases = guides.flatMap((guide) =>
    guide.parts.flatMap((part) =>
      (part.aliases || []).map(
        (alias) => `${alias.guide || guide.slug}/${alias.slug}`,
      ),
    ),
  );
  for (const legacy of [
    "engineering/frontend",
    "engineering/backend",
    "engineering/devops",
    "devops/production",
    "devops/deploying",
    "devops/scaling",
  ])
    assert.ok(aliases.includes(legacy), legacy);
});
