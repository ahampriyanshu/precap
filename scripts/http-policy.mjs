import path from "node:path";

export const isolationHeaders = Object.freeze({
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Content-Type-Options": "nosniff",
});

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".bin": "application/octet-stream",
  ".jar": "application/java-archive",
  ".zip": "application/zip",
  ".py": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const sdkAsset =
  /^(?:(?:compiler|go-stage|java-stage|rustc-stage|runner|interactive-side|wasmer-thread)\.worker|index|runtime-core_bg|wasmer_js_bg)-[A-Za-z0-9_-]{8}\.(?:js|mjs|wasm)$/;

export function contentType(filename) {
  return filename
    ? mime[path.extname(filename).toLowerCase()] || "application/octet-stream"
    : "text/plain; charset=utf-8";
}

export function cacheControl(url, status = 200) {
  if (status !== 200 || !url?.pathname.startsWith("/runtimes/"))
    return "no-cache";
  const digests = url.searchParams.getAll("sha256");
  const pinned = digests.length === 1 && /^[a-fA-F0-9]{64}$/.test(digests[0]);
  return pinned || sdkAsset.test(path.basename(url.pathname))
    ? "public, max-age=31536000, immutable"
    : "no-cache";
}

export function responseHeaders(url, filename, status = 200) {
  return {
    ...isolationHeaders,
    "Cache-Control": cacheControl(url, status),
    "Content-Type": contentType(filename),
  };
}
