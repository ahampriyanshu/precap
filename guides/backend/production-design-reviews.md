# Worked production reviews

Backend decisions become meaningful when correctness, capacity, and operations meet in one design. These two reviews use explicit assumptions to connect the mechanisms from the playlist. Their numbers are illustrative workload inputs, not benchmark claims or universal configuration recommendations.

Read each as a design review: establish the promise, find the simple implementation's failure, then improve only the boundaries that need it.

## Case one: checkout that survives an uncertain payment

Assume 300 checkout attempts/s at peak, a 700 ms target for accepting a checkout, and payment authorization commonly completing later. One inventory database owns reservations; a payment provider supports stable idempotency keys and outcome lookup. Users must never be charged twice for one checkout, and accepted checkouts must remain recoverable after a process restart.

The naive implementation decrements stock, calls payment, writes an order, and returns. It fails in several ways: the provider can charge before the connection times out; the process can die before storing the provider result; the database transaction can hold stock locks throughout a slow network call; a browser retry can start a second charge.

Use a durable workflow:

```text
Request transaction:
  claim scoped checkout idempotency key + digest
  conditionally reserve stock
  write checkout(state=payment_pending) and outbox intent
  store accepted operation result
  commit

Payment activity:
  call provider with checkout-derived stable operation key
  success → persist payment result + next workflow intent
  decline → persist decline + release-stock intent
  timeout → persist/recover uncertain outcome; query provider using same key
```

The response establishes durable acceptance, not successful payment. A status endpoint and optional event stream expose progress. Duplicate callbacks and synchronous responses converge through a conditional versioned transition. The payment record has a unique provider operation identity, and ledger effects deduplicate within their local transaction.

## Compute the relevant budget

Suppose each accepted checkout transaction holds a database connection for 25 ms on average. At 300/s, that path occupies about `300 × 0.025 = 7.5` connections on average. If payment were held inside the transaction for an average 400 ms, occupancy would rise to roughly 120 connections before other work and tails. Moving the provider call outside the transaction changes both lock duration and connection demand.

```text
Payment activity concurrency limit = 80
Observed mean activity duration    = 0.4 s
Ideal upper-bound throughput       ≈ 80 / 0.4 = 200/s
Peak accepted checkout arrivals    = 300/s
```

Under those simplified assumptions, the payment backlog grows by about 100/s. The system must reduce accepted load, increase supported provider capacity, or explicitly tolerate and communicate a growing delay. A durable queue prevents loss; it does not make 200/s processing satisfy 300/s arrivals indefinitely.

The queue's oldest age matters more to users than its raw depth. Reserve-stock expiry must account for the payment workflow, retries, provider ambiguity, and release races. Do not release stock while an uncertain authorization is treated as conclusively absent.

## Exercise the crash boundaries

```text
Crash after request commit before response
  → retry finds the same accepted operation receipt

Crash after provider authorization before local result commit
  → same provider key/outcome lookup resolves the existing attempt

Duplicate payment callback
  → unique event/operation identity and conditional transition suppress effects

Late success after reservation expiry
  → explicit reconciliation/compensation state, not an impossible assertion
```

Verify final stock, checkout state, payment identity, ledger entries, and user-visible result. A test that asserts only `202` cannot establish the design's main guarantees. Alert on uncertain payments older than the reconciliation budget and on accepted work that stops making progress.

## Case two: a large tenant's report should not freeze everyone

Assume a shared database serves interactive APIs and a daily report. Most tenants have fewer than 50,000 rows; one has 200 million. The naive endpoint loads all matching rows into memory, performs joins in application code, and returns a CSV through one long HTTP request.

It works in development and fails under skew. The large tenant exhausts memory, holds database resources, times out behind ingress, and causes retries that repeat the entire scan. Increasing the HTTP timeout retains resources longer without improving throughput.

First clarify the report contract: exact snapshot or eventually consistent export, timezone, cutoff, permissions, retention, and acceptable completion time. Move the work to a durable job with tenant quota and an interactive-capacity reserve. Use a database snapshot or properly coordinated source boundary when exact membership matters. Read bounded pages and write deterministic parts to object storage; publish a final manifest only on completion.

```text
Request: authorize → create export job → return operation ID
Worker:  claim bounded lease → read page → write part → checkpoint safely
Result:  final manifest → authorized retrieval → expiry and deletion policy
```

Separate the worker's concurrency budget from interactive traffic. A replica can be eligible if lag and snapshot requirements permit, but a long-running export snapshot may retain old row versions and affect maintenance. Choose bounded extraction or a dedicated analytical projection when the report's needs diverge from the transactional workload.

## Improve from evidence

If 80% of report time is sorting an unindexed result, a matching access path or revised query may be enough. If the report repeatedly aggregates the same historical facts, a maintained analytical view can reduce work. If one tenant dominates all resources, per-tenant admission and scheduling improve fairness before sharding becomes necessary.

```text
Measure before adding infrastructure:
  rows examined vs returned
  database buffers, sort spill, and lock/transaction lifetime
  worker memory and object-write throughput
  interactive pool wait and p99 during the export
  checkpoint replay behavior after a worker crash
```

Reconciliation compares exported counts and totals to the contract's source snapshot or cutoff. Permission revocation during a long export needs a defined rule for continued processing and later download. A signed download URL with a long expiry can outlive a user's access; choose its lifetime and delivery mechanism deliberately.

## Use the same review lens on another backend

For any substantial operation, identify the durable acceptance point, authoritative owner, concurrency invariant, ambiguous-outcome path, derived-state lag, capacity budget, and recovery evidence. If one answer is “the framework handles it,” inspect the actual guarantee. Senior engineering judgment lies in connecting those boundaries without introducing more machinery than the workload requires.
