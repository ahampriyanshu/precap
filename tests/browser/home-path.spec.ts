import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("first visit asks for a language and presents the ordered interview path", async ({
  page,
}) => {
  await page.goto("/");
  const language = page.getByRole("combobox", {
    name: "Programming language",
    exact: true,
  });
  await expect(language).toHaveValue("python");
  await expect(page.locator(".site-header a")).toHaveCount(1);
  await expect(page.locator(".learning-path > li h2")).toHaveText([
    "Machine coding",
    "System design basics",
    "Low-level design",
    "High-level design",
  ]);
  await expect(page.locator(".track-python")).toBeVisible();
  await language.selectOption("go");
  await expect(language).toHaveValue("go");
  await expect(page.locator(".track-go")).toBeVisible();
  for (const section of ["courses", "guides", "cheatsheets"]) {
    await page.goto(`/#${section}`);
    const anchor = await page.locator(`#${section}`).boundingBox();
    const header = await page.locator(".site-header").boundingBox();
    expect(anchor!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
  }

  await expect(
    page.locator(".track-python,.track-java,.track-cpp,.track-javascript"),
  ).toHaveCount(0);
  await expect(page.locator(".track-dsa .course-start")).toHaveAttribute(
    "href",
    "/learn/dsa/01-arrays-and-linear-scans/go/",
  );
  await expect(page.locator(".track-lld .course-start")).toHaveAttribute(
    "href",
    "/learn/lld/01-parking-lot/go/",
  );
  await page.reload();
  await expect(language).toHaveValue("go");
  await expect(page.locator(".supplementary-section .guide-card")).toHaveCount(
    4,
  );
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});

test("language preference stays in sync across navbar, guides, tabs and practice routes", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("python");
  const second = await context.newPage();
  await second.goto("/guides/frontend/");
  await expect(
    second.getByRole("combobox", { name: "Programming language", exact: true }),
  ).toHaveValue("python");
  await second
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("java");
  await expect(
    page.getByRole("combobox", { name: "Programming language", exact: true }),
  ).toHaveValue("java");
  await expect(page.locator(".track-java")).toBeVisible();
  await page.goto("/learn/lld/01-parking-lot/go/practice/");
  await page
    .getByRole("textbox", { name: "Go code editor", exact: true })
    .fill("// preserved Go draft\n");
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("cpp");
  await expect(page).toHaveURL("/learn/lld/01-parking-lot/cpp/practice/");
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("go");
  await expect(
    page.getByRole("textbox", { name: "Go code editor", exact: true }),
  ).toContainText("preserved Go draft");
  await page.goto("/");
  await expect(
    page.getByRole("combobox", { name: "Programming language", exact: true }),
  ).toHaveValue("go");
  await second.close();
});

test("invalid or unavailable preference storage keeps first-visit choice usable on mobile", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("precap:practice-language:v1", "invalid-language");
  });
  await page.setViewportSize({ width: 320, height: 820 });
  await page.goto("/");
  const language = page.getByRole("combobox", {
    name: "Programming language",
    exact: true,
  });
  await expect(language).toHaveValue("python");
  await language.selectOption("cpp");
  await expect(page.locator(".track-cpp")).toBeVisible();
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

test("source choice remains usable when preference writes are blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "precap:practice-language:v1")
        throw new DOMException("Storage full", "QuotaExceededError");
      return set.call(this, key, value);
    };
  });
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("javascript");
  await expect(
    page.getByRole("combobox", { name: "Programming language", exact: true }),
  ).toHaveValue("javascript");
  await expect(page.locator(".track-javascript")).toBeVisible();
  await page
    .locator('.supplementary-section a[href="/guides/frontend/"]')
    .click();
  await expect(
    page.getByRole("combobox", { name: "Programming language", exact: true }),
  ).toHaveValue("javascript");
});

test("foundation links use real lessons and language changes preserve noncoding pages", async ({
  page,
}) => {
  await page.goto("/");
  const startButton = page.locator(
    '.path-step:has-text("System design basics") .course-start',
  );
  await expect(startButton).toHaveAttribute(
    "href",
    "/guides/backend/requests-and-protocols/",
  );
  await startButton.click();
  await expect(page).toHaveURL("/guides/backend/requests-and-protocols/");
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("go");
  await expect(page).toHaveURL("/guides/backend/requests-and-protocols/");
  await page.goto("/learn/hld/01-url-shortener/");
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("java");
  await expect(page).toHaveURL("/learn/hld/01-url-shortener/");
  await page.goto("/learn/go/01-types-zero-values-and-control/practice/");
  await page
    .getByRole("combobox", { name: "Programming language", exact: true })
    .selectOption("java");
  await expect(page).toHaveURL(
    "/learn/java/01-values-references-and-null/practice/",
  );
});
