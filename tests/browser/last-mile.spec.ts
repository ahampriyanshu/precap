import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Last Mile Prep offers three tracks with usable deep links and searchable tool coverage", async ({
  page,
}) => {
  await page.goto("/");
  const card = page.locator(".guide-card-tracks");
  expect(await card.count()).toBe(1);
  await expect(
    card.getByRole("heading", { name: "Last Mile Prep" }),
  ).toBeVisible();
  const tracks = [
    "Incident Triage",
    "Product Management",
    "Telemetry & Observability",
  ];
  await expect(card.locator(".guide-track-list a")).toHaveText(tracks);
  await expect(page.locator(".supplementary-section .guide-card")).toHaveCount(
    5,
  );
  for (const [index, track] of tracks.entries()) {
    await page.goto("/");
    await page
      .locator(".guide-track-list")
      .getByRole("link", { name: track, exact: true })
      .click();
    await expect(page).toHaveURL(`/guides/last-mile-prep/#module-${index + 1}`);
    const heading = page.getByRole("heading", { name: track, exact: true });
    await expect(heading).toBeInViewport();
    const bounds = await heading.boundingBox();
    const header = await page.locator(".site-header").boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
  }
  await page.goto("/guides/last-mile-prep/");
  await expect(page.locator(".playlist-module h2")).toHaveText(tracks);
  await expect(page.locator(".playlist-module li")).toHaveCount(10);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole("link", { name: /Product analytics: PostHog/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Product analytics: PostHog, Pendo, and GA4",
  );
  await expect(
    page.locator(".coding-panel,.diagram-panel,.cm-editor"),
  ).toHaveCount(0);
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
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const search = page.getByRole("textbox", { name: "Search topics" });
  for (const tool of [
    ...tracks,
    "Grafana",
    "New Relic",
    "Sentry",
    "FullStory",
    "Honeybadger",
    "PostHog",
    "Pendo",
    "GA4",
  ]) {
    await search.fill(tool);
    await expect(
      page.locator('.guide-card a[href="/guides/last-mile-prep/"]'),
    ).toBeVisible();
  }
});
