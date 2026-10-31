import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const { chapters } = JSON.parse(fs.readFileSync("curriculum.json", "utf8"));
test("Go, Java, and C++ fundamentals use browser execution", () => {
  for (const language of ["go", "java", "cpp"]) {
    const lessons = chapters.filter((chapter) => chapter.track === language);
    assert.ok(lessons.length > 0, `${language}: fundamentals are present`);
    for (const chapter of lessons) {
      assert.equal(
        chapter.native,
        false,
        `${chapter.directory} runs in the browser`,
      );
    }
  }
});
test("every lesson provides separate teaching and a matching practice contract", () => {
  const ids = new Set();
  for (const chapter of chapters) {
    assert.ok(
      !ids.has(chapter.directory),
      `Duplicate lesson: ${chapter.directory}`,
    );
    ids.add(chapter.directory);
    const folder = path.resolve(chapter.directory);
    const readme = fs.readFileSync(path.join(folder, "README.md"), "utf8");
    assert.ok(
      readme.startsWith(`# ${chapter.title}\n`),
      `Title mismatch: ${chapter.directory}`,
    );
    assert.equal(
      readme.match(/^## Practice\s*$/gm)?.length,
      1,
      `One practice boundary: ${chapter.directory}`,
    );
    const [teaching, practice] = readme.split(/^## Practice\s*$/m);
    assert.ok(
      teaching.trim() && practice.trim(),
      `Teaching and practice: ${chapter.directory}`,
    );
    if (chapter.practice !== "diagram") {
      assert.match(
        practice,
        /prototype/i,
        `Prototype contract: ${chapter.directory}`,
      );
      assert.match(practice, /final/i, `Final contract: ${chapter.directory}`);
      assert.match(
        fs.readFileSync(
          path.join(
            folder,
            {
              javascript: "exercise.mjs",
              go: "exercise.go",
              java: "Exercise.java",
              cpp: "exercise.hpp",
            }[chapter.track] || "exercise.py",
          ),
          "utf8",
        ),
        /NotImplementedError|Not implemented|not implemented|UnsupportedOperationException|TODO|panic\(/,
      );
    }
    assert.doesNotMatch(
      readme,
      /Harborline|Mira|Ishan|the next incident|the problem behind the method/i,
    );
    assert.ok(chapter.section && typeof chapter.native === "boolean");
  }
});

test("HLD teaches fifteen architectures with request flows before drawing practice", () => {
  const lessons = chapters.filter((chapter) => chapter.track === "hld");
  assert.equal(lessons.length, 15);
  for (const chapter of lessons) {
    const folder = path.resolve(chapter.directory);
    const readme = fs.readFileSync(path.join(folder, "README.md"), "utf8");
    const [teaching, practice] = readme.split(/^## Practice\s*$/m);
    assert.deepEqual(
      [...teaching.matchAll(/^## (.+)$/gm)].map((match) => match[1]),
      [
        "The problem",
        "Naive approach",
        "Where the naive approach breaks",
        "A better design",
        "Real-world usage",
      ],
      chapter.directory,
    );
    assert.match(
      teaching,
      /```text\n[\s\S]+?```/,
      `Request flow: ${chapter.directory}`,
    );
    assert.doesNotMatch(
      teaching,
      /\]\(https?:\/\//,
      `No outbound references: ${chapter.directory}`,
    );
    assert.match(
      practice,
      /Excalidraw/i,
      `Diagram practice: ${chapter.directory}`,
    );
    assert.equal(chapter.native, false);
  }
});

test("LLD provides fifteen familiar problems with a complete design lesson before practice", () => {
  const lessons = chapters.filter((chapter) => chapter.track === "lld");
  assert.equal(lessons.length, 15);
  const sections = [
    "The problem",
    "Naive approach",
    "Where the naive approach breaks",
    "A better design",
    "Real-world usage",
  ];
  for (const chapter of lessons) {
    const folder = path.resolve(chapter.directory);
    assert.deepEqual(
      fs
        .readdirSync(folder)
        .filter((name) => !name.startsWith(".") && name !== "__pycache__")
        .sort(),
      ["README.md", "exercise.py", "main.py"],
    );
    const readme = fs.readFileSync(path.join(folder, "README.md"), "utf8");
    const teaching = readme.split(/^## Practice\s*$/m)[0];
    assert.deepEqual(
      [...teaching.matchAll(/^## (.+)$/gm)].map((match) => match[1]),
      sections,
      chapter.directory,
    );
    assert.equal(
      chapter.native,
      false,
      `${chapter.directory} runs in the browser`,
    );
  }
});
