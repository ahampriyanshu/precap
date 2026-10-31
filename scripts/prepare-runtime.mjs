import "./verify-browser-runtimes.mjs";
import {
  copyFile,
  cp,
  mkdir,
  readdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "node_modules", "pyodide");
const target = join(root, "public", "runtime");
await mkdir(target, { recursive: true });
const files = (await readdir(source)).filter((name) =>
  /^(pyodide.*\.(mjs|js|wasm|json)|python_stdlib\.zip)$/.test(name),
);
for (const file of files)
  await copyFile(join(source, file), join(target, file));
const { version } = JSON.parse(
  await readFile(join(source, "package.json"), "utf8"),
);
await writeFile(join(target, "version.json"), JSON.stringify({ version }));
for (const required of [
  "pyodide.mjs",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
]) {
  if (!files.includes(required))
    throw new Error(`Pyodide asset missing: ${required}`);
}
console.log(
  `Prepared Pyodide ${version}: ${files.length} local runtime assets.`,
);

const drawingFonts = join(
  root,
  "node_modules",
  "@excalidraw",
  "excalidraw",
  "dist",
  "prod",
  "fonts",
);
await cp(drawingFonts, join(root, "public", "excalidraw", "fonts"), {
  recursive: true,
});
console.log("Prepared local Excalidraw fonts.");
