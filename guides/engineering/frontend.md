# Frontend Engineering

HTML describes the page, CSS controls its presentation, and JavaScript adds behavior and client-side application logic. The browser turns those inputs into an interactive interface. Frameworks change how we author and deliver them; the underlying rendering, networking, and execution costs still apply.

Start with that platform, then follow the reasons for components, single-page navigation, server rendering, static generation, and caching. Each section connects the mechanism to a practical decision and a way to inspect it.

## HTML: structure, semantics, and native behavior

HTML gives content meaning: headings establish hierarchy, links navigate, buttons perform actions, and forms submit named values. The browser builds the Document Object Model (DOM) from this markup. Assistive technologies also use the semantics exposed through the accessibility tree.

A product search can work before any application JavaScript loads:

```html
<main>
  <h1>Products</h1>
  <form action="/products" method="get">
    <label for="search">Search products</label>
    <input id="search" name="q" type="search">
    <button type="submit">Search</button>
  </form>
  <a href="/products/42">View the travel bag</a>
</main>
```

Submitting sends the search as a URL query parameter; the server must implement that route. The label supplies an accessible name, and the link supports bookmarks, new tabs, and normal keyboard navigation. Recreating these controls with clickable containers means rebuilding their behavior, focus handling, and semantics. Start with the native element and enhance it when the interaction requires more. [HTML forms](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form) define the browser's submission contract.

[Reference: inspect HTML and forms](/cheatsheets/frontend/#html-and-forms)

## Browser rendering: from a URL to pixels

A navigation may involve DNS, connection establishment, TLS, and an HTTP response; caches and reused connections can skip parts of that work. As HTML arrives, the browser discovers subresources and parses a DOM. CSS contributes style rules; style calculation determines computed values. Layout establishes geometry, paint records visual output, and compositing assembles layers for display.

The dependencies matter more than a rigid timeline: parsing, downloading, and incremental rendering overlap. A classic parser-inserted script can pause HTML parsing; relevant stylesheets can delay rendering. Module scripts are deferred by default:

```html
<link rel="stylesheet" href="/assets/site.css">
<script type="module" src="/assets/catalog.js"></script>
<img src="/images/bag.webp" alt="Blue travel bag"
     width="640" height="480">
```

The browser can reserve the image's space before downloading it. In contrast, an undiscovered hero image, a blocking script, or a late font can delay or shift useful content. After load, DOM and style changes may trigger further style, layout, or paint work. A transform can sometimes be handled during compositing, but layer promotion is an engine decision with memory costs. Inspect the actual waterfall and rendering trace. [MDN's rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path) explains the stages.

