# precap

A compact refresher for senior and staff engineers before interviews. Revisit the reasoning behind deploying, operating, and evolving software, alongside coding and system design practice.

## Field guides

Engineering groups independent one-page recaps for Frontend Engineering, Backend Engineering, and DevOps. Frontend and Backend follow the fundamentals in dependency order: explain the mechanism, show a focused example, then connect its limits to the next approach. Frontend moves from HTML/CSS/JavaScript and browser rendering to navigation, SSR/SSG/ISR, delivery, and auditing. Backend moves from the request lifecycle and execution to APIs, storage, concurrency, and production operation. The other guide areas have two connected reads. Guides are reading-only.

| Area | Reading |
| --- | --- |
| Engineering | [Frontend Engineering](guides/engineering/frontend.md) · [Backend Engineering](guides/engineering/backend.md) · [DevOps](guides/engineering/devops.md) |
| Telemetry & observability | [Follow a failure across the system](guides/observability/signals.md) · [Turn telemetry into reliability decisions](guides/observability/reliability.md) |
| Product management | [Choose the problem before the solution](guides/product-management/discovery.md) · [Ship, measure, and make the next call](guides/product-management/delivery.md) |
| LLMs & AI | [Put the model in the right place](guides/llms-and-ai/designing.md) · [Evaluate, launch, and operate it](guides/llms-and-ai/operating.md) |

`guides.json` defines the catalog; `sequential: false` groups independent recaps without part numbering or next-part navigation. Optional part labels keep navigation concise, and aliases can preserve old guide paths. Content lives in `guides/<area>/<part>.md`. The site exports these at `/guides/<area>/<part>/`. Coding and design lessons retain their `/learn/` routes and `curriculum.json` manifest.

## Cheatsheets

[Frontend patterns and debugging](cheatsheets/frontend.md), [Backend patterns and debugging](cheatsheets/backend.md), and [DevOps commands and workflows](cheatsheets/devops.md) provide focused patterns, diagnostics, and operational flows for their corresponding recap. Every workflow links to its matching recap section, and every recap section links back to its commands. The homepage and reference sidebar expose this section; topic search includes its tool and workflow keywords.

`cheatsheets.json` defines the reference catalog; Markdown lives in `cheatsheets/<slug>.md` and exports at `/cheatsheets/<slug>/`. Legacy DevOps URLs redirect to the relevant section of the DevOps recap under Engineering. Long pages have a collapsible section index.

## Website

```bash
npm ci
npm run dev             # http://localhost:3000
npm run build           # static export in out/
npm start               # serve the production export
```

Use Node.js 20.9 or later. Read a lesson first, then select **Open practice** for coding or **Open design canvas** for HLD. The practice page places the brief on the left and the editor or canvas on the right, separated by a vertical divider. On narrow screens, they stack. Drag the divider to resize the panes, or use its arrow controls to collapse either pane. Drag to an edge to collapse it; double-click the divider to reset the split. The header controls also hide or restore either pane. Your split width is remembered in this browser. There is no editor beside the reading material.

Coding drafts and progress save in this browser. HLD opens an Excalidraw canvas with a design brief and notes; diagrams (including embedded images), notes, and explicit self-review status save per lesson in IndexedDB on this device. Export a `.excalidraw` file to keep an editable copy; Excalidraw’s menu imports drawings and exports images. HLD has no Python execution or automated grading. Diagram progress is marked **Reviewed** by the learner and clears when the design or notes change.

Download a coding exercise to keep a copy of its README, your code and its tests. Python runs on your device in a fresh Pyodide WebAssembly worker for every attempt. Runtime assets and fonts are hosted with the site. Stop terminates the worker; execution is bounded to 15 seconds after loading. Native thread/process exercises offer a download for local Python; asyncio and garbage collection exercises run in the browser.

## Local Python practice

Use Python 3.11 or later; exercises need only the standard library.

