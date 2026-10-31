import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const { cheatsheets } = JSON.parse(fs.readFileSync("cheatsheets.json", "utf8"));
test("tool cheatsheets are searchable and link back to a relevant lesson", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".cheatsheet-row")).toHaveCount(cheatsheets.length);
  await page.getByRole("textbox", { name: "Search topics" }).fill("terraform");
  await expect(page.locator(".cheatsheet-row")).toHaveCount(1);
  await page.locator(".cheatsheet-row").click();
  await expect(page).toHaveURL("/cheatsheets/terraform/");
  for (const sheet of cheatsheets) {
    await page.goto(`/cheatsheets/${sheet.slug}/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      sheet.title,
    );
    await expect(page.locator(".reference-context-link")).toHaveAttribute(
      "href",
      `/guides/${sheet.guide.slug}/${sheet.guide.part}/`,
    );
    await expect(page.locator(".code-example").first()).toBeVisible();
    await expect(page.locator(".prose a[href^='http']")).toHaveCount(0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const open = page.getByRole("button", { name: "Open cheatsheet navigation" });
  await open.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("removed broad cheatsheets lead to the relevant curriculum index", async ({
  browser,
  baseURL,
}) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ baseURL, javaScriptEnabled });
    try {
      const page = await context.newPage();
      for (const slug of ["frontend", "backend", "devops"]) {
        await page.goto(`/cheatsheets/${slug}/`);
        await expect(page).toHaveURL(`/guides/${slug}/`);
        await expect(page.locator(".playlist-module").first()).toBeVisible();
      }
    } finally {
      await context.close();
    }
  }
});