[Reference: inspect the rendering path](/cheatsheets/frontend/#rendering-path)

## CSS: cascade, layout, and responsive design

CSS maps document structure to presentation. The cascade selects declarations using origin, importance, layers, specificity, and ordering; inheritance supplies some values from ancestors. The box model then relates content, padding, border, and margin. Flexbox handles one-dimensional arrangements; Grid handles rows and columns together.

A responsive product grid needs a rule for available space rather than a fixed desktop width:

```css
*, *::before, *::after { box-sizing: border-box; }
.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 1rem;
}
.product { min-width: 0; overflow-wrap: anywhere; }
.product img { display: block; width: 100%; height: auto; }
:focus-visible { outline: 2px solid #165d42; outline-offset: 3px; }
```

The inner `min()` allows the column to shrink below 16rem on a narrow screen. Long text and intrinsic minimum sizes otherwise commonly cause overflow. Design tokens, component scoping, and deliberate cascade layers keep a growing stylesheet understandable. Repeated `!important` overrides usually hide an ownership problem. Test zoom, long content, reduced motion, and keyboard focus alongside breakpoints. [The cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction) is the basis for diagnosing which rule wins.

[Reference: debug CSS and layout](/cheatsheets/frontend/#css-and-layout)

## JavaScript: behavior and the event loop

JavaScript handles events, coordinates requests, updates the DOM, and runs client-side business logic such as calculating a displayed subtotal. The server still validates authoritative prices and permissions. Within a browser agent, a JavaScript job runs to completion. Long synchronous work can delay input handling and rendering.

Promises do not automatically move computation to another thread. Promise reactions run as microtasks, which are drained before the next task and can themselves delay rendering:

```javascript
console.log("start");
setTimeout(() => console.log("timer"), 0);
Promise.resolve().then(() => console.log("promise"));
console.log("end");
```

This prints `start`, `end`, `promise`, `timer`. A zero-delay timer becomes eligible later; it is not an immediate interrupt. Adding `async` to an expensive sort still executes that sort on the current thread. Reduce work, split it into bounded tasks, or use a Web Worker for suitable CPU-heavy work. Workers communicate through messages and cannot directly manipulate the document. [JavaScript's execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model) explains tasks and microtasks.

[Reference: inspect JavaScript scheduling](/cheatsheets/frontend/#javascript-and-scheduling)

## Modules, types, and components

Once behavior spans several screens, global functions and scattered DOM updates become difficult to coordinate. Modules make dependencies explicit. TypeScript checks assumptions during development; it does not validate an API response at runtime. Components package a view with the state and behavior it owns.

A minimal React component demonstrates the model: state changes, then the view is derived from that state.

```tsx
import { useState } from "react";

export function Quantity() {
  const [quantity, setQuantity] = useState(1);
  return (
    <button type="button" onClick={() => setQuantity(q => q + 1)}>
      Quantity: {quantity}
    </button>
  );
}
```

This fragment requires a React/JSX build; an App Router client entry also needs its client boundary. A bundler resolves and transforms the module graph, can split chunks, and optimizes production output. Splitting by route or rare feature avoids making every user download an editor or charting library immediately. Tree shaking depends on analyzable modules and side effects. Component reuse improves ownership; excessive abstraction and a single global state store can obscure it. [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) are the underlying dependency mechanism.

[Reference: inspect modules and component state](/cheatsheets/frontend/#modules-and-components)

## HTTP, asynchronous data, and state ownership

Fetching data introduces time and failure into the view. Distinguish local interaction state, shareable URL state, and server-owned records. A filter belongs in the URL when refresh, Back, or a shared link should reproduce it. A fetched product price remains server-owned even if a client cache stores a copy.

For a live search, accepting only the latest request prevents an old response from replacing a newer result. This browser fragment assumes `show()` renders loading, ready, and error states:

```javascript
let generation = 0;
let controller;
async function searchProducts(query) {
  const mine = ++generation;
  controller?.abort();
  controller = new AbortController();
  show({ kind: "loading" });
  try {
    const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`,
      { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();
    if (mine === generation) show({ kind: "ready", products });
  } catch (error) {
    if (mine === generation && error.name !== "AbortError") {
      show({ kind: "error" });
    }
  }
}
```

Cancellation reduces obsolete work; the generation check decides which result may publish. Invalidate the generation and abort when the owner is disposed. Debouncing reduces traffic but does not establish response order. For writes, show pending and rejected states, reconcile with the server's accepted representation, and use the API's concurrency and retry contract. Client caching needs identity, freshness, invalidation, and tenant-change rules. [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) resolves normally for HTTP error responses, so check the status.

[Reference: inspect requests and state](/cheatsheets/frontend/#http-and-state)

## MPA and SPA: who owns navigation

In a multi-page application (MPA), navigation normally requests another HTML document. This gives links, history, and fresh page state a straightforward lifecycle. For highly interactive interfaces, repeatedly replacing the document can discard useful state and repeat shared work. Single-page applications (SPAs) keep a document alive and let a client router replace the relevant view.

The distinction is visible in the request flow:

```text
MPA: link → GET /products/42 → new HTML document
SPA: link → client router → load code/data → update current document

Both must support: direct /products/42 load, refresh, Back, Forward,
                   focus, page title, errors, and scroll restoration.
```

Client routing can make repeat navigation responsive, but a large initial JavaScript bundle and client-side data waterfalls can delay the first useful view. The server must also recognize deep links. A broad fallback that returns 200 for every unknown URL hides real 404s. Calling `pushState()` updates history; it does not render the view or fetch data. SPA navigation and server rendering can coexist: one describes later navigation, the other where initial content is produced. [History API behavior](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API) explains the responsibilities routers take on.

[Reference: verify navigation behavior](/cheatsheets/frontend/#mpa-and-spa-navigation)

## SSR: initial HTML, hydration, and streaming

Server-side rendering (SSR) produces HTML on the server for a request. It predates SPAs; modern frameworks combine server-generated initial content with client navigation. A purely client-rendered page may need HTML, JavaScript execution, and an API round trip before its main content exists. SSR can deliver that content in the first document, helping first-load usability and consumers that need HTML.

In a React application, hydration connects the client component tree to matching server-generated markup. This is a client-entry fragment; the server must have rendered the same `App` with the same initial data:

```tsx
import { hydrateRoot } from "react-dom/client";
import { App } from "./App";

const data = JSON.parse(document.getElementById("initial-data")!.textContent!);
hydrateRoot(document.getElementById("root")!, <App initialData={data} />);
```

Embed that JSON with a safe framework serializer: unescaped `<` sequences can terminate a script element; [OWASP's output-encoding guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) explains why encoding depends on context. Random values, locale differences, or reading browser-only state during initial rendering can cause hydration mismatches. SSR still pays server work and may send substantial client JavaScript. Streaming can release a shell and completed regions while slower regions wait; it does not make dependencies faster. Place useful loading and error boundaries around independently meaningful content. [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot) requires matching initial output.

[Reference: diagnose SSR and hydration](/cheatsheets/frontend/#ssr-and-hydration)

## SSG: render once and serve the artifact

Static site generation (SSG) runs rendering ahead of requests, commonly during a build. The result can be served by a file host or CDN, removing per-request rendering work for that artifact. Documentation, public help pages, and infrequently changed landing pages often fit this model.

The build and request paths have different responsibilities:

```text
Build:   content snapshot → render HTML/assets → publish versioned output
Request: CDN/file host → previously generated HTML
Update:  edit source → rebuild affected output → publish → refresh caches
```

Static does not mean non-interactive: generated HTML can load JavaScript for search, forms, or client navigation. It means that HTML was generated before this request. The tradeoff is freshness and build work. A million product pages may make full rebuilds expensive; user-specific account balances cannot be baked into a shared public artifact. Separate stable public content from private or rapidly changing data, and define how readers get a coherent release. A plain static export also has no request-time application server. [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports) illustrate this deployment boundary.

[Reference: verify static generation](/cheatsheets/frontend/#static-generation)

## ISR: regenerate shared pages as content changes

Incremental static regeneration (ISR) keeps the reusable-page benefit of static generation while allowing pages to be regenerated without rebuilding the whole site. In a stale-while-revalidate flow, a request can receive the old artifact while the server generates a replacement. Time-based expiry and on-demand invalidation provide different freshness controls.

Consider a public product description with a one-minute revalidation interval:

```text
12:00:00  page generated from content revision A
12:00:30  request receives A
12:01:10  first request after expiry may receive A; regeneration starts
12:01:11  successful regeneration publishes B
later     requests receive B until another invalidation/revalidation
```

The interval is an eligibility rule, not a promise that every viewer sees a change exactly one minute later. Regeneration failures, CDN policy, concurrent fills, and client caches affect the outcome. Use this for content with an explicit staleness allowance; validate inventory and price again when an order is accepted. Test content publishing, failed regeneration, and cache invalidation end to end. ISR requires a compatible runtime or hosting service; this site's file-only export cannot perform it. [Next.js ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration) documents its framework-specific behavior.

[Reference: verify incremental regeneration](/cheatsheets/frontend/#incremental-regeneration)

## Server and client boundaries in modern frameworks

Rendering location, rendering time, and browser interactivity are separate decisions. A route can combine cached public content, request-specific server data, and a small interactive client component. In the Next.js App Router, Server Components run on the server; Client Components provide state, event handlers, and browser APIs. Client Components may still be prerendered into the initial HTML.

Keep an interactive boundary small. This is the client module for the earlier quantity component:

```tsx
"use client";
import { useState } from "react";

export default function AddButton({ productId }: { productId: number }) {
  const [added, setAdded] = useState(false);
  return <button onClick={() => setAdded(true)}>
    {added ? `Selected ${productId}` : "Select product"}
  </button>;
}
```

Selection here is only local UI state; creating a cart item still needs an authorized server mutation. Placing a client boundary high in the module graph pulls more dependencies into browser-delivered code. Keep secrets and privileged data access server-side, serialize only permitted data, and pass stable initial values into interactive leaves. Server Components can reduce shipped JavaScript; they do not remove request latency or the need for caching decisions. [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) describes the boundary.

[Reference: review server and client boundaries](/cheatsheets/frontend/#server-and-client-boundaries)

## Delivery: assets, HTTP caching, and perceived speed

Rendering strategy cannot compensate for oversized assets or delayed discovery. Compress text responses, send correctly sized images, split rarely used code, and prioritize genuinely critical resources. Reserve image dimensions and use a font-loading strategy that balances readable fallback text with layout stability.

Choose cache rules by resource identity. These are separate response-header examples:

```http
# Content-hashed public asset: changing bytes creates a new URL
Cache-Control: public, max-age=31536000, immutable

# HTML that may be stored but must be validated before reuse
Cache-Control: no-cache
ETag: "page-revision-17"

# Sensitive personalized response that must not be stored
Cache-Control: private, no-store
```

`no-cache` permits storage and requires validation; `no-store` instructs caches not to store. Shared HTML caching needs a correct identity and personalization policy. A cache-busted filename helps only while older HTML can still fetch its referenced assets, so retain assets across rolling releases. Lazy-load below-the-fold images; delaying the likely LCP image can hurt the metric you are trying to improve. [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) explains freshness and validation.

[Reference: inspect delivery and caching](/cheatsheets/frontend/#delivery-and-caching)

## Security: the browser is a trust boundary

Any client-delivered value can be inspected or changed. Browser validation improves feedback, while the backend enforces permissions, prices, and state transitions. Treat API responses and user-entered content as data when inserting them into the document.

For plain text, use a text sink:

```javascript
const label = document.createElement("span");
label.textContent = "<strong>Special offer</strong>";
console.log(label.children.length, label.textContent);
```

This creates no child element: the markup remains literal text. Rich HTML needs context-appropriate sanitization; URLs need their own protocol and destination rules. Content Security Policy adds another defensive layer. With cookie-based sessions, account for CSRF, cookie attributes, and session expiry. CORS controls which browser origins may read cross-origin responses; it is not API authorization and does not stop every cross-origin request. Avoid exposing secrets in public environment variables or serializing private data into rendered pages. [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) describes that browser-enforced boundary.

[Reference: review browser security boundaries](/cheatsheets/frontend/#browser-security)

## Auditing: measure the user journey and locate the cost

An audit starts with a representative page and interaction: a cold product-page load, a filter change, or submitting checkout on a slow phone. Lab tools such as Lighthouse and DevTools give reproducible traces; real-user measurements show device, network, geography, and release variation. One desktop score cannot represent every user.

Core Web Vitals summarize distinct outcomes. Assess the 75th percentile, segmented appropriately:

| Metric | Good threshold | First investigation |
| --- | --- | --- |
| LCP: main content becomes visible | ≤ 2.5 seconds | TTFB, resource discovery, image download, render delay |
| INP: interaction responsiveness | ≤ 200 milliseconds | Input delay, handler work, presentation delay |
| CLS: unexpected visual movement | ≤ 0.1 | Missing dimensions, inserted content, font changes |

These are the current [Core Web Vitals](https://web.dev/articles/vitals) thresholds. Use the metric to choose a trace, then attribute time to actual work:

```text
Slow load  → Network waterfall → document wait or critical resource chain?
Slow click → Performance trace → long task, layout, or too much rendering?
Growing tab→ Memory snapshots  → retained listeners, nodes, or cached data?
Bad access→ keyboard + accessibility tree → name, role, focus, announcement?
```

Also inspect status codes, canonical URLs, metadata, structured data where relevant, and rendered content for discoverability. Automated accessibility checks find a subset of issues; test keyboard journeys and representative screen-reader behavior manually. Fix the measured bottleneck, rerun under the same conditions, and confirm the field outcome after release.

[Reference: run a website audit](/cheatsheets/frontend/#website-auditing)

## Testing and release: protect behavior across delivery modes

Test pure calculations cheaply, component interactions at their ownership boundary, and critical journeys in a real browser. A client-routed visit and a direct server request exercise different paths. Hydration, caches, and built asset references also behave differently in a production build than in a development server.

A small release matrix catches failures a happy-path component test misses:

```text
Direct URL + refresh       correct content, status, metadata
Client navigation + Back  URL, selection, scroll and focus agree
Slow/error response       pending state, retry policy, preserved input
JavaScript delayed        useful HTML/native behavior where designed
Old tab + new deployment  referenced chunks still load; writes stay compatible
Keyboard + narrow viewport usable controls, focus, no document overflow
```

Make assertions about observable behavior rather than component internals. Use controlled network responses for failure cases, inspect accessibility, and track JavaScript errors and vital metrics by release. A gradual rollout gives those measurements time to expose regressions; rollback must account for cached HTML, assets, and API compatibility together.

[Reference: verify a frontend release](/cheatsheets/frontend/#testing-and-release)