```bash
python3 run.py --list
python3 run.py --check
python3 run.py python/01-primitive-types --stage prototype
python3 run.py python/01-primitive-types --stage final
```

Each coding directory has one README.md, an unfinished exercise.py, and tests in main.py. HLD directories contain a design lesson and Excalidraw brief in README.md; use the website’s design canvas for those. Read the Practice section for the exact API. Complete the prototype first, then the final implementation. Tests check behavior and edge cases; they do not prove an algorithm's complexity. No answer keys are included. From a lesson directory, run `python3 main.py --stage prototype` or `python3 main.py --stage final`.

## Development checks

```bash
npm run typecheck
npm run format:check
npm test
npm run test:browser     # after npm run build
```

Browser tests use installed Chrome on macOS; set CHROME_PATH elsewhere. Set PORT to choose the preview port. Any static host with directory-index support can serve out/; serve .wasm files as application/wasm.

## Python

- [Primitive data types](python/01-primitive-types/README.md) — Numbers, text, booleans, and explicit conversion.
- [Collections and mutability](python/02-collections-and-mutability/README.md) — Lists, tuples, sets, dictionaries, and shared references.
- [Control flow](python/03-control-flow/README.md) — Conditions, loops, and comprehensions.
- [Functions](python/04-functions/README.md) — Parameters, return values, scope, and reusable behavior.
- [Errors and exceptions](python/05-errors-and-exceptions/README.md) — Raise clear errors and catch failures at useful boundaries.
- [Modules, files, and JSON](python/06-modules-files-and-json/README.md) — Import reusable code and exchange structured data.
- [Classes and objects](python/07-classes-and-objects/README.md) — Keep related state and behavior together.
- [Inheritance and composition](python/08-inheritance-and-composition/README.md) — Substitute compatible objects and assemble behavior.
- [Dataclasses and type hints](python/09-dataclasses-and-type-hints/README.md) — Describe records and communicate expected types.
- [Iterators and generators](python/10-iterators-and-generators/README.md) — Produce values lazily instead of storing every result.
- [Closures and decorators](python/11-closures-and-decorators/README.md) — Capture configuration and wrap function calls.
- [Context managers](python/12-context-managers/README.md) — Restore state and release resources reliably.
- [Equality and hashing](python/13-equality-and-hashing/README.md) — Design stable value objects for dictionaries and sets.
- [Properties and descriptors](python/14-properties-and-descriptors/README.md) — Control attribute access without changing the public syntax.
- [Threads and locks](python/15-threads-and-locks/README.md) — Share memory safely and wait for work to finish.
- [Thread-safe queues](python/16-thread-safe-queues/README.md) — Pass work between producers and consumers.
- [Futures and executors](python/17-futures-and-executors/README.md) — Submit work, retrieve results, and propagate failures.
- [Processes and isolation](python/18-processes-and-isolation/README.md) — Use independent interpreters for parallel work.
- [Asyncio and cooperative concurrency](python/19-asyncio-and-cooperative-concurrency/README.md) — Await nonblocking work and bound concurrent tasks.
- [Memory and garbage collection](python/20-memory-and-garbage-collection/README.md) — References, cyclic garbage, weak caches, and memory diagnosis.

## Data structures and algorithms

