import { build } from "esbuild";
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const destination = path.resolve(
  process.argv[2] || path.join(here, "../../public/runtimes/go"),
);
const packageRoot = (name) =>
  path.dirname(fileURLToPath(import.meta.resolve(`${name}/package.json`)));
const browser = packageRoot("@wasm-oj/browser");
const go = packageRoot("@wasm-oj/toolchain-go");
const expected = {
  "@wasm-oj/browser": "0.2.5",
  "@wasm-oj/toolchain-go": "0.2.0",
};
for (const [name, version] of Object.entries(expected)) {
  const metadata = JSON.parse(
    await readFile(path.join(packageRoot(name), "package.json")),
  );
  if (metadata.version !== version)
    throw Error(`${name}: expected ${version}, found ${metadata.version}`);
}
await mkdir(destination, { recursive: true });
await build({
  absWorkingDir: here,
  entryPoints: [path.join(here, "run-go.js")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  outfile: path.join(destination, "adapter.mjs"),
});
await cp(path.join(browser, "dist/assets"), path.join(destination, "assets"), {
  recursive: true,
});
await cp(path.join(go, "assets"), path.join(destination, "toolchains"), {
  recursive: true,
});
for (const [name, root] of [
  ["browser", browser],
  ["go", go],
]) {
  const out = path.join(destination, "licenses", name);
  await mkdir(out, { recursive: true });
  await cp(path.join(root, "licenses"), path.join(out, "licenses"), {
    recursive: true,
  });
  for (const file of ["LICENSE", "THIRD_PARTY_NOTICES.md", "package.json"])
    await cp(path.join(root, file), path.join(out, file));
}
const { descriptor } = await import("@wasm-oj/toolchain-go");
for (const asset of descriptor.assets) {
  const content = await readFile(
    path.join(destination, "toolchains", path.basename(asset.path)),
  );
  if (
    content.byteLength !== asset.bytes ||
    createHash("sha256").update(content).digest("hex") !== asset.sha256
  )
    throw Error(`Asset mismatch: ${asset.path}`);
}
await writeFile(
  path.join(destination, "go-toolchain-descriptor.json"),
  JSON.stringify(descriptor, null, 2) + "\n",
);
async function inventory(folder) {
  const entries = [];
  for (const item of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, item.name);
    if (item.isDirectory()) entries.push(...(await inventory(file)));
    else if (file !== path.join(destination, "asset-inventory.json")) {
      const content = await readFile(file);
      entries.push({
        path: path.relative(destination, file),
        bytes: content.byteLength,
        sha256: createHash("sha256").update(content).digest("hex"),
      });
    }
  }
  return entries;
}
await writeFile(
  path.join(destination, "asset-inventory.json"),
  JSON.stringify(
    { packages: expected, assets: await inventory(destination) },
    null,
    2,
  ) + "\n",
);
console.log(destination);
