import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const { guides } = JSON.parse(fs.readFileSync("guides.json", "utf8"));
test("mechanism diagrams load on desktop and narrow mobile screens", async ({
  page,
}) => {
  const routes = [] as string[];
  for (const slug of ["frontend", "backend", "devops"]) {
    const guide = guides.find((g: { slug: string }) => g.slug === slug);
    for (const part of guide.parts) {
      if (
        fs
          .readFileSync(`guides/${slug}/${part.slug}.md`, "utf8")
          .includes("/diagrams/")
      ) {
        routes.push(`/guides/${slug}/${part.slug}/`);
        break;
      }
    }
  }
  expect(routes).toHaveLength(3);
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      const diagrams = page.locator(".lesson-diagram");
      for (const img of await diagrams.all()) {
        await img.scrollIntoViewIfNeeded();
        await expect(img).toHaveAttribute("alt", /\S/);
        await expect
          .poll(() =>
            img.evaluate((el) => (el as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
        route,
      ).toEqual([]);
    }
  }
});