- [Arrays and linear scans](dsa/01-arrays-and-linear-scans/README.md) — Accumulators, indices, and loop invariants.
- [Strings and frequency maps](dsa/02-strings-and-frequency-maps/README.md) — Counting repeated values with dictionaries.
- [KMP string search](dsa/03-kmp-string-search/README.md) — Reuse matched prefixes instead of repeating comparisons.
- [Prefix sums](dsa/04-prefix-sums/README.md) — Answer repeated range totals after one preprocessing pass.
- [Sliding windows with counts](dsa/05-sliding-window/README.md) — Maintain the longest contiguous range with at most k distinct values.
- [Sorting and two pointers](dsa/06-sorting-and-two-pointers/README.md) — Discard impossible pairs using sorted order.
- [Binary search on the answer](dsa/07-binary-search-on-the-answer/README.md) — Find the first feasible value of a monotone predicate.
- [Linked lists and node identity](dsa/08-linked-lists/README.md) — Remove nodes by changing links while retaining surviving objects.
- [Stacks and nested operations](dsa/09-stacks-and-nested-operations/README.md) — Validate last-in-first-out order with a stack.
- [Monotonic deques](dsa/10-monotonic-deques/README.md) — Keep only useful candidates for sliding-window maxima.
- [Heaps and k-way merge](dsa/11-heaps-and-k-way-merge/README.md) — Merge sorted sequences through a small priority frontier.
- [Greedy interval scheduling](dsa/12-greedy-interval-scheduling/README.md) — Maximize the number of compatible intervals by earliest finish time.
- [Dynamic programming: minimum coins](dsa/13-dynamic-programming-minimum-coins/README.md) — Reuse answers to smaller amounts when greedy choices fail.
- [0/1 knapsack](dsa/14-zero-one-knapsack/README.md) — Choose each item at most once under a capacity bound.
- [Edit distance](dsa/15-edit-distance/README.md) — Compare string prefixes with a two-dimensional recurrence.
- [Backtracking and pruning](dsa/16-backtracking-and-pruning/README.md) — Explore partial assignments and undo choices that lead to failure.
- [Binary trees and level-order traversal](dsa/17-binary-trees-and-level-order/README.md) — Use a queue to visit nodes by depth.
- [Binary search trees](dsa/18-binary-search-trees/README.md) — Maintain ordered keys and find floor values.
- [Tries and prefix search](dsa/19-tries-and-prefix-search/README.md) — Index shared prefixes for exact completion queries.
- [Graphs and breadth-first search](dsa/20-graphs-and-breadth-first-search/README.md) — Find shortest hop counts by exploring one layer at a time.
- [Topological sorting](dsa/21-topological-sorting/README.md) — Order directed dependencies and detect cycles.
- [Dijkstra shortest paths](dsa/22-dijkstra-shortest-paths/README.md) — Settle the cheapest frontier distance when all edge weights are nonnegative.
- [Bellman–Ford shortest paths](dsa/23-bellman-ford-shortest-paths/README.md) — Relax all edges and detect source-reachable negative cycles.
- [Floyd–Warshall all-pairs shortest paths](dsa/24-floyd-warshall-all-pairs/README.md) — Build a complete distance matrix by allowing intermediate vertices.
- [Kruskal and disjoint sets](dsa/25-kruskal-and-disjoint-sets/README.md) — Build a minimum spanning tree by joining separate components.
- [Prim minimum spanning trees](dsa/26-prim-minimum-spanning-trees/README.md) — Grow a cheapest connection frontier directly from a dense matrix.
- [Fenwick trees](dsa/27-fenwick-trees/README.md) — Support point additions and range sums through binary-sized blocks.
- [Segment trees](dsa/28-segment-trees/README.md) — Combine interval summaries and repair them after point replacements.

## Low-level design

Fifteen familiar design problems. Each lesson explains the problem, a naive approach, its failure cases, a better design with costs and tradeoffs, and practical uses before opening the exercise. All fifteen run in the browser. The eight in-memory system topics adapt the local `industry_coding_playlist`; seven additional problems cover object state, bounded resources, reservations, and expense accounting.

