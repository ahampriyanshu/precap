# Requests, caches, and consistency in the interface

An interface that reads only local state has a straightforward order of events. Networks introduce delay, duplication, partial failure, and disagreement between clients. Request libraries and client caches arose to manage those repeated coordination problems, not merely to shorten `fetch()` calls.

The browser owns a useful representation of server data. It rarely owns the final truth about inventory, permissions, balances, or whether a mutation committed.

## A request needs an outcome model

A fetch promise rejects for certain transport and cancellation failures, but an HTTP 404 or 500 normally resolves to a response. Check the status, decode the expected content type, and validate the representation before publishing it.

Loading, empty, stale, rejected, and unavailable are different states. An empty result says a query completed successfully with no matches. An error says the application does not know the result. Replacing either with an endless spinner conceals information needed for recovery.

Avoid component-by-component waterfalls when requests are independent. Start independent work together; keep dependent operations sequential. Parallelism still needs a concurrency budget: launching hundreds of requests can overload the origin, client, and connection rather than improve latency.

## Request completion order is not intent order

Suppose a user searches `ca`, then `camera`. The first query may finish last. Debouncing reduces frequency; it does not establish which result is allowed to update the view.

This browser helper exposes a cancellation-aware owner. `publish` is supplied by the caller and receives state objects:

```javascript
function createSearch(publish) {
  let generation = 0;
  let active;

  return {
    async run(query) {
      const mine = ++generation;
      active?.abort();
      const controller = new AbortController();
      active = controller;
      publish({ kind: "loading", query });
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rows = await response.json();
        if (!Array.isArray(rows)) throw new Error("Invalid search response");
        if (mine === generation) publish({ kind: "ready", query, rows });
      } catch (error) {
        if (mine === generation && !controller.signal.aborted) {
          publish({ kind: "failed", query, message: String(error) });
        }
      }
    },
    dispose() {
      generation += 1;
      active?.abort();
    },
  };
}
```

The array check is intentionally minimal; a real contract also validates row fields. The generation establishes publication ownership even if cancellation arrives too late. Disposing invalidates pending results before stopping local work. A cache library should provide equivalent race and lifecycle guarantees rather than just a shared object.

## A cache needs identity, freshness, and invalidation

A key such as `orders` is incomplete if results vary by tenant, user, filter, sort, cursor, locale, or permission scope. Reusing a cache after logout or tenant switch can expose the previous identity's records even without making a network request.

![A response passes through CDN, browser HTTP cache, application query cache, and component state; each layer has its own key, freshness, and invalidation policy.](/diagrams/frontend-cache-layers.svg)

| Cache concern | Design question | Common failure |
| --- | --- | --- |
| Identity | Which inputs change the representation? | Cross-tenant or wrong-filter data |
| Freshness | How old may this view be? | A stale balance looks authoritative |
| Invalidation | Which writes make which reads obsolete? | Detail changes but list stays old |
| Lifetime | When may unused data be evicted? | An unbounded long-lived tab |
| Failure | May stale data remain visible after a failed refresh? | Good data disappears behind a spinner |

Application staleness settings do not automatically change HTTP headers, CDN caching, server caches, or another tab's memory. Name each layer when diagnosing “the cache.” A successful mutation should reconcile accepted server data and invalidate affected views, including aggregate counts and paginated lists when relevant.

## Writes require a concurrency contract

Optimistic UI applies an anticipated outcome before the server accepts it. It is valuable for reversible operations whose failure can be explained. A rollback to an old snapshot is unsafe if another optimistic operation has since changed that snapshot; track operations or versioned patches rather than restoring arbitrary historical state.

For editing a shared resource, the API can use an ETag precondition. These are illustrative HTTP messages:

```http
PATCH /api/documents/42
Content-Type: application/json
If-Match: "revision-17"

{"title":"Incident review"}
```

The server accepts only if the precondition matches its current representation, then returns the accepted state and new validator. A `412 Precondition Failed` tells the editor to reload, merge, or present a conflict; silently overwriting defeats the mechanism.

For a retryable business action, an idempotency key identifies one logical operation. Reuse it after an ambiguous network failure; generating a new key for each retry can create duplicate orders. The backend must implement deduplication scope, retention, payload agreement, and response semantics. Disabling a button only prevents one class of accidental double click.

## Trace an uncertain save

Consider this sequence:

```text
1. Browser sends operation K with document revision 17.
2. Server commits revision 18 and records K's outcome.
3. Connection closes before the browser receives the response.
4. Browser displays "Save status unknown", retaining the draft.
5. Browser retries K or queries operation status.
6. Server returns the existing accepted outcome; no second mutation occurs.
```

“Request failed” is too imprecise here. The response failed to arrive; the operation may have succeeded. A well-designed interface distinguishes rejection from uncertainty and provides a safe recovery path. Retry only eligible operations, bound retries, and use backoff with jitter. Respect rate-limit guidance rather than amplifying an outage.

## Pagination is also a consistency decision

Offset pagination can skip or repeat items as new rows enter a changing list. Cursor pagination describes a position in an ordered result, but needs a stable tie-breaker and a policy for deleted or changed records. Deduplicating by ID hides repeated rows; it cannot prove the browser has seen every row.

For a live operational list, decide whether new rows appear immediately, wait behind a “new items” control, or belong to a refreshed snapshot. An interface that keeps moving the selected row while an operator acts can be technically fresh and operationally unsafe.

## Test the interleavings, not just the success response

Delay the old search response until the new one appears. Change tenant while a request is pending. Return a conflict after local optimistic edits. Simulate a committed write whose response is lost. Remount a view while a shared request is in flight.

Each test asks who may publish a result and which state the user can trust. That is the core contract a request layer must uphold.
