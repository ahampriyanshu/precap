import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("reading pairs explanations with copyable examples on desktop and mobile", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const routes = [
    "/guides/engineering/frontend/",
    "/guides/engineering/backend/",
    "/cheatsheets/frontend/",
    "/cheatsheets/backend/",
    "/learn/python/20-memory-and-garbage-collection/",
    "/learn/dsa/01-arrays-and-linear-scans/",
    "/learn/lld/01-parking-lot/",
    "/learn/hld/01-url-shortener/",
    "/guides/engineering/devops/",
    "/guides/observability/signals/",
    "/guides/product-management/discovery/",
    "/guides/llms-and-ai/designing/",
  ];
  for (const route of routes) {
    await page.goto(route);
    const examples = page.locator(".prose .code-example");
    expect(await examples.count(), route).toBeGreaterThan(0);
    const colors = await examples
      .locator(".code-token")
      .evaluateAll((tokens) => [
        ...new Set(tokens.map((token) => getComputedStyle(token).color)),
      ]);
    expect(colors.length, `syntax colors on ${route}`).toBeGreaterThan(1);
    await expect(examples.first().locator("figcaption")).toBeVisible();
    await expect(
      examples.first().getByRole("button", { name: /^Copy .+ code$/ }),
    ).toBeVisible();
    await expect(page.locator(".coding-panel, .diagram-panel")).toHaveCount(0);
  }
  const example = page.locator(".code-example").first();
  const displayed = await example.locator("pre code").innerText();
  await example.getByRole("button", { name: /^Copy .+ code$/ }).click();
  await expect(example.getByRole("status")).toHaveText("Copied");
  expect(
    (await page.evaluate(() => navigator.clipboard.readText())).trimEnd(),
  ).toBe(displayed);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn/hld/01-url-shortener/");
  await expect(
    page.getByRole("link", { name: "Open design canvas", exact: true }),
  ).toHaveCount(1);
  await page.locator(".code-example").first().scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const code = page.locator(".code-example pre").first();
  await code.focus();
  await expect(code).toBeFocused();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});

test("highlighted source arrives without JavaScript and preserves literal markup", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  try {
    const page = await context.newPage();
    await page.goto("/guides/engineering/frontend/");
    const code = page.locator(".prose .code-example pre code");
    const html = code.filter({
      hasText: '<form action="/products" method="get">',
    });
    await expect(html).toContainText(
      '<input id="search" name="q" type="search">',
    );
    await expect(html.locator("form, input, button")).toHaveCount(0);
    const tokens = await html.locator(".code-token").count();
    expect(tokens).toBeGreaterThan(0);
    await expect(html.locator("..")).toHaveCSS(
      "background-color",
      "rgb(13, 17, 23)",
    );
    const literal = code.filter({
      hasText: 'label.textContent = "<strong>Special offer</strong>";',
    });
    await expect(literal).toContainText("<strong>Special offer</strong>");
    await expect(literal.locator("strong")).toHaveCount(0);
  } finally {
    await context.close();
  }
});
