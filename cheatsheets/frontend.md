# Frontend patterns and debugging

Use these checks alongside the recap: platform behavior first, then navigation and rendering strategies, delivery, and auditing. Browser-console snippets operate on the page you are inspecting; framework fragments belong in the relevant application module.

## HTML and forms

Inspect a form's actual submission values, including the names and disabled controls that affect them:

```javascript
const form = document.querySelector("form");
if (form) console.table([...new FormData(form).entries()]);
```

Check the action, method, input labels, required fields, and server response. Native validation is client feedback; repeat validation on the server. Test submission with the keyboard, not only a pointer. Inspect accessible names in the accessibility tree. Use links for destinations and buttons for actions so normal browser behavior remains available.

[Context: HTML structure and native behavior](/guides/engineering/frontend/#html-structure-semantics-and-native-behavior)

## Rendering path

For a cold-load investigation, preserve the Network log, disable cache temporarily, and record a reload in Performance. Inspect resource discovery, blocking requests, style/layout work, paint, and long tasks.

```javascript
const navigation = performance.getEntriesByType("navigation")[0];
if (navigation) console.table({
  responseStart: navigation.responseStart,
  domInteractive: navigation.domInteractive,
  domContentLoaded: navigation.domContentLoadedEventEnd,
  load: navigation.loadEventEnd,
});
```

These are milliseconds from the navigation's time origin, not durations for the named phases. `load` does not mean a SPA has finished loading data. Compare cold and warm runs, then examine the specific critical resource chain. Re-enable cache before assessing normal repeat visits.

[Context: browser rendering](/guides/engineering/frontend/#browser-rendering-from-a-url-to-pixels)

## CSS and layout

In Elements, inspect the winning declaration and computed value before adding another override. Toggle the Grid/Flex overlay and resize with long text and zoom enabled.

```javascript
const element = document.querySelector("main");
if (element) {
  const style = getComputedStyle(element);
  console.table({ display: style.display, width: style.width,
    minWidth: style.minWidth, boxSizing: style.boxSizing });
}
console.log("document overflow", document.documentElement.scrollWidth > innerWidth);
```

Inspect min-content constraints, fixed widths, positioned elements, and images before hiding overflow. Check cascade origin/layer/specificity when a rule is crossed out. Validate visible focus, reduced motion, and contrast in actual states, including disabled and error states.

[Context: CSS cascade and layout](/guides/engineering/frontend/#css-cascade-layout-and-responsive-design)

## JavaScript and scheduling

Use this package-free console probe to distinguish synchronous work, microtasks, and later tasks:

```javascript
const order = [];
order.push("sync");
queueMicrotask(() => order.push("microtask"));
setTimeout(() => console.log([...order, "task"].join(" → ")), 0);
```

Expect `sync → microtask → task`. Profile the real interaction to locate long tasks. Debouncing reduces how often work starts; it does not shorten one expensive execution. A promise chain can keep the main thread busy. For a worker candidate, account for message-transfer cost and keep DOM updates on the main thread.

[Context: JavaScript execution](/guides/engineering/frontend/#javascript-behavior-and-the-event-loop)

## Modules and components

Inspect a production build's route/chunk report or bundle analyzer. Find why a large dependency is imported and whether it is needed before the user's first interaction.

```javascript
// Application fragment: fetch this optional module when the feature opens.
async function openReport() {
  const { showReport } = await import("./report.js");
  showReport();
}
```

Handle chunk-load errors and loading feedback in the actual UI. Lazy imports move download and execution cost to a later point. Review component state ownership: derive values when possible, lift shared state to its common owner, and avoid mirroring the same server record in several independent stores. Run the framework profiler for unnecessary work after a measured slow interaction.

[Context: modules and components](/guides/engineering/frontend/#modules-types-and-components)

## HTTP and state

Use Network throttling or controlled test responses to make an earlier search finish after a later one. Check which response is accepted, then repeat with an HTTP error and during navigation away.

```text
start search A → start search B → resolve B → resolve A
expected view: B
HTTP 500: error state, not a successful empty list
owner disposed: no update published into the replacement view
tenant changed: no reuse of a previous tenant's cached response
```

Record query parameters, identity scope, initiator, response body, and cache behavior. A canceled request may still have reached the server. For writes, verify pending feedback, rejected values, and reconciliation with the accepted server response. Do not log credentials or private data while collecting evidence.

[Context: HTTP and state ownership](/guides/engineering/frontend/#http-asynchronous-data-and-state-ownership)

## MPA and SPA navigation

Verify the route through direct navigation and through an in-app link. The same URL should describe the same intended state.

```text
open /products?q=bag directly → expected initial filtered view
open product → Back          → previous filter and sensible scroll/focus
refresh product URL          → correct document and status
open nonexistent product     → intentional not-found response/view
Ctrl/Cmd-click a link         → normal new-tab navigation
```

Inspect Network to distinguish document requests from router data requests. Confirm document titles and focus changes after navigation. A `pushState()` call does not fire `popstate`; Back/Forward traversal does. Client routing also needs an intentional policy for unsaved input, scroll restoration, and route-loading errors. [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API) details these events.

[Context: MPA and SPA navigation](/guides/engineering/frontend/#mpa-and-spa-who-owns-navigation)

## SSR and hydration

Compare View Source/the document response with the live DOM. Disable JavaScript for one diagnostic run to see which meaningful content arrived as HTML; this is evidence about that response, not a complete rendering-mode classifier.

```text
server HTML + initial data → client first render should match
mismatch → inspect time/random values, locale, browser-only state,
           invalid HTML nesting, data changes, extensions or DOM mutation
slow interactivity → inspect shipped JS, parsing, execution and hydration
```

Hydration warnings are useful evidence. Suppressing them does not reconcile different business state. Reproduce with a production build and the same locale/data snapshot. For streaming, delay one dependency and confirm that the shell, boundary fallback, error state, and final region make sense independently.

[Context: SSR and hydration](/guides/engineering/frontend/#ssr-initial-html-hydration-and-streaming)

## Static generation

Verify where the artifact comes from and what changes when source content changes:

```text
build revision A → inspect generated HTML and asset URLs
change source to B without rebuilding → exported artifact remains A
build/publish B → inspect origin and CDN response versions
old HTML still references old assets → those assets must remain available
```

Check generated route coverage, 404 behavior, metadata, and private data exclusion. Static pages may load live data after arrival; inspect both the document and subsequent requests. Measure build duration and invalidation cost as route count grows. A file host cannot execute request-time framework APIs just because the source uses a framework.

[Context: static site generation](/guides/engineering/frontend/#ssg-render-once-and-serve-the-artifact)

## Incremental regeneration

Test a real production-mode runtime with a controllable source revision. Development-mode rendering is not evidence that production regeneration works.

```text
prime route at A → publish B → request before expiry → inspect response
request after expiry → identify stale response and regeneration
request after successful regeneration → expect B
fail regeneration → observe retained artifact/error policy
invalidate on publish → check origin, CDN and existing client views
```

Record source revision, cache identity, timestamps, and runtime logs. Check simultaneous requests and content removal as well as updates. Time-based expiry may need a request to trigger work. Keep transactional checks such as stock validation outside a stale public artifact. Review the exact framework/hosting cache configuration rather than inferring it from an HTTP header alone; [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting) covers cache coordination across instances.

[Context: incremental regeneration](/guides/engineering/frontend/#isr-regenerate-shared-pages-as-content-changes)

## Server and client boundaries

In an App Router codebase, trace a client boundary through its imports:

```text
server page → server data access + permitted serialized props
            → interactive client leaf → browser event/state APIs

review: which imports enter the client graph?
        which values cross into HTML/RSC payloads?
        which code is genuinely request-specific versus cached?
```

Inspect the production browser chunks and payloads. A server-rendered page can contain client components; `use client` does not mean its initial markup must be absent from HTML. Keep secrets out of serialized props and client-delivered environment variables. Verify cache and personalization behavior independently of the component's label. [Next.js boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components) explain the module split.

[Context: server and client rendering boundaries](/guides/engineering/frontend/#server-and-client-boundaries-in-modern-frameworks)

## Delivery and caching

For a URL you control, inspect headers and then verify them in the browser with normal cache behavior:

```bash
curl --head --silent --show-error 'https://example.com/'
```

Use the actual GET when HEAD behavior differs. Check `Cache-Control`, validators, content encoding, CDN policy, and the cache key. Public immutable assets need content-addressed URLs; personal responses need a deliberate storage policy. Inspect whether the LCP image is discovered early and delivered at the right size. Avoid preloading everything: critical resources compete for bandwidth too.

[Context: asset delivery and HTTP caching](/guides/engineering/frontend/#delivery-assets-http-caching-and-perceived-speed)

## Browser security

This detached-element probe demonstrates plain-text insertion without executing or inserting untrusted markup:

```javascript
const element = document.createElement("div");
element.textContent = '<img src=x onerror="alert(1)">';
console.log(element.children.length); // 0
```

Review actual DOM sinks, rich-text sanitization, URL handling, and serialized initial data. Inspect CSP violations, cookie attributes, session expiry, and CSRF defenses for cookie-authenticated actions. Verify server authorization by changing a resource ID in an isolated test account. A successful CORS preflight says nothing about that user's permission to mutate the resource.

[Context: browser trust boundaries](/guides/engineering/frontend/#security-the-browser-is-a-trust-boundary)

## Website auditing

Use a repeatable journey, device/network profile, data set, cache condition, and build revision. Retain before/after traces, not just the aggregate score.

```text
Lighthouse/DevTools: reproducible lab diagnostics
RUM/CrUX:           real-user distribution where data is available
Network:            request chain, bytes, server wait, cache behavior
Performance:        input delay, JS, style/layout, paint, frames
Accessibility:      automated checks + keyboard/screen-reader journeys
SEO:                status, indexability, metadata, canonical/rendered content
```

Review LCP, INP, and CLS at the 75th percentile and segment by useful cohorts. Lab blocking metrics can help diagnose responsiveness; they are not a substitute for field INP. Follow one expensive interaction through the trace. Confirm that a faster trace corresponds to a usable loading/error state and improved field behavior after release.

[Context: auditing a website](/guides/engineering/frontend/#auditing-measure-the-user-journey-and-locate-the-cost)

## Testing and release

Use this matrix against the production build and a controlled backend fixture:

```text
calculation rules     → unit tests, including invalid/boundary inputs
form/component        → user interaction, validation, state transitions
critical browser flow → navigation, network failures, keyboard, layout
deployment overlap    → old tab/new assets/API; refresh and lazy chunks
post-release          → error rate, vital metrics, business journey success
```

Test direct URLs as well as client navigation, race responses deliberately, and inspect browser errors. Check a 320px viewport and zoom instead of assuming device emulation covers layout. Keep meaningful assertions about visible behavior and accepted server state. Preserve compatible assets/API responses through rollout and rollback windows.

[Context: frontend testing and release](/guides/engineering/frontend/#testing-and-release-protect-behavior-across-delivery-modes)
