import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
type Guide = {
  slug: string;
  title: string;
  indexAliases?: string[];
  parts: {
    slug: string;
    title: string;
    module?: string;
    aliases?: { guide?: string; slug: string; section?: string }[];
  }[];
};
const guides = JSON.parse(fs.readFileSync("guides.json", "utf8"))
  .guides as Guide[];

test("home searches full curricula without expanding every lesson by default", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".guide-card")).toHaveCount(guides.length);
  await expect(page.locator(".playlist-open")).toHaveCount(guides.length);
  await expect(page.locator(".guide-parts a")).toHaveCount(0);
  await expect(page.locator(".learning-path > li")).toHaveCount(4);
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("python");
  await expect(page.locator(".path-course")).toHaveCount(4);
  const search = page.getByRole("textbox", { name: "Search topics" });
  await page.keyboard.press("/");
  await expect(search).toBeFocused();
  for (const [term, slug] of [
    ["hydration", "frontend"],
    ["MVCC", "backend"],
    ["LoRA", "ai-engineering"],
    ["Terraform", "devops"],
  ]) {
    await search.fill(term);
    await expect(
      page.locator(`.guide-card a[href='/guides/${slug}/']`),
    ).toBeVisible();
    expect(await page.locator(".guide-parts a").count()).toBeGreaterThan(0);
  }
  await search.fill("no-such-topic-123");
  await expect(page.getByRole("status")).toContainText("Try another topic");
  await search.fill("");
  await expect(page.locator(".guide-card")).toHaveCount(guides.length);
});

test("playlist indexes expose grouped curricula and representative lessons remain reading-only", async ({
  page,
}) => {
  const runtime: string[] = [];
  page.on("request", (request) => {
    if (/pyodide|python\.worker|python-harness/.test(request.url()))
      runtime.push(request.url());
  });
  for (const guide of guides) {
    await page.goto(`/guides/${guide.slug}/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      guide.title,
    );
    await expect(page.locator(".playlist-module li")).toHaveCount(
      guide.parts.length,
    );
    const modules = [
      ...new Set(guide.parts.map((part) => part.module || "The curriculum")),
    ];
    await expect(page.locator(".playlist-module")).toHaveCount(modules.length);
    for (const part of [guide.parts[0], guide.parts.at(-1)!]) {
      const route = `/guides/${guide.slug}/${part.slug}/`;
      await page.goto(route);
      await expect(page).toHaveTitle(`${part.title} · precap`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        part.title,
      );
      await expect(
        page.locator(".guide-navigation a[aria-current=page]"),
      ).toHaveAttribute("href", route);
      await expect(
        page.locator(".coding-panel,.diagram-panel,.cm-editor"),
      ).toHaveCount(0);
      await expect(
        page.locator(".prose a[href^='http'],.prose a[target='_blank']"),
      ).toHaveCount(0);
      const outline = page.locator(".article-outline");
      if (await outline.count()) await outline.locator("summary").click();
      const first = page
        .getByRole("navigation", { name: "On this page" })
        .getByRole("link")
        .first();
      const anchor = (await first.getAttribute("href"))!;
      await first.click();
      await expect(page.locator(anchor)).toBeInViewport();
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(audit.violations, route).toEqual([]);
    }
  }
  expect(runtime).toEqual([]);
});

test("mobile curriculum navigation contains focus and supports switching playlists", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/guides/frontend/");
  await page.locator(".playlist-module li a").first().click();
  const open = page.getByRole("button", { name: "Open guide navigation" });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Guide navigation" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Close navigation", exact: true }),
  ).toBeFocused();
  await dialog.locator("summary").filter({ hasText: "AI Engineering" }).click();
  const ai = guides.find((guide) => guide.slug === "ai-engineering")!;
  await dialog
    .locator(`a[href="/guides/ai-engineering/${ai.parts[0].slug}/"]`)
    .click();
  await expect(page).toHaveURL(`/guides/ai-engineering/${ai.parts[0].slug}/`);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await open.click();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("legacy guide bookmarks reach canonical lessons with and without JavaScript", async ({
  browser,
  baseURL,
}) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ baseURL, javaScriptEnabled });
    try {
      const page = await context.newPage();
      for (const guide of guides) {
        for (const alias of guide.indexAliases || []) {
          await page.goto(`/guides/${alias}/`);
          await expect(page).toHaveURL(`/guides/${guide.slug}/`);
          await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            guide.title,
          );
        }
        for (const part of guide.parts)
          for (const alias of part.aliases || []) {
            await page.goto(
              `/guides/${alias.guide || guide.slug}/${alias.slug}/`,
            );
            await expect(page).toHaveURL(
              `/guides/${guide.slug}/${part.slug}/${alias.section ? `#${alias.section}` : ""}`,
            );
            await expect(page.getByRole("heading", { level: 1 })).toHaveText(
              part.title,
            );
          }
      }
    } finally {
      await context.close();
    }
  }
});