- [Parking Lot](lld/01-parking-lot/README.md) — Compatible allocation and ticket lifecycle.
- [Vending Machine](lld/02-vending-machine/README.md) — Atomic purchase and credit ownership.
- [Library Management System](lld/03-library-management/README.md) — Title identity, copies, and loan ownership.
- [LRU Cache](lld/04-lru-cache/README.md) — Recency ownership and bounded cache state.
- [Rate Limiter](lld/05-rate-limiter/README.md) — Per-client sliding windows and explicit time.
- [Banking System](lld/06-banking-system/README.md) — Atomic transfers, validation, and idempotency.
- [Transactional Key-Value Store](lld/07-transactional-key-value-store/README.md) — Nested transactions and rollback boundaries.
- [In-Memory Database](lld/08-in-memory-database/README.md) — TTL, conditional updates, and version history.
- [Document Search Engine](lld/09-document-search-engine/README.md) — Tokenization, positional indexes, and stale updates.
- [Task Scheduler](lld/10-task-scheduler/README.md) — Priority dispatch, worker quotas, and expiring leases.
- [Recipe Manager](lld/11-recipe-manager/README.md) — Permissions and immutable revision history.
- [Message Broker](lld/12-message-broker/README.md) — Independent delivery state and bounded retries.
- [File Storage System](lld/13-file-storage-system/README.md) — Quota accounting and explicit expiration.
- [Meeting Room Booking System](lld/14-meeting-room-booking/README.md) — Interval conflicts and atomic room allocation.
- [Expense Sharing System](lld/15-expense-sharing/README.md) — Integer accounting and idempotent operations.

## High-level design

Fifteen familiar system design problems. Each lesson works through requirements, scale, request flows, failure cases, architecture choices, and tradeoffs. Practice opens an Excalidraw canvas with a system-specific brief, failure scenarios, and a self-review checklist. Draw and justify the architecture; your diagram and notes save per lesson on this device. Export an editable drawing or use Excalidraw’s image export. There are no HLD code stubs or test cases.

- [URL Shortener](hld/01-url-shortener/README.md) — Authoritative claims and cached reads.
- [API Rate Limiter](hld/02-api-rate-limiter/README.md) — Shared quotas and outage policy.
- [Distributed Cache](hld/03-distributed-cache/README.md) — Stable routing during topology changes.
- [Distributed Key-Value Store](hld/04-distributed-key-value-store/README.md) — Quorum reads and version reconciliation.
- [File Storage Service](hld/05-file-storage-service/README.md) — Multipart integrity and publication.
- [Content Delivery Network](hld/06-content-delivery-network/README.md) — Cache identity, freshness, and refresh ownership.
- [Distributed Message Queue](hld/07-distributed-message-queue/README.md) — Partition ownership and contiguous consumer commits.
- [Notification Service](hld/08-notification-service/README.md) — Transactional outbox and bounded provider retries.
- [Chat System](hld/09-chat-system/README.md) — Conversation sequence, retries, and reconnect cursors.
- [News Feed](hld/10-news-feed/README.md) — Hybrid fanout and stable feed pagination.
- [Video Streaming Platform](hld/11-video-streaming-platform/README.md) — Versioned jobs and complete manifest publication.
- [Web Crawler](hld/12-web-crawler/README.md) — Fair host scheduling and retry eligibility.
- [Search Engine](hld/13-search-engine/README.md) — Partitioned ranking and index visibility.
- [Metrics and Monitoring System](hld/14-metrics-and-monitoring/README.md) — Bounded cardinality and mergeable histograms.
- [Ticket Booking System](hld/15-ticket-booking-system/README.md) — Expiring ownership and payment compensation.

## Writing lessons

Write for senior and staff engineers: introduce the decision or mechanism briefly, show a small concrete code or configuration example, then explain its observed behavior, invariant, and failure boundary. Replace repetitive prose rather than appending examples. Show enough of a mechanism to make it inspectable without supplying the complete practice implementation.

Prefer self-contained examples with visible results. Label integration fragments, schema assumptions, placeholders, and runtime requirements explicitly; distinguish a database guarantee from an external side effect. Keep HLD architecture practice diagram-based and field guides reading-only. Verify executable snippets before publishing and preserve the existing exercise contracts when changing teaching material.

Keep sections concise while covering the complete progression. Use a cheatsheet for operational commands and longer flows, and link each flow to the context that explains when it is useful. Validate both directions of the section links; distinguish read-only diagnostics from operations that change a target.
