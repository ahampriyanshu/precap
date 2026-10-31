import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const { chapters } = JSON.parse(fs.readFileSync("curriculum.json", "utf8"));
test("every JavaScript test helper checks sparse-array length and error identity", async () => {
  for (const chapter of chapters.filter((c) =>
    ["javascript", "dsa", "lld"].includes(c.track),
  )) {
    const directory =
      chapter.track === "javascript"
        ? chapter.directory
        : path.join("variants/javascript", chapter.directory);
    const source = fs.readFileSync(path.join(directory, "main.mjs"), "utf8");
    const helper =
      source.slice(0, source.indexOf("export async function runTests")) +
      "\nexport {equal};";
    const { equal } = await import(
      "data:text/javascript," + encodeURIComponent(helper)
    );
    assert.throws(() => equal(Array(3), []), undefined, directory);
    assert.throws(() => equal([1, ,], [1]), undefined, directory);
    assert.throws(
      () => equal(new Error("body"), new Error("body")),
      undefined,
      directory,
    );
    const original = new Error("identity");
    assert.doesNotThrow(() => equal([original], [original]), directory);
  }
});
