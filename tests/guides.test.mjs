import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const { guides } = JSON.parse(fs.readFileSync("guides.json", "utf8"));
const { cheatsheets } = JSON.parse(fs.readFileSync("cheatsheets.json", "utf8"));
const { chapters } = JSON.parse(fs.readFileSync("curriculum.json", "utf8"));
const prose = (source) => source.replace(/^```[^\n]*\n[\s\S]*?^```/gm, "");
const ids = (source) =>
  [...source.matchAll(/^## (.+)$/gm)].map((m) =>
    m[1]
      .replace(/[`*_]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  );
const routes = new Map();
for (const guide of guides) {
  routes.set(`/guides/${guide.slug}/`, "");
  for (const part of guide.parts)
    routes.set(
      `/guides/${guide.slug}/${part.slug}/`,
      fs.readFileSync(
        path.join("guides", guide.slug, `${part.slug}.md`),
        "utf8",
      ),
    );
}
for (const sheet of cheatsheets)
  routes.set(
    `/cheatsheets/${sheet.slug}/`,
    fs.readFileSync(`cheatsheets/${sheet.slug}.md`, "utf8"),
  );
for (const chapter of chapters)
  routes.set(
    `/learn/${chapter.directory}/`,
    fs.readFileSync(`${chapter.directory}/README.md`, "utf8"),
  );

for (const language of ["javascript", "go", "java", "cpp"])
  for (const chapter of chapters.filter((c) =>
    ["dsa", "lld"].includes(c.track),
  ))
    routes.set(
      `/learn/${chapter.directory}/${language}/`,
      fs.readFileSync(
        `variants/${language}/${chapter.directory}/README.md`,
        "utf8",
      ),
    );

test("playlists have unique canonical sources, sections, and legacy destinations", () => {
  const paths = new Set();
  for (const guide of guides) {
    assert.ok(guide.parts.length && guide.description);
    const modules = new Set();
    let lastModule;
    for (const part of guide.parts) {
      const route = `/guides/${guide.slug}/${part.slug}/`;
      assert.ok(!paths.has(route), route);
      paths.add(route);
      const source = routes.get(route);
      assert.ok(source.startsWith(`# ${part.title}\n`), route);
      assert.ok(part.description && part.keywords.length, route);
      const sections = ids(source);
      assert.ok(sections.length >= 3, route);
      assert.equal(new Set(sections).size, sections.length, route);
      if (part.module !== lastModule) {
        assert.ok(
          !modules.has(part.module),
          `Keep modules contiguous: ${route}`,
        );
        modules.add(part.module);
        lastModule = part.module;
      }
      for (const alias of part.aliases || []) {
        const old = `/guides/${alias.guide || guide.slug}/${alias.slug}/`;
        assert.ok(!paths.has(old) && !routes.has(old), old);
        paths.add(old);
        if (alias.section) assert.ok(sections.includes(alias.section), old);
      }
    }
    assert.deepEqual(
      fs.readdirSync(path.join("guides", guide.slug)).sort(),
      guide.parts.map((part) => `${part.slug}.md`).sort(),
    );
  }
});

test("all lessons and sheets have no outbound references, and internal teaching links resolve", () => {
  for (const [route, source] of routes) {
    const text = prose(source);
    assert.doesNotMatch(text, /https?:\/\/|\]\(\/\//i, route);
    assert.doesNotMatch(
      text,
      /^(?:## (?:References|Sources)|Further reading:)/im,
      route,
    );
    for (const link of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const href = link[1];
      if (href.startsWith("/diagrams/")) {
        assert.ok(fs.existsSync(`public${href}`), `${route}: ${href}`);
        continue;
      }
      if (!href.startsWith("/") && !href.startsWith("#")) continue;
      const [target, hash] = href.split("#");
      const destination = target || route;
      assert.ok(routes.has(destination), `${route}: missing ${href}`);
      if (hash)
        assert.ok(
          ids(routes.get(destination)).includes(hash),
          `${route}: missing anchor ${href}`,
        );
    }
  }
});
