import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const recaps = [
  { slug: "frontend", title: "Frontend Engineering" },
  { slug: "backend", title: "Backend Engineering" },
];

test("Engineering exposes independent frontend, backend and DevOps recaps with related references", async ({
  page,
}) => {
  await page.goto("/");
  const engineering = page.locator(".guide-card").filter({
    has: page.getByRole("heading", { name: "Engineering", exact: true }),
  });
  await expect(engineering.locator(".guide-parts a")).toHaveCount(3);
  await expect(engineering.locator(".guide-part-number")).toHaveCount(0);
  await expect(
    engineering.getByRole("link", { name: "DevOps", exact: true }),
  ).toHaveAttribute("href", "/guides/engineering/devops/");
  for (const recap of recaps) {
    await page.goto(`/guides/engineering/${recap.slug}/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      recap.title,
    );
    await expect(page.locator(".lesson-kicker")).toHaveText(
      "Engineering · Complete recap",
    );
    await expect(
      page.getByRole("link", { name: "Next part", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Previous part", exact: true }),
    ).toHaveCount(0);
    await expect(page.locator(".related-recaps a")).toHaveCount(2);
    await expect(
      page.getByRole("link", { name: /^Open .*patterns and debugging$/ }),
    ).toHaveAttribute("href", `/cheatsheets/${recap.slug}/`);
    await expect(page.locator(".coding-panel, .diagram-panel")).toHaveCount(0);
    await page
      .getByRole("link", { name: /^Open .*patterns and debugging$/ })
      .click();
    await expect(page).toHaveURL(`/cheatsheets/${recap.slug}/`);
    await expect(
      page.getByRole("article", {
        name: `${recap.title} cheatsheet`,
        exact: true,
      }),
    ).toBeVisible();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
  }
});

test("frontend and backend reference sections preserve context on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const recap of recaps) {
    const route = `/guides/engineering/${recap.slug}/`;
    const sheet = `/cheatsheets/${recap.slug}/`;
    await page.goto(route);
    const links = await page
      .locator(`.prose a[href^="${sheet}#"]`)
      .evaluateAll((entries) =>
        entries.map((entry) => ({
          href: entry.getAttribute("href")!,
          text: entry.textContent!,
        })),
      );
    expect(links.length).toBeGreaterThan(0);
    for (const [index, link] of links.entries()) {
      await page.getByRole("link", { name: link.text, exact: true }).click();
      await expect(page).toHaveURL(link.href);
      await expect(
        page.locator(`#${link.href.split("#")[1]}`),
      ).toBeInViewport();
      const back = page.locator(`.prose a[href^="${route}#"]`).nth(index);
      const href = (await back.getAttribute("href"))!;
      await back.click();
      await expect(page).toHaveURL(href);
      await expect(page.locator(`#${href.split("#")[1]}`)).toBeInViewport();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const open = page.getByRole("button", { name: "Open guide navigation" });
    await open.click();
    await expect(
      page.getByRole("dialog", { name: "Guide navigation" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(open).toBeFocused();
  }
  await page.goto("/");
  for (const term of ["hydration", "idempotency"]) {
    await page.getByRole("textbox", { name: "Search topics" }).fill(term);
    await expect(
      page.locator(".guide-card").filter({
        has: page.getByRole("heading", { name: "Engineering", exact: true }),
      }),
    ).toBeVisible();
    await expect(page.locator(".cheatsheet-row")).toHaveCount(1);
  }
});
