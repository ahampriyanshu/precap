import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const inputs = JSON.parse(
  await fs.readFile(path.join(here, "build-inputs.json"), "utf8"),
);
const options = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const name = process.argv[index],
    value = process.argv[index + 1];
  if (!["--cache", "--output"].includes(name) || !value)
    throw new Error(
      "Usage: node build.mjs [--cache directory] [--output directory]",
    );
  options.set(name, path.resolve(value));
}
const cache =
  options.get("--cache") ?? path.join(os.tmpdir(), "precap-java-build-cache");
const defaultOutput = path.resolve(here, "../../public/runtimes/java");
const output = options.get("--output") ?? defaultOutput;
await fs.mkdir(cache, { recursive: true });
await fs.mkdir(output, { recursive: true });
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function download(input) {
  const destination = path.join(cache, input.file);
  let bytes = await fs.readFile(destination).catch(() => null);
  if (!bytes || bytes.length !== input.bytes || sha(bytes) !== input.sha256) {
    console.log(`Downloading ${input.file}`);
    const response = await fetch(input.url);
    if (!response.ok)
      throw new Error(`Download failed: ${input.file} (${response.status}).`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length !== input.bytes || sha(bytes) !== input.sha256)
      throw new Error(`Checksum mismatch: ${input.file}.`);
    await fs.writeFile(destination, bytes);
  }
  return destination;
}
const [ecj, bootstrap] = await Promise.all([
  download(inputs.ecj),
  download(inputs.bootstrap),
]);
const files = new Map([
  [
    "/bootstrap.html",
    { file: path.join(here, "bootstrap.html"), type: "text/html" },
  ],
  [
    "/bootstrap-worker.js",
    { file: path.join(here, "bootstrap-worker.js"), type: "text/javascript" },
  ],
  ["/bootstrap.jar", { file: bootstrap, type: "application/java-archive" }],
]);
const server = http.createServer(async (req, res) => {
  try {
    const entry = files.get(new URL(req.url, "http://localhost").pathname);
    if (!entry) {
      res.writeHead(404).end();
      return;
    }
    const bytes = await fs.readFile(entry.file);
    res.writeHead(200, {
      "Content-Type": entry.type,
      "Content-Length": bytes.length,
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "same-origin",
    });
    res.end(bytes);
  } catch {
    res.writeHead(500).end();
  }
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const require = createRequire(path.join(process.cwd(), "package.json"));
const { chromium } = require("playwright");
let browser;
try {
  console.log(
    "Compiling helper source in Chromium; no local Java compiler is used.",
  );
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PRECAP_JAVA_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PRECAP_JAVA_CHROMIUM_EXECUTABLE }
      : {}),
  });
  const page = await browser.newPage();
  page.on("pageerror", (error) => console.error(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/bootstrap.html`);
  await page.waitForFunction(() => window.ready || window.buildError, null, {
    timeout: 180000,
  });
  const failure = await page.evaluate(() => window.buildError);
  if (failure) throw new Error(failure);
  const source = await fs.readFile(
    path.join(here, "PrecapJavaRunner.java"),
    "utf8",
  );
  const result = await page.evaluate(
    (source) => window.compileBridge(source),
    source,
  );
  if (result.errors || !result.classes?.length)
    throw new Error(
      result.errors || "The browser compiler emitted no helper classes.",
    );
  const classes = path.join(cache, "bridge-classes.json");
  await fs.writeFile(classes, JSON.stringify(result, null, 2) + "\n");
  if (output !== defaultOutput) {
    for (const file of [
      "adapter.mjs",
      "precap-java.worker.js",
      "THIRD_PARTY_NOTICES.txt",
    ])
      await fs.copyFile(
        path.join(defaultOutput, file),
        path.join(output, file),
      );
    await fs.cp(
      path.join(defaultOutput, "licenses"),
      path.join(output, "licenses"),
      { recursive: true },
    );
  }
  const packed = spawnSync(
    process.env.PRECAP_JAVA_PYTHON ?? "python3",
    [
      path.join(here, "package-runtime.py"),
      "--ecj",
      ecj,
      "--bootstrap",
      bootstrap,
      "--classes",
      classes,
      "--output",
      output,
    ],
    { stdio: "inherit" },
  );
  if (packed.error) throw packed.error;
  if (packed.status !== 0)
    throw new Error(`Runtime packaging failed (${packed.status}).`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
