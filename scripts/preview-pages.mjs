import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, sep, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../out/", import.meta.url));
const base = `${(process.env.PAGES_BASE_PATH || "").replace(/\/+$/, "")}/`;
const port = Number(process.env.PORT || 4174);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
};
try {
  await stat(join(root, "index.html"));
} catch {
  console.error("Run npm run build:pages before previewing.");
  process.exit(1);
}
const server = createServer(async (req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (base !== "/" && (pathname === "/" || pathname === base.slice(0, -1))) {
      res.writeHead(302, { Location: base });
      res.end();
      return;
    }
    if (!pathname.startsWith(base)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    let file = resolve(root, pathname.slice(base.length));
    if (file !== resolve(root) && !file.startsWith(resolve(root) + sep)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    let status = 200;
    try {
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith("/")) {
          res.writeHead(301, { Location: pathname + "/" });
          res.end();
          return;
        }
        file = join(file, "index.html");
      }
      await stat(file);
    } catch {
      file = join(root, "404.html");
      status = 404;
    }
    res.writeHead(status, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    createReadStream(file)
      .on("error", () => res.destroy())
      .pipe(res);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
});
server.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Precap Pages preview: http://127.0.0.1:${port}${base}`),
);
