import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const { chapters } = JSON.parse(fs.readFileSync("curriculum.json", "utf8"));
const definitions = {
  javascript: ["exercise.mjs", "main.mjs"],
  go: ["exercise.go", "main.go"],
  java: ["Exercise.java", "Main.java"],
  cpp: ["exercise.hpp", "main.cpp"],
};
for (const [language, files] of Object.entries(definitions)) {
  test(`${language} fundamentals and every DSA/LLD exercise are complete teaching packages`, () => {
    const fundamentals = chapters.filter((c) => c.track === language);
    assert.ok(
      fundamentals.length >= 10,
      `${language}: cover language mechanisms`,
    );
    const shared = chapters.filter((c) => ["dsa", "lld"].includes(c.track));
    assert.equal(shared.length, 43);
    for (const chapter of [...fundamentals, ...shared]) {
      const directory =
        chapter.track === language
          ? chapter.directory
          : path.join("variants", language, chapter.directory);
      const source = fs.readFileSync(path.join(directory, "README.md"), "utf8");
      assert.equal(source.match(/^## Practice\s*$/gm)?.length, 1, directory);
      assert.match(source, /prototype/i, directory);
      assert.match(source, /final/i, directory);
      assert.match(
        source,
        new RegExp(
          "```" +
            { javascript: "javascript", go: "go", java: "java", cpp: "cpp" }[
              language
            ] +
            "\\n",
        ),
        directory,
      );
      const prose = source.replace(/^```[^\n]*\n[\s\S]*?^```/gm, "");
      assert.doesNotMatch(prose, /https?:\/\/|\]\(\/\//, directory);
      for (const file of files)
        assert.ok(
          fs.statSync(path.join(directory, file)).size > 20,
          `${directory}/${file}`,
        );
      assert.ok(!fs.existsSync(path.join(directory, ".git")), directory);
      assert.doesNotMatch(
        fs.readFileSync(path.join(directory, files[0]), "utf8"),
        /support\/references|solution\.mjs|private reference/i,
        directory,
      );
    }
  });
}
test("C++ download package retains the Unicode helper needed to compile", () => {
  const folder = "variants/cpp/dsa/02-strings-and-frequency-maps";
  assert.ok(fs.existsSync(`${folder}/unicode.hpp`));
  assert.match(
    fs.readFileSync(`${folder}/exercise.hpp`, "utf8"),
    /unicode\.hpp/,
  );
});
