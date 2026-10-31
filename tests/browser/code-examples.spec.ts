import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("reading pairs explanations with copyable examples on desktop and mobile", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const routes = [
    "/guides/frontend/html-forms-and-semantics/",
    "/guides/backend/requests-and-protocols/",
    "/cheatsheets/git/",
    "/cheatsheets/docker/",
    "/learn/python/20-memory-and-garbage-collection/",
    "/learn/dsa/01-arrays-and-linear-scans/",
    "/learn/lld/01-parking-lot/",
    "/learn/hld/01-url-shortener/",
    "/guides/devops/processes-and-first-deploy/",
    "/guides/last-mile-prep/signals-and-instrumentation/",
    "/guides/last-mile-prep/requirements-and-audience/",
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
    await page.goto("/guides/frontend/html-forms-and-semantics/");
    const code = page.locator(".prose .code-example pre code");
    const html = code.filter({
      hasText: '<form action="/orders" method="get">',
    });
    await expect(html).toContainText(
      '<input id="order-query" name="q" type="search" maxlength="100">',
    );
    await expect(html.locator("form, input, button")).toHaveCount(0);
    const tokens = await html.locator(".code-token").count();
    expect(tokens).toBeGreaterThan(0);
    await expect(html.locator("..")).toHaveCSS(
      "background-color",
      "rgb(13, 17, 23)",
    );
    await page.goto("/guides/frontend/browser-security/");
    const literal = page
      .locator(".code-example pre code")
      .filter({ hasText: "label.textContent = value;" });
    await expect(literal).toContainText('<img src=x onerror="alert(1)">');
    await expect(literal.locator("img,script")).toHaveCount(0);
  } finally {
    await context.close();
  }
});
