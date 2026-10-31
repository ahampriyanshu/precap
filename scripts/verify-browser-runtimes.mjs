import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
export async function verifyInventory(directory) {
  const inventory = JSON.parse(
    await readFile(join(directory, "asset-inventory.json"), "utf8"),
  );
  if (!Array.isArray(inventory.assets) || !inventory.assets.length)
    throw new Error(`Empty runtime inventory: ${directory}`);
  const names = new Set();
  let bytes = 0;
  for (const asset of inventory.assets) {
    if (
      typeof asset.path !== "string" ||
      names.has(asset.path) ||
      !/^[a-f0-9]{64}$/.test(asset.sha256) ||
      !Number.isSafeInteger(asset.bytes) ||
      asset.bytes < 0
    )
      throw new Error(`Invalid runtime inventory entry: ${directory}`);
    names.add(asset.path);
    const file = resolve(directory, asset.path);
    if (!file.startsWith(resolve(directory) + sep))
      throw new Error("Runtime inventory path leaves its directory.");
    const data = await readFile(file);
    if (
      data.length !== asset.bytes ||
      createHash("sha256").update(data).digest("hex") !== asset.sha256
    )
      throw new Error(`Runtime integrity check failed: ${asset.path}`);
    bytes += data.length;
  }
  return { files: names.size, bytes };
}
for (const language of ["go", "java", "cpp"]) {
  const result = await verifyInventory(
    join(root, "public", "runtimes", language),
  );
  console.log(
    `Verified ${language}: ${result.files} pinned browser runtime assets (${(result.bytes / 1e6).toFixed(1)} MB).`,
  );
}
