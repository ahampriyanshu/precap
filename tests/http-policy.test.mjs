import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverScript = fileURLToPath(
  new URL("../scripts/serve.mjs", import.meta.url),
);
const digest = "a".repeat(64);
const isolation = {
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-embedder-policy": "require-corp",
  "cross-origin-resource-policy": "same-origin",
  "x-content-type-options": "nosniff",
};

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), "precap-http-"));
  const files = {
    "index.html": Buffer.from("<!doctype html><h1>static fixture</h1>"),
    "404.html": Buffer.from("<!doctype html><h1>missing fixture</h1>"),
    "compiled.worker.js": Buffer.from("self.onmessage = () => {};"),
    "runtimes/go/adapter.mjs": Buffer.from("export const runtime = 'browser';"),
    "runtimes/go/assets/compiler.worker-Cpp5Hq8T.js": Buffer.from("export {};"),
    "runtimes/go/assets/index-CMYYN-aK.mjs": Buffer.from("export {};"),
    "runtimes/go/assets/runtime-core_bg-CKk6CPFH.wasm": Buffer.from([
      0, 97, 115, 109, 1, 0, 0, 0,
    ]),
    "runtimes/go/toolchains/go.webc.gz.bin": Buffer.from([31, 139, 0, 255, 1]),
    "runtimes/java/runtime.jar": Buffer.from([80, 75, 3, 4, 0, 255]),
    "runtimes/java/runtime.zip": Buffer.from([80, 75, 3, 4, 1, 254]),
  };
  for (const [name, bytes] of Object.entries(files)) {
    const filename = path.join(directory, "out", name);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, bytes);
  }
  const child = spawn(process.execPath, [serverScript], {
    cwd: directory,
    env: { ...process.env, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "",
    stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  t.after(async () => {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await once(child, "exit");
    }
    await rm(directory, { recursive: true, force: true });
  });
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Server did not start: ${stdout}${stderr}`)),
      5000,
    );
    const onData = () => {
      const match = stdout.match(/http:\/\/localhost:(\d+)/);
      if (match && Number(match[1]) > 0) {
        clearTimeout(timer);
        child.stdout.off("data", onData);
        resolve(Number(match[1]));
      }
    };
    child.stdout.on("data", onData);
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited ${code}: ${stderr}`));
    });
    onData();
  });
  return {
    base: `http://127.0.0.1:${port}`,
    files,
    output: () => ({ stdout, stderr }),
  };
}

function headers(response, cache = "no-cache") {
  for (const [name, value] of Object.entries(isolation))
    assert.equal(response.headers.get(name), value, name);
  assert.equal(response.headers.get("cache-control"), cache);
}

test("static runtime GET and HEAD preserve bytes, MIME types, and browser isolation", async (t) => {
  const { base, files, output } = await fixture(t);
  const types = {
    "index.html": "text/html; charset=utf-8",
    "compiled.worker.js": "text/javascript; charset=utf-8",
    "runtimes/go/adapter.mjs": "text/javascript; charset=utf-8",
    "runtimes/go/assets/runtime-core_bg-CKk6CPFH.wasm": "application/wasm",
    "runtimes/go/toolchains/go.webc.gz.bin": "application/octet-stream",
    "runtimes/java/runtime.jar": "application/java-archive",
    "runtimes/java/runtime.zip": "application/zip",
  };
  for (const [name, type] of Object.entries(types)) {
    const response = await fetch(`${base}/${name}`);
    assert.equal(response.status, 200);
    headers(
      response,
      name.includes("-CKk6CPFH")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    );
    assert.equal(response.headers.get("content-type"), type);
    assert.equal(
      response.headers.get("content-length"),
      String(files[name].length),
    );
    assert.equal(response.headers.get("content-encoding"), null);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), files[name]);
    const head = await fetch(`${base}/${name}`, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("content-type"), type);
    assert.equal(
      head.headers.get("content-length"),
      String(files[name].length),
    );
    assert.equal((await head.arrayBuffer()).byteLength, 0);
  }
  assert.match(output().stdout, /^precap → http:\/\/localhost:\d+\n$/);
  assert.equal(output().stderr, "");
});

test("only pinned runtime asset URLs receive immutable caching", async (t) => {
  const { base } = await fixture(t);
  for (const [url, immutable] of [
    [`/runtimes/go/toolchains/go.webc.gz.bin?sha256=${digest}`, true],
    ["/runtimes/go/assets/compiler.worker-Cpp5Hq8T.js", true],
    ["/runtimes/go/assets/index-CMYYN-aK.mjs", true],
    ["/runtimes/go/adapter.mjs", false],
    ["/runtimes/go/toolchains/go.webc.gz.bin?sha256=short", false],
    [
      `/runtimes/go/toolchains/go.webc.gz.bin?sha256=${digest}&sha256=${digest}`,
      false,
    ],
    [`/compiled.worker.js?sha256=${digest}`, false],
    [`/index.html?sha256=${digest}`, false],
  ]) {
    const response = await fetch(base + url);
    assert.equal(response.status, 200);
    headers(
      response,
      immutable ? "public, max-age=31536000, immutable" : "no-cache",
    );
    await response.arrayBuffer();
  }
});

test("errors retain isolation and no-cache; the server accepts no compiler POSTs or source data", async (t) => {
  const { base, files, output } = await fixture(t);
  for (const [url, options, status] of [
    [`/missing.wasm?sha256=${digest}`, {}, 404],
    ["/%2e%2e%2fprivate.go", {}, 403],
    ["/%invalid", {}, 404],
    ["/compile", { method: "POST" }, 405],
    ["/compile", { method: "POST", body: "private learner source" }, 405],
  ]) {
    const response = await fetch(base + url, options);
    assert.equal(response.status, status);
    headers(response);
    const body = await response.text();
    assert.ok(!body.includes("private learner source"));
    assert.equal(response.headers.get("location"), null);
    if (status === 405)
      assert.equal(response.headers.get("allow"), "GET, HEAD");
  }
  const missing = await fetch(`${base}/missing`, { method: "HEAD" });
  assert.equal(missing.status, 404);
  headers(missing);
  assert.equal(
    missing.headers.get("content-length"),
    String(files["404.html"].length),
  );
  assert.equal((await missing.arrayBuffer()).byteLength, 0);
  assert.ok(!JSON.stringify(output()).includes("private learner source"));
});
