import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const recap = "/guides/engineering/devops/";
const sheet = "/cheatsheets/devops/";

test("DevOps sections and command workflows link to each other without a practice runtime", async ({
  page,
}) => {
  const runtime: string[] = [];
  page.on("request", (request) => {
    if (/pyodide|python\.worker|python-harness/.test(request.url()))
      runtime.push(request.url());
  });
  await page.goto(recap);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "From first deploy to production",
  );
  await expect(page.locator(".article-outline")).not.toHaveAttribute("open");
  await page.locator(".article-outline summary").click();
  await expect(
    page.getByRole("navigation", { name: "On this page" }).getByRole("link"),
  ).toHaveCount(13);
  const links = await page
    .locator(`.prose a[href^='${sheet}#']`)
    .evaluateAll((entries) =>
      entries.map((entry) => ({
        href: entry.getAttribute("href")!,
        text: entry.textContent!,
      })),
    );
  expect(links).toHaveLength(13);
  for (const [index, link] of links.entries()) {
    await page.getByRole("link", { name: link.text, exact: true }).click();
    await expect(page).toHaveURL(link.href);
    const anchor = link.href.split("#")[1];
    await expect(page.locator(`#${anchor}`)).toBeInViewport();
    const section = page.locator(`.prose a[href^="${recap}#"]`).nth(index);
    const back = (await section.getAttribute("href"))!;
    await section.click();
    await expect(page).toHaveURL(back);
    await expect(page.locator(`#${back.split("#")[1]}`)).toBeInViewport();
  }
  await page.goto(sheet);
  await expect(
    page
      .getByRole("navigation", { name: "Cheatsheets", exact: true })
      .getByRole("link", { name: "DevOps commands and workflows" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.locator(".coding-panel, .diagram-panel, .cm-editor"),
  ).toHaveCount(0);
  expect(runtime).toEqual([]);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});

test("cheatsheets are searchable, mobile navigation works, and old DevOps links reach the recap", async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("textbox", { name: "Search topics" }).fill("terraform");
  await expect(page.locator(".cheatsheet-row")).toHaveCount(1);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Cheatsheets", exact: true })
    .click();
  await expect(page.locator("#cheatsheets")).toBeInViewport();
  await page.locator(".cheatsheet-row").click();
  await expect(page).toHaveURL(sheet);
  const open = page.getByRole("button", { name: "Open cheatsheet navigation" });
  await open.click();
  await expect(
    page.getByRole("dialog", { name: "Cheatsheet navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await page.locator(".article-outline summary").click();
  await page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link", { name: "Kubernetes and Helm", exact: true })
    .click();
  await expect(page.locator("#kubernetes-and-helm")).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.goto("/guides/devops/production/");
  await expect(page).toHaveURL(recap);
  await page.goto("/guides/devops/deploying/");
  await expect(page).toHaveURL(`${recap}#start-with-a-deployment-contract`);
  await page.goto("/guides/devops/scaling/");
  await expect(page).toHaveURL(`${recap}#scale-the-constrained-resource`);
  await expect(
    page.locator("#scale-the-constrained-resource"),
  ).toBeInViewport();
  const noScript = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3100",
  });
  try {
    const fallback = await noScript.newPage();
    for (const alias of ["production", "deploying", "scaling"]) {
      await fallback.goto(`/guides/devops/${alias}/`);
      await expect(fallback).toHaveURL(new RegExp(`${recap}(#|$)`));
      await expect(fallback.getByRole("heading", { level: 1 })).toHaveText(
        "From first deploy to production",
      );
    }
  } finally {
    await noScript.close();
  }
});
