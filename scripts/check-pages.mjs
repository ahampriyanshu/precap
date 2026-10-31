import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../out/", import.meta.url));
const base = `${(process.env.PAGES_BASE_PATH || "").replace(/\/+$/, "")}/`;
async function htmlFiles(dir) {
  const paths = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      paths.map((entry) =>
        entry.isDirectory()
          ? htmlFiles(join(dir, entry.name))
          : entry.name.endsWith(".html")
            ? [join(dir, entry.name)]
            : [],
      ),
    )
  ).flat();
}
const pages = await htmlFiles(root);
assert.ok(pages.length >= 10, "Expected generated HTML pages");
assert.ok(
  (await stat(join(root, "404.html"))).isFile(),
  "Static 404 page is missing",
);
assert.ok(
  (await stat(join(root, ".nojekyll"))).isFile(),
  ".nojekyll is missing",
);
assert.equal(
  (await readFile(join(root, "CNAME"), "utf8")).trim(),
  "precap.ahampriyanshu.com",
  "Deployment artifact must retain the custom domain",
);
const checked = new Set();
for (const page of pages) {
  const html = await readFile(page, "utf8");
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    const url = match[1];
    if (url.startsWith("//")) continue;
    assert.ok(
      url.startsWith(base),
      `Link outside deployment base ${base}: ${url} in ${page}`,
    );
    if (base === "/")
      assert.ok(
        !url.startsWith("/precap/"),
        `Legacy /precap/ prefix on custom domain: ${url}`,
      );
    const pathname = decodeURIComponent(url.split(/[?#]/)[0]);
    const file = resolve(root, pathname.slice(base.length));
    const info = await stat(file);
    if (info.isDirectory())
      assert.ok(
        (await stat(join(file, "index.html"))).isFile(),
        `Missing page: ${url}`,
      );
    checked.add(pathname);
  }
}
console.log(
  `Pages export verified: ${pages.length} HTML pages and ${checked.size} unique local links/assets.`,
);
