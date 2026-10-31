// Serve the static export locally. Production hosts can serve out/ directly.
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { responseHeaders } from "./http-policy.mjs";

const root = path.resolve("out");
const port = Number(process.env.PORT || 3000);
const server = http.createServer(async (request, response) => {
  for (const [name, value] of Object.entries(responseHeaders()))
    response.setHeader(name, value);
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD", "Content-Length": 0 });
    response.end();
    request.resume();
    return;
  }
  let url;
  try {
    url = new URL(request.url, "http://localhost");
    const urlPath = decodeURIComponent(url.pathname);
    let file = path.resolve(root, "." + urlPath);
    if (!file.startsWith(root + path.sep) && file !== root) {
      response.writeHead(403, { "Content-Length": 0 });
      response.end();
      return;
    }
    let information = await stat(file);
    if (information.isDirectory()) {
      file = path.join(file, "index.html");
      information = await stat(file);
    }
    if (!information.isFile()) throw new Error("Not a static file");
    response.writeHead(200, {
      ...responseHeaders(url, file),
      "Content-Length": information.size,
    });
    if (request.method === "HEAD") response.end();
    else
      createReadStream(file)
        .on("error", () => response.destroy())
        .pipe(response);
  } catch {
    const notFound = path.join(root, "404.html");
    try {
      const information = await stat(notFound);
      response.writeHead(404, {
        ...responseHeaders(url, notFound, 404),
        "Content-Length": information.size,
      });
      if (request.method === "HEAD") response.end();
      else
        createReadStream(notFound)
          .on("error", () => response.destroy())
          .pipe(response);
    } catch {
      const body = "Not found";
      response.writeHead(404, {
        ...responseHeaders(url, undefined, 404),
        "Content-Length": Buffer.byteLength(body),
      });
      response.end(request.method === "HEAD" ? undefined : body);
    }
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`precap → http://localhost:${server.address().port}`),
);
