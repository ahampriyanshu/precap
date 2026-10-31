# Testing, release safety, and architectural evolution

Frontend testing evolved beyond checking pure functions because important failures occur between browser behavior, network timing, rendering, and deployment. A component can pass its tests while a direct route returns 404, a cached chunk disappears, or a keyboard user cannot complete checkout.

Test at boundaries that own meaningful behavior. Keep fast tests for logic, focused integration tests for components and contracts, and browser coverage for critical journeys and platform interactions.

## Begin with invariants and failure consequences

Write down what must remain true. A stale search cannot replace the latest query. A save cannot silently discard a draft after rejection. An account switch cannot reveal the previous account's cached data. A direct resource URL must represent the same resource as client navigation.

These are stronger tests than snapshotting a large DOM. A snapshot can detect a changed class name while missing the race that corrupts state. Use snapshots for stable structured output when reviewing the diff is meaningful, not as a substitute for behavioral assertions.

Pure reducers, serializers, validation, and formatting are cheap to exercise with boundary cases. Component tests verify labels, actions, transitions, and owned effects. Contract tests verify API representation and compatibility. Browser tests verify routing, focus, real layout, storage, and delivery behavior.

## Control time and network order deliberately

An asynchronous test should wait for the outcome that matters, not sleep for an arbitrary duration. Deliberately return the old search after the new one to prove publication ownership. An immediate mock response will never expose that race.

This Playwright integration tests the error path of an existing application; selectors depend on the application's accessible UI:

```typescript
import { test, expect } from "@playwright/test";

test("keeps a draft when saving is rejected", async ({ page }) => {
  await page.route("**/api/documents/42", async route => {
    if (route.request().method() === "PATCH") {
      await route.fulfill({ status: 409, contentType: "application/json",
        body: JSON.stringify({ code: "version_conflict" }) });
    } else {
      await route.continue();
    }
  });
  await page.goto("/documents/42");
  const title = page.getByRole("textbox", { name: "Title" });
  await title.fill("Updated incident review");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("This document changed elsewhere.")).toBeVisible();
  await expect(title).toHaveValue("Updated incident review");
});
```

The API's actual conflict contract may use an ETag precondition and 412 instead; the test should match the implemented contract rather than inventing an alternate status. Selectors based on roles and names exercise part of the accessibility surface and are less coupled to styling than class selectors.

## Use real browsers where the platform matters

DOM emulators are useful for component logic but do not reproduce the entire layout engine, navigation stack, accessibility integration, or service worker lifecycle. Test responsive layouts, sticky elements, dialogs, hydration, and production navigation in a real browser.

Run against the production build for delivery checks. Development mode can alter chunk loading, render behavior, caching, errors, and startup cost. Cover direct navigation and client navigation separately. Test with delayed JavaScript when the architecture promises useful initial HTML.

Automated accessibility scanning is valuable but incomplete. Pair it with keyboard journeys, focus assertions, zoom/reflow, and representative manual assistive-technology checks. A passing scan does not prove that a custom tree control has usable arrow-key behavior.

## A release includes old and new clients

Browsers keep tabs open. CDN nodes and service workers can hold old HTML. A deployment can therefore create several active client versions at once.

```text
Client A: HTML release 17 → references chunk editor.a1.js
Deploy:  release 18 assets uploaded; new HTML published
Client B: HTML release 18 → references chunk editor.b2.js
Client A later opens editor → still needs editor.a1.js
```

Deleting all old chunks breaks Client A. Retain assets according to the maximum realistic client/cache lifetime or implement a deliberate recovery flow. Do not trap users in a reload loop that loses unsaved input.

APIs and persisted schemas need similar compatibility. Add fields before requiring them, accept old payloads during migration, and retire support only with evidence. A feature flag can stop a new UI path, but it cannot automatically reverse a destructive schema migration or recover a lost draft.

## Observe rollout and rollback as product behavior

Attach release identity to errors and experience metrics. Roll out to a small population when the change's risk warrants it, compare relevant cohorts, and define conditions for stopping. Low traffic may require a longer observation window; a global average can hide a severe tenant-specific regression.

Rollback should restore a compatible combination of HTML, assets, API assumptions, feature flags, and persisted data. Reverting one frontend commit is insufficient if an incompatible API deploy has already removed a field. Practice the recovery path for the application's actual hosting and caching model.

## Evolve architecture through seams

Replace a brittle state layer or framework incrementally when a stable seam exists: one route, one domain package, one request adapter, or one shared primitive. Define contracts and instrumentation before changing both sides at once.

An adapter can preserve an existing API while the implementation changes:

```typescript
type SearchResult = { id: string; title: string };
interface SearchService {
  search(query: string, signal: AbortSignal): Promise<SearchResult[]>;
}

function createSearchService(basePath: string): SearchService {
  return {
    async search(query, signal) {
      const response = await fetch(
        `${basePath}?q=${encodeURIComponent(query)}`, { signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: unknown = await response.json();
      return parseSearchResults(data);
    },
  };
}
```

`parseSearchResults` is the application's runtime decoder. Consumers depend on the search contract rather than transport details. The seam can support staged backend changes and deterministic tests without turning every function into a generic framework.

## Review the system through one complete change

For a new editor feature, trace the domain requirement, URL/state owner, API contract, loading and failure states, keyboard behavior, rendering costs, security boundary, tests, and rollout evidence. Each concern should have an owner; none needs a ceremonial document for its own sake.

A staff-level frontend decision explains which constraint is dominant, why the chosen boundary addresses it, what tradeoff remains, and how the team will know when that decision stops fitting. That reasoning is more durable than a preferred library list.
