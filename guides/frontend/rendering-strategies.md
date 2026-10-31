# CSR, SSR, SSG, and incremental regeneration

Server-generated HTML existed before single-page applications. Client rendering moved more UI work into the browser to support rich interaction; modern systems combine both to balance first-view latency, personalization, freshness, and delivery cost.

Choose rendering time, rendering location, caching, and interactivity separately. A static page can be interactive. A server-rendered page can use client navigation. A request-rendered page can still be fast or slow depending on its dependencies.

## Follow the critical path for each strategy

Client-side rendering often begins with a small HTML shell, followed by JavaScript download and execution, API data, and component rendering. Server-side rendering can move data access and initial HTML production before the browser's first view, while adding work to the request path.

![CSR waits for browser code and data before main content; SSR sends content after request-time work; SSG serves a prebuilt artifact; regeneration replaces a reusable artifact after invalidation.](/diagrams/frontend-rendering-strategies.svg)

An SSR response does not necessarily contain every useful region immediately; streaming can deliver parts incrementally. An SSG artifact can still need client requests for private or fast-changing data. Measure the critical path of the actual route rather than treating the acronym as a performance guarantee.

| Strategy | HTML produced | Useful fit | Primary cost or risk |
| --- | --- | --- | --- |
| CSR | In browser | Highly interactive authenticated tools | Startup code and data waterfalls |
| SSR | Per request | Request-specific initial content | Backend latency and render capacity |
| SSG | Before request | Stable public content | Build scale and stale artifacts |
| Regenerated static output | On selected invalidations or requests | Large public catalog with bounded staleness | Invalidation and regeneration semantics |

## SSR gives HTML early; hydration adds behavior

Hydration connects client logic to matching server output. It requires compatible initial inputs and markup. Time, random numbers, browser-only storage, user locale, and data races can produce mismatches if server and client render different first views.

This React client-entry fragment assumes the server rendered the same `App` with the same public initial data:

```tsx
import { hydrateRoot } from "react-dom/client";
import { App } from "./App";

const root = document.getElementById("root");
const initial = document.getElementById("initial-data");
if (!root || !initial?.textContent) throw new Error("Missing initial document");

const data = JSON.parse(initial.textContent);
hydrateRoot(root, <App initialData={data} />);
```

The server must serialize embedded JSON safely for its HTML context; raw `JSON.stringify` output placed inside a script element can contain a closing script sequence. Use a trusted framework serializer. Initial props are public bytes, so exclude secrets and unauthorized fields.

Browser-dependent preferences can be applied after hydration or represented consistently through a server-readable mechanism. Avoid hiding genuine mismatches through broad warning suppression. A visually correct recovery can still cause duplicated work, lost input, or delayed interactivity.

SSR improves neither every interaction nor every resource. Sending the same enormous client bundle still incurs download, parse, and execution costs. A slow synchronous server call can delay the first byte for everyone.

## SSG moves computation out of the request path

Static generation produces HTML and assets ahead of requests. A file host or CDN can serve them without an application renderer. This is attractive for documentation, editorial content, and stable public pages with predictable updates.

```text
Content revision C17
  → build produces HTML plus hashed assets
  → upload assets
  → publish HTML pointing at those assets
  → invalidate or revalidate mutable entry documents
```

The release must be coherent. Retain prior assets while old HTML and tabs may reference them. A million-page rebuild may require selective generation, a different content partition, or a request-capable strategy. Static generation does not solve arbitrary freshness or private personalization.

When a static route loads private data after initial display, render a truthful neutral state rather than baking one user's data into a public artifact. The private response also needs appropriate cache headers and identity separation.

## Incremental regeneration needs a freshness contract

Regeneration reuses an artifact and replaces it after an invalidation or expiry policy. In a stale-while-revalidate implementation, a request can receive an old artifact while another process generates a new one. Framework and hosting semantics vary; the word “ISR” alone does not establish exactly when a user sees fresh content.

```text
12:00  revision A generated
12:02  regeneration becomes eligible
12:03  request gets A; refresh starts
12:03  refresh fails; old A may remain available
12:05  later refresh succeeds; B is published
```

An interval commonly determines eligibility, not a guaranteed publication deadline. Define the business allowance: a product description may lag by minutes; a checkout inventory decision cannot rely on that stale page. Validate authoritative values when accepting the operation.

Control concurrent fills, failure behavior, invalidation propagation, and monitoring. A content-publish event may need to invalidate a detail page, category listing, search representation, and client cache. Treat that as an explicit dependency graph. A file-only static host cannot run regeneration without an additional compatible service.

## Cache headers are part of rendering architecture

These illustrative policies belong to different resources:

```http
# Public content-hashed asset
Cache-Control: public, max-age=31536000, immutable

# HTML allowed to be stored, but validated before reuse
Cache-Control: no-cache
ETag: "release-42"

# Sensitive personalized representation
Cache-Control: private, no-store
```

`no-cache` permits storage with validation; `no-store` instructs caches not to store. A CDN configuration can also affect delivery. A private route must not become publicly cacheable merely because its HTML resembles a public page. If `Vary` is used, understand how each variant affects cache correctness and hit rate.

## Decide per route and region

For a product detail route, prebuild stable public descriptions, deliver optimized images through immutable assets, and obtain current stock from an authoritative API. For an account dashboard, request-specific rendering may provide a useful initial view, while client caching supports later interactions. For a canvas editor, client computation can dominate even if its surrounding shell is server-rendered.

Write down the first-view target, freshness allowance, privacy boundary, fallback when rendering fails, and deployment capability. Then test cold and warm paths, JavaScript delay, stale regeneration, origin failure, and an old tab during a release. Rendering strategy is a resource and correctness decision, not a universal ranking.
