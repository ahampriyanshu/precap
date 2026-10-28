import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const source = fs.readFileSync(
  new URL("../lib/diagram-storage.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { blankDiagram, parseDiagram } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("diagram drafts keep image data and review metadata and reject unreadable records", () => {
  const work = blankDiagram();
  assert.equal(work.reviewed, false);
  assert.deepEqual(JSON.parse(work.scene).elements, []);
  const scene = {
    type: "excalidraw",
    version: 2,
    elements: [{ id: "image", type: "image", fileId: "file1" }],
    appState: { viewBackgroundColor: "#fff" },
    files: {
      file1: {
        id: "file1",
        dataURL: "data:image/png;base64,abc",
        mimeType: "image/png",
      },
    },
  };
  const draft = {
    ...work,
    scene: JSON.stringify(scene),
    notes: "The store owns uniqueness.",
    reviewed: true,
    updatedAt: 123,
  };
  assert.deepEqual(parseDiagram(draft), draft);
  assert.equal(
    JSON.parse(parseDiagram(draft).scene).files.file1.dataURL,
    scene.files.file1.dataURL,
  );
  for (const value of [
    null,
    {},
    { ...draft, version: 99 },
    { ...draft, scene: "broken JSON" },
    { ...draft, scene: JSON.stringify({ type: "excalidraw", elements: {} }) },
    { ...draft, scene: JSON.stringify({ ...scene, elements: [null] }) },
    { ...draft, scene: JSON.stringify({ ...scene, elements: ["invalid"] }) },
    { ...draft, scene: JSON.stringify({ ...scene, elements: [{}] }) },
    { ...draft, notes: null },
    { ...draft, reviewed: "true" },
  ])
    assert.throws(() => parseDiagram(value));
});
