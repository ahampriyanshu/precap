# Navigation, SPAs, and application boundaries

Traditional web navigation replaces the current document with another server response. As applications grew more interactive, repeated full navigations discarded useful client state and repeated shared setup. Single-page applications kept the document alive and moved part of navigation into a client router.

SPAs solved continuity and interaction problems; they also transferred browser responsibilities to application code. Server rendering and client navigation can coexist, so “SPA versus SSR” is not a complete architectural choice.

## A URL is durable application state

The URL should identify the resource and any view state that must survive sharing, refresh, or history traversal. Filters, sorting, selected tabs, and pagination often qualify. An open tooltip, an unsaved password, or a transient animation usually does not.

```javascript
function readOrderView(url = new URL(window.location.href)) {
  const allowed = new Set(["all", "pending", "shipped"]);
  const requested = url.searchParams.get("status") ?? "all";
  return {
    status: allowed.has(requested) ? requested : "all",
    query: (url.searchParams.get("q") ?? "").slice(0, 100),
  };
}

const view = readOrderView();
console.log(view.status, view.query);
```

This browser example validates a small query contract. Do not trust a URL merely because the application generated it previously. Preserve repeated parameters when the contract allows them, define defaults, and avoid storing sensitive data in a URL that can enter logs and history.

Use one source of truth: if the router owns a filter, avoid independently initializing another store and forgetting to update it on Back. Parsing and serialization should be deterministic enough for bookmarks, tests, and cache keys to agree.

## History updates are not navigation implementations

`pushState()` adds a history entry; `replaceState()` modifies the current one. Neither fetches data, renders a screen, updates the title, moves focus, or emits a `popstate` event for that call. History traversal does emit `popstate` when appropriate, and the application must restore the represented view.

For a filter typed continuously, replacing a current entry can prevent every keystroke becoming a Back step. A deliberate navigation should usually create a new entry. Use the product's semantics rather than one global rule.

| Concern | Full document navigation | Client router responsibility |
| --- | --- | --- |
| Direct URL | Server returns matching document | Server must still recognize deep link |
| Resource failure | HTTP status and error document | Route-level error plus useful retry |
| Focus/title | Browser establishes new document context | Application announces the new context |
| Scroll | Browser navigation policy | Explicit restore or framework policy |
| Old view cleanup | Document lifecycle ends | Dispose effects, subscriptions, drafts |

Custom click interception should preserve modified clicks, downloads, cross-origin links, and new tabs. A mature router usually handles these better than a broad `preventDefault` on every anchor.

## Route boundaries organize loading and failure

A route is a natural boundary for code loading, data dependencies, errors, and access control feedback. Start independent route dependencies together. Avoid fetching a user's identity in one component, then an account in its child, then rows in a grandchild when the server could resolve independent inputs in parallel.

Not every spinner should replace the entire page. Retain stable navigation, show pending state near the changing region, and make stale content distinguishable when necessary. A user changing a filter can benefit from the previous results remaining visible, provided the interface does not imply they already satisfy the new filter.

Access control is enforced on the server. A client route guard improves feedback and navigation, but hiding a page does not protect its API. A stale permission cache may need forced invalidation after a role change.

## Choose SPA behavior for its benefits

An internal analytics tool with complex local selections and frequent interactions often benefits from client routing and shared state. A public article page may need little client code. A product site can server-render a public detail page, then use client navigation and an interactive cart.

The key costs are initial code, data waterfalls, server work, hydration, and ongoing interaction work. Evaluate a representative cold visit and a representative repeated navigation separately. A strategy optimized only for the second can make every new user pay a large startup cost.

Prefetching can shorten the next navigation but spends bandwidth and server capacity on intent that may not happen. Respect constrained connections where possible, bound prefetch breadth, and avoid prefetching personalized expensive pages without a clear benefit.

## Application boundaries should follow ownership

Start with a modular application before introducing independently deployed frontend fragments. A component library, package boundary, route boundary, and microfrontend are different scopes of independence.

Microfrontends can help genuinely separate teams release distinct product areas, but introduce shared runtime, dependency, style, routing, authentication, and observability contracts. A shared header duplicated into several independently cached bundles can drift; a shared runtime can become a coordinated-release bottleneck.

Record a boundary decision in operational terms: who deploys it, who owns errors, which data contract crosses it, and how an older consumer behaves after a release. “Use microfrontends because the team is large” does not answer those questions.

## Navigation acceptance checks

Open a deep link in a new tab, refresh it, navigate internally, then use Back and Forward. Check selected filters, document title, focus, scroll, and status codes. Repeat with a missing resource and an expired session.

Unknown paths should not all return a successful app shell that later says “not found.” Crawlers, monitoring, caches, and support tooling need accurate HTTP semantics. Client convenience should preserve the addressable document contract that made the web useful.
