import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const { chapters } = JSON.parse(fs.readFileSync("curriculum.json", "utf8"));
test("HLD practice is fifteen architecture briefs rather than Python exercises", () => {
  const hld = chapters.filter((chapter) => chapter.track === "hld");
  assert.equal(hld.length, 15);
  for (const chapter of hld) {
    assert.equal(chapter.practice, "diagram", chapter.directory);
    const readme = fs.readFileSync(
      path.join(chapter.directory, "README.md"),
      "utf8",
    );
    const [, practice] = readme.split(/^## Practice\s*$/m);
    assert.ok(practice);
    for (const section of [
      "Design brief",
      "Draw and explain",
      "Stress the design",
      "Review your design",
    ])
      assert.match(
        practice,
        new RegExp(`^### ${section}$`, "m"),
        chapter.directory,
      );
    assert.doesNotMatch(
      practice,
      /exercise\.py|main\.py|NotImplementedError|--stage|\*\*Prototype|\*\*Final/,
    );
    assert.ok(!("cases" in chapter) && !("final_test_methods" in chapter));
    assert.deepEqual(
      fs
        .readdirSync(chapter.directory)
        .filter((file) => file !== "__pycache__" && !file.startsWith("."))
        .sort(),
      ["README.md"],
    );
  }
});
