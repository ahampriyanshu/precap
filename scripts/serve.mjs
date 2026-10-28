// Serve the static export locally. Production hosts can serve out/ directly.
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.env.PORT || 3000);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".py": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".zip": "application/zip",
};
const server = http.createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405);
    response.end();
    return;
  }
  try {
    const urlPath = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    let file = path.resolve(root, "." + urlPath);
    if (!file.startsWith(root + path.sep) && file !== root) {
      response.writeHead(403);
      response.end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    await stat(file);
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    if (request.method === "HEAD") response.end();
    else
      createReadStream(file)
        .on("error", () => response.destroy())
        .pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (request.method === "HEAD") response.end();
    else
      createReadStream(path.join(root, "404.html"))
        .on("error", () => response.end("Not found"))
        .pipe(response);
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`precap → http://localhost:${port}`),
);
