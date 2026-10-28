import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

const guides = JSON.parse(fs.readFileSync("guides.json", "utf8")).guides as {
  slug: string;
  title: string;
  sequential?: boolean;
  parts: { slug: string; title: string }[];
}[];
const url = (guide: string, part: string) => `/guides/${guide}/${part}/`;

test("precap leads with searchable guides and all guide pages are reading-only", async ({
  page,
}) => {
  const runtimeRequests: string[] = [];
  page.on("request", (request) => {
    if (/pyodide|python\.worker|python-harness/.test(request.url()))
      runtimeRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page).toHaveTitle(/precap/);
  await expect(page.getByRole("link", { name: "precap home" })).toBeVisible();
  await expect(page.locator(".guide-card")).toHaveCount(4);
  await expect(page.locator(".guide-parts a")).toHaveCount(
    guides.reduce((count, guide) => count + guide.parts.length, 0),
  );
  await expect(page.locator(".track-card")).toHaveCount(4);
  expect((await page.locator("#guides").boundingBox())!.y).toBeLessThan(
    (await page.locator("#courses").boundingBox())!.y,
  );
  await expect(page.locator(".chapter-group[open]")).toHaveCount(0);
  const search = page.getByRole("textbox", { name: "Search topics" });
  await page.keyboard.press("/");
  await expect(search).toBeFocused();
  await search.fill("terraform");
  await expect(page.locator(".guide-card")).toHaveCount(1);
  await expect(page.locator(".guide-card")).toContainText("DevOps");
  await expect(page.locator(".catalog-chapter")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Practice", exact: true })
    .click();
  await expect(page.locator("#courses")).toBeInViewport();
  await expect(page.locator("#courses")).toContainText(
    "No practice lessons match",
  );
  await search.fill("URL Shortener");
  await expect(page.locator(".catalog-chapter")).toHaveCount(1);
  await expect(page.locator(".guide-card")).toHaveCount(0);
  await search.fill("no-such-topic-123");
  await expect(page.getByRole("status")).toContainText("Try another topic");
  await search.fill("");
  await expect(page.locator(".guide-card")).toHaveCount(4);
  for (const guide of guides) {
    for (const [index, part] of guide.parts.entries()) {
      await page.goto(url(guide.slug, part.slug));
      await expect(page).toHaveTitle(`${part.title} · precap`);
      await expect(
        page.getByRole("heading", { name: part.title, exact: true }),
      ).toBeVisible();
      await expect(
        page.locator(".guide-navigation a[aria-current='page']"),
      ).toHaveAttribute("href", url(guide.slug, part.slug));
      await expect(page.locator(".guide-reader .prose")).toContainText(/\S/);
      await expect(
        page.locator(".cm-editor, .problem-panel, .coding-panel"),
      ).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: "Open practice", exact: true }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Run checks" }),
      ).toHaveCount(0);
      const outline = page.locator(".article-outline");
      if (await outline.count()) await outline.locator("summary").click();
      const toc = page.getByRole("navigation", { name: "On this page" });
      const firstAnchor = toc.getByRole("link").first();
      const anchor = (await firstAnchor.getAttribute("href"))!;
      await firstAnchor.click();
      await expect(page.locator(anchor)).toBeInViewport();
      if (guide.sequential !== false && index < guide.parts.length - 1)
        await expect(
          page.getByRole("link", { name: "Next part", exact: true }),
        ).toHaveAttribute("href", url(guide.slug, guide.parts[1].slug));
      else
        await expect(
          page.getByRole("link", { name: "Back to field guides", exact: true }),
        ).toHaveAttribute("href", "/#guides");
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        audit.violations.map((issue) => ({
          id: issue.id,
          nodes: issue.nodes.map((node) => node.failureSummary),
        })),
        url(guide.slug, part.slug),
      ).toEqual([]);
    }
  }
  await page.goto(url("observability", "signals"));
  await page.getByRole("link", { name: "Next part", exact: true }).click();
  await expect(page).toHaveURL(url("observability", "reliability"));
  expect(runtimeRequests).toEqual([]);
});

test("mobile guides keep navigation contained and support section links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const homeAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(homeAudit.violations).toEqual([]);
  await page.locator(".guide-parts a").first().click();
  await expect(page).toHaveURL(url("engineering", "frontend"));
  const open = page.getByRole("button", { name: "Open guide navigation" });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Guide navigation" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Close navigation", exact: true }),
  ).toBeFocused();
  const links = dialog.getByRole("link");
  await links.last().focus();
  await page.keyboard.press("Tab");
  await expect(links.first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(links.last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(open).toBeFocused();
  await open.click();
  await page
    .getByRole("link", { name: /Put the model in the right place/ })
    .click();
  await expect(page).toHaveURL(url("llms-and-ai", "designing"));
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const toc = page.getByRole("navigation", { name: "On this page" });
  const lastAnchor = toc.getByRole("link").last();
  const anchor = (await lastAnchor.getAttribute("href"))!;
  await lastAnchor.click();
  await expect(page.locator(anchor)).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});
