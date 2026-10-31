# API contracts, representation, and pagination

An API exists so independently changing callers can rely on stable behavior. The hard part is rarely routing a URL to a function. It is defining identity, changes, errors, retries, and result sets precisely enough that a mobile client, a background job, and an older deployment can coexist.

Resource-oriented HTTP, RPC, and GraphQL organize contracts differently. None removes the need for bounded work, authorization, compatibility, or a clear source of truth.

## Design around a business operation

An order command carries requested items; it should not let the caller choose an authoritative price or payment status. Distinguish public input from stored representation and internal command types. Reusing an ORM model as an unrestricted request schema can expose fields that were never meant to be writable.

This exchange sketch makes a few decisions visible:

```text
POST /api/orders
Idempotency-Key: 3538df59-20c1-4f2a-b7ca-3108c4cce602
Content-Type: application/json
{"items":[{"sku":"BAG-42","quantity":2}]}

201 Created
Location: /api/orders/91
{"id":91,"state":"awaiting_payment","total_minor":25800,"currency":"USD"}
```

The authenticated principal supplies identity and permitted tenant scope. The server resolves prices and records the result. Define whether order creation reserves stock, how long a reservation survives, and whether payment is synchronous. Returning `202 Accepted` promises acceptance into an asynchronous workflow; return a durable operation identifier and expose how callers inspect completion and failure.

Validation has two levels. Shape validation rejects invalid types, unknown writable fields, oversized collections, and malformed identifiers. Semantic validation checks current business rules, such as an unavailable SKU or forbidden transition. A schema-valid request can still conflict with concurrent state and fail at commit.

## Errors are part of the protocol

Clients need a stable machine-readable code and enough context to choose a recovery action. Human wording can evolve independently. Do not make clients parse a database exception message.

```json
{
  "type": "inventory_conflict",
  "message": "One or more items are no longer available.",
  "request_id": "req_7f2c",
  "retryable": false,
  "details": [{"field": "items[0].quantity", "code": "insufficient_stock"}]
}
```

Choose status codes deliberately: malformed request, unauthenticated, forbidden, missing, stale precondition, business conflict, rate limit, or transient server failure. A retryable flag is advisory; it must not override unsafe mutation semantics. A caller can retry a transport attempt only under the operation's idempotency contract. Avoid leaking whether an inaccessible object exists through different response bodies or timings where that distinction matters.

## Pagination is a consistency decision

Unbounded lists become outages as data grows. Offset pagination is simple for small administrative views, but deep offsets require skipping work and concurrent inserts shift positions. Keyset pagination seeks after the last returned sort key.

For a tenant's newest orders, include a deterministic tie breaker:

```sql
CREATE INDEX orders_history ON orders
    (tenant_id, created_at DESC, id DESC);

SELECT id, created_at, state, total_minor
FROM orders
WHERE tenant_id = $1
  AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC
LIMIT 51;
```

Return 50 rows; the extra row determines whether another page exists. The first page omits the cursor predicate. Bind the cursor to the tenant, filter, sort, and schema version. Signing a cursor prevents silent modification but does not replace authorization. A cursor is not encryption; avoid exposing confidential sort values inside a merely base64-encoded payload.

This runnable sketch shows the ordering rule without a database:

```python
rows = [(100, 9), (100, 8), (99, 20), (98, 3)]
cursor = (100, 8)
page = [row for row in rows if row < cursor][:2]
assert page == [(99, 20), (98, 3)]
print(page)
```

Keyset pagination is not a frozen snapshot. A record whose sort key changes can move across the cursor. If an export requires exact membership, define an immutable cutoff or build a snapshot export job. A separate count query may be expensive and may observe a different state; do not promise exact totals casually.

## Compatibility includes semantics

Adding an optional response field is often compatible with tolerant clients. Changing a field from minor units to decimal major units is not compatible even if its JSON type remains numeric. Adding a new enum value can break generated clients with exhaustive handling. Turning an optional field into required input breaks older callers.

For each evolution, ask what old clients send, what new clients send to old servers during rollout, and what stored messages or cached records contain. Use explicit defaults only when they preserve meaning. Track use of deprecated behavior before removal.

```text
Change: introduce currency on invoice creation
1. Accept missing currency with the existing account currency rule.
2. Deploy callers that send currency explicitly.
3. Observe old caller traffic and stored job payloads.
4. Require currency only after the compatibility window closes.
```

Versioning a path does not make incompatible changes harmless. It creates parallel contracts to maintain. Prefer additive evolution when meaning is stable; introduce a new operation when the old semantics cannot be preserved.

## GraphQL and RPC move the limits

GraphQL can reduce client over-fetching but introduces query depth, cost, resolver fanout, field authorization, and cache-key concerns. An N+1 resolver still generates N+1 backend calls. Batch resolvers within a request and enforce a query budget based on actual expensive work.

RPC makes named commands and typed interfaces explicit but can encourage chatty network use when local-method design is copied literally. A client that makes 30 serial calls pays 30 latency and failure boundaries. A purpose-built aggregate endpoint can be better than exposing every internal object separately.

Review a contract using hostile and old clients, not just the happy-path UI. The contract is complete when callers know what success establishes, which failures are ambiguous, how much work they may request, and what can change safely.
