# Performance, auditing, and production diagnosis

Frontend performance moved from “how fast did the page load?” to a broader problem: when useful content appears, whether the interface responds, whether it moves unexpectedly, and how those outcomes vary across real devices. Lab tools reveal mechanisms; production measurements reveal who experiences them.

A useful audit connects a user-visible failure to its critical path, changes the relevant mechanism, and verifies the result under comparable conditions. A score without that chain is difficult to act on.

## Define the journey and its population

Measure a cold product detail visit, a search interaction, or an editor save—not an abstract average page. Separate first navigation from client navigation, slow phones from developer laptops, and affected releases from the whole history.

Core Web Vitals describe distinct outcomes. Common good thresholds are assessed at the 75th percentile of real visits:

| Metric | Good threshold | Meaning |
| --- | --- | --- |
| Largest Contentful Paint | At most 2.5 seconds | Main visible content appears |
| Interaction to Next Paint | At most 200 milliseconds | Interaction response reaches a presentation |
| Cumulative Layout Shift | At most 0.1 | Unexpected layout movement remains small |

These are experience signals rather than complete product correctness. A page can have good vitals while returning the wrong result. Segment carefully: a small affected region can disappear in a healthy global percentile. Low traffic also limits confidence.

## Attribute load time to a dependency

For slow LCP, distinguish server response time, delayed resource discovery, resource transfer, and delay between a resource becoming ready and being painted. The dominant term determines the useful change.

```text
Navigation start               0 ms
HTML first byte              250 ms
App JavaScript evaluated    1200 ms
Hero URL discovered         1250 ms
Hero downloaded             1650 ms
Hero painted                1720 ms
```

In this illustrative trace, compressing the hero by 25% cannot recover the 1000 ms spent before its discovery. Putting the actual image in initial HTML may help more. Conversely, adding SSR to a page whose initial HTML already contains the image would miss that diagnosis.

Provide correctly sized image candidates and explicit dimensions:

```html
<img src="/images/product-800.webp"
     srcset="/images/product-400.webp 400w,
             /images/product-800.webp 800w,
             /images/product-1200.webp 1200w"
     sizes="(min-width: 60rem) 50vw, 100vw"
     width="1200" height="800"
     alt="The blue travel bag with its front pocket open">
```

The `sizes` value must describe the layout's actual slot. Do not lazy-load the likely primary above-the-fold image. Reserve space for images, embeds, and late content; a loading skeleton with different final geometry still shifts.

Fonts can delay or shift text. Choose subsets and formats deliberately, preload only truly critical files, and use a fallback strategy with compatible metrics where possible. Every preload is a resource-priority decision.

## Attribute interaction latency to work

An interaction's latency includes waiting before its handler, handler execution, and presentation work after it. A short click handler can feel slow because another task already blocks the thread or because the resulting render creates thousands of elements.

Memoization helps only when it avoids sufficiently expensive repeated work and its dependencies remain stable. Virtualization reduces rendered rows but brings focus, sizing, selection, and accessibility obligations. A server-filtered list can remove work entirely rather than rendering fewer members of an enormous local result.

Measure one application operation with browser performance marks:

```javascript
performance.mark("filter-start");
const visible = rows.filter(matchesCurrentFilter);
renderRows(visible);
performance.mark("filter-dom-updated");
performance.measure("filter-to-dom-update",
  "filter-start", "filter-dom-updated");
```

This browser integration assumes the application owns `rows`, the predicate, and the rendering function. The measure ends after synchronous DOM updates; it does not prove a frame has been presented. Use a performance trace and appropriate interaction instrumentation to analyze presentation. Keep measurement names bounded rather than embedding user IDs or arbitrary queries in telemetry.

## Worked diagnosis: a filter becomes sluggish

Suppose a release raises filtered-list interaction latency from an illustrative 120 ms to 620 ms on midrange phones. API latency remains unchanged. A trace shows:

```text
Input delay:             40 ms
Filter handler:          20 ms
Component rendering:    350 ms
Style/layout/paint:     210 ms
```

The handler is not the primary cost. Inspection finds that every keystroke rerenders 800 rows, each recalculates a rich preview, and the page reads row geometry after each write. Three changes target distinct costs: isolate the input's urgent state, avoid recomputing unchanged previews, and remove the read/write layout loop. A bounded visible list may be appropriate after checking keyboard and screen-reader behavior.

Repeat the same dataset, device class, and interaction trace. Then compare production latency by release and device. If server timing changes during rollout, control for it before attributing every improvement to the frontend patch. Record what remains expensive so the next team does not infer that a deferred render is free work.

## Real-user telemetry should be useful and bounded

Collect JavaScript errors, resource-load failures, relevant experience metrics, and domain outcomes such as save acceptance or search availability. Attach release, route template, and coarse environment information. Avoid raw URLs containing private queries, form contents, access tokens, or unbounded identifiers.

Use a maintained metric implementation for production Core Web Vitals: page lifecycle, visibility, interaction grouping, and navigation restoration have details that a one-callback example omits. For custom measures, define units and lifecycle. An operation spanning retries should have an overall outcome as well as individual attempts.

Sampling reduces cost but can hide rare failures. Preserve high-value failures carefully and apply server-side ingestion limits. Telemetry should not become a new long task or synchronous unload dependency. Delivery can be best effort; do not use an analytics event as the authoritative record of a purchase.

## Accessibility, security, and memory belong in the audit

A performance audit should not accidentally remove focus outlines, delay essential validation, or expose private data to a global cache. Automated accessibility scans cover only part of behavior. Test actual keyboard tasks and changing state.

For memory, compare equivalent post-cleanup states across repeated interactions. A larger cache may deliberately trade memory for speed; its size and eviction still need bounds. Track listeners, workers, detached nodes, and large data arrays through their owners.

## Set budgets around the product's constraints

Useful budgets cover route startup bytes, expensive third-party scripts, critical journey latency, memory growth, and regressions by device cohort. A hard byte limit without context can reward splitting code into more expensive requests; a single desktop Lighthouse number can miss slow-phone failures.

Keep a repeatable production-build lab profile, review meaningful regressions in CI, and confirm field effects after rollout. A gradual release and reliable rollback make measurement actionable. The strongest optimization report states the affected journey, measured bottleneck, mechanism changed, before/after evidence, and remaining limits.
