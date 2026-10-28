# Backend patterns and debugging

Use the request path to orient an investigation, then inspect the runtime, contract, data, and failure boundary involved. Commands are diagnostic examples for your own environment; SQL fragments need the schema and parameters described in the recap. Use isolated fixtures for writes and failure injection.

## Network and request path

For a health endpoint you control, separate connection setup from time to the first response byte:

```bash
curl --silent --show-error --output /dev/null \
  --write-out 'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} first_byte=%{time_starttransfer} total=%{time_total}\n' \
  'https://example.com/health'
```

These values are cumulative seconds from curl's start, not independent phase durations. Redirects and reused connections change interpretation. Correlate a request ID across proxy and application logs. If the app never saw the request, inspect ingress/routing first. Check proxy deadlines, body limits, and trusted forwarding rules before changing the handler.

[Context: network request flow](/guides/engineering/backend/#requests-protocols-and-the-network-path)

## Servers and processes

Inspect worker identity and open request/resource ownership using your process manager and application metrics. Map one request through the lifecycle:

```text
accept → parse/admit → middleware → route → response → cleanup
startup: initialize per-process pools and dependencies
shutdown: stop admission → drain bounded work → close resources
restart: process-local state disappears
```

Check server/interface compatibility: a coroutine handler alone does not make an entire stack nonblocking. Verify maximum workers, threads, pending requests, memory, and shutdown grace period. Test termination during an in-flight request in an isolated environment. Durable jobs need a separate recovery mechanism instead of relying on the web worker remaining alive.

[Context: application servers and processes](/guides/engineering/backend/#application-servers-processes-and-request-lifecycles)

## Concurrency and capacity

Estimate occupied work and connection exposure before increasing concurrency. This package-free Python calculation is a capacity illustration:

```python
rate_per_second, average_seconds = 200, 0.25
replicas, processes, pool_maximum = 4, 3, 10
print("average in-flight", rate_per_second * average_seconds)
print("potential API connections", replicas * processes * pool_maximum)
```

It prints `average in-flight 50.0` and `potential API connections 120`. The first uses steady-state averages, not peak/p99 sizing. Include workers, overflow pools, administration, and autoscaling in the real database budget. Inspect CPU, event-loop delay, active tasks, admission wait, and pool wait together. A semaphore bounds active work inside it; it does not bound an unlimited population waiting outside it.

[Context: backend concurrency](/guides/engineering/backend/#concurrency-blocking-workers-threads-and-event-loops)

## HTTP API contracts

Check a resource read with credentials held in your approved local mechanism. This placeholder only demonstrates inspecting the response:

```bash
curl --include --silent --show-error 'https://example.com/api/products/42'
```

Verify status, content type, schema, cache behavior, and correlation ID. Exercise invalid input, missing identity, denied resource access, not-found, conflict, rate-limit, and dependency failure cases in an isolated fixture. Confirm error shapes and pagination bounds. Describe POST retry behavior explicitly rather than inferring it from the HTTP client's retry setting.

[Context: HTTP API design](/guides/engineering/backend/#http-apis-make-the-contract-explicit)

## Business logic boundaries

Review a change by locating its decisions and dependencies:

```text
handler     parses HTTP, resolves identity, maps results/errors
use case    authorizes action, coordinates rules and transaction
domain rule calculates or validates a business invariant
query layer performs known SQL/storage work with explicit shape
```

Trace an authoritative value such as unit price to its trusted source. Test calculation boundaries independently, then test the use case against storage. Avoid coupling domain rules to request globals or hiding a database call in a property getter. A boundary is useful when it clarifies ownership; creating a class for every function does not establish a better design.

[Context: business logic organization](/guides/engineering/backend/#business-logic-and-code-boundaries)

## Validation and authorization

Use two isolated users or tenants with known fixtures. Exercise object-level permission checks on every access path:

```text
tenant A identity + A resource → permitted operation
tenant A identity + B resource → no disclosed data or mutation
request supplies tenant B      → rejected/ignored by trusted resolution
export/job/cache/list          → same policy as direct object access
expired/invalid token          → denied before protected work
```

Also test mass assignment of protected fields and excessive collection lengths. Verify deny-by-default behavior for new routes and actions. Keep authentication evidence and policy evaluation separate in diagnosis. If access changes during a long job, define whether execution must recheck it rather than assuming authorization at enqueue time lasts forever.

[Context: backend trust boundaries](/guides/engineering/backend/#validation-authentication-and-authorization)

## Persistence and pools

With suitable database monitoring permissions, inspect this database's connection population without printing query contents:

```sql
SELECT application_name, state, count(*) AS connections
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY application_name, state
ORDER BY connections DESC;
```

Compare active, idle, and idle-in-transaction sessions with client-side pool wait and timeout metrics. Many idle sessions may reflect configured pools; long idle transactions can retain locks/snapshots. Verify constraints and reference relationships against actual write paths. Check backup retention and restore evidence independently of replica health. Monitor aggregate pool limits through autoscaling and deploy overlap.

[Context: durable storage and connection pools](/guides/engineering/backend/#persistence-model-durable-data-and-invariants)

## Transactions and concurrency

Use separate database connections and explicit coordination for a real race test:

```text
fixture: inventory available=1, no orders
A and B both request one unit
run conditional reservations concurrently
expected: one accepted reservation, one zero-row/conflict result
force accepted order insertion to fail → stock returns to 1 after rollback
```

Observe stored state and committed results, not just handler return values. Verify isolation level and commit boundaries. For multi-row invariants, construct a schedule that touches different rows to expose write skew. Test whole-transaction retries for serialization/deadlock failures, with a bounded retry policy and no repeated unprotected external effects.

[Context: transactions and isolation](/guides/engineering/backend/#transactions-and-concurrent-updates)

## Queries and indexes

For the recap's history query, inspect an actual plan against representative staging data. Replace the fixture tenant with one that exists:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, status, total_minor, currency, created_at
FROM orders
WHERE tenant_id = 7
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

`ANALYZE` executes the query; use a controlled read workload and bounded runtime. Compare estimated versus actual rows, scan/filter work, sort cost, loops, and buffer use. Counts/times inside repeated plan nodes need careful interpretation. Inspect ORM query counts to find N+1 access. Recheck write cost and index size before keeping a new index. [EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) documents the plan fields.

[Context: queries and access paths](/guides/engineering/backend/#queries-indexes-and-pagination)

## Timeouts and idempotency

Test the ambiguous-outcome window using a controlled fault at the response boundary:

```text
same key + same normalized command → one mutation; replayed result
same key + different command       → explicit key-reuse conflict
two concurrent same-key attempts   → uniqueness coordinates ownership
commit succeeds; response lost     → retry returns committed result
key expires                        → documented retention boundary applies
```

Confirm the receipt and mutation share a transaction and identity scope. A normal request repeated twice tests replay behavior; it does not test commit-without-response. Inspect which layer owns retries, which errors qualify, and how the remaining deadline limits attempts. Timeouts can leave work continuing downstream; track cancellation and resource cleanup separately.

[Context: timeout and retry semantics](/guides/engineering/backend/#timeouts-retries-and-idempotency)

## Caching and freshness

Write down the cache contract before diagnosing a stale record:

```text
key       tenant + resource/query + representation/permission scope
source    primary, replica, computed view, or another cache
freshness maximum acceptable stale result and read-after-write policy
fill      miss behavior, coalescing, version acceptance
failure   bypass, stale fallback, rejection, capacity bound
```

Inspect cached value version, remaining TTL, source revision, fill timing, and mutation/invalidation timing. Reproduce delayed refill after invalidation using a barrier. Test expiry bursts and a cache outage under load. Clearing a key can relieve a symptom without fixing the race that recreates it. A sensitive cached representation needs authorization and retention rules, not only a unique ID.

[Context: cache correctness](/guides/engineering/backend/#caching-reduce-repeated-work-with-a-freshness-contract)

## Queues and delivery

Use failure injection around every transfer of responsibility:

```text
database commit fails            → no committed outbox event
publish succeeds, relay dies     → duplicate publish remains possible
effect succeeds, worker dies     → redelivery uses stable deduplication ID
poison event repeats             → bounded attempts + terminal/replay policy
arrivals exceed completions      → oldest age grows; admission/capacity action
```

Inspect publish confirmations, unacknowledged deliveries, oldest pending age, attempt counts, and useful completion rate. An empty ready queue can coexist with stuck unacknowledged work. Confirm ordering scope and whether multiple workers may process related events concurrently. Review provider idempotency and receipt expiry; a broker acknowledgement alone cannot make an external effect exactly once.

[Context: queues and durable handoffs](/guides/engineering/backend/#queues-and-background-work)

## Scaling and boundaries

Map the suspected bottleneck to evidence before choosing an architectural change:

```text
more API replicas → load-balancer distribution, process CPU, DB pool budget
read replica      → replay lag, stale-read tolerance, read-after-write route
cache             → hit rate, fill load, freshness, outage behavior
new service       → owned data, API/event contract, failure and deploy boundary
shard             → partition key, hot tenants, cross-shard work, rebalancing
```

Load-test realistic cardinality, payload sizes, skew, and dependency latency. Watch where tail latency rises before throughput collapses. A shared hot row or database connection limit can make more app workers harmful. Document the new failure and recovery paths introduced by extraction or partitioning, including reconciliation of partially completed workflows.

[Context: backend scaling](/guides/engineering/backend/#scaling-and-service-boundaries)

## Schema and contract evolution

Use compatibility evidence for every consumer present during a rollout:

```text
old API worker   expanded schema remains readable/writable
old browser tab  supported fields/errors and mutation contract remain valid
queued event     handler/upcaster accepts the stored payload version
cache entry      representation revision avoids incompatible reuse
backfill         restartable, bounded, respects concurrent writes
rollback         older code can interpret data already committed
```

Measure old usage before removing support. Inspect migration lock/rewrite behavior for the exact operation and production table size. Separate expansion, data movement, and destructive cleanup. Define source-of-truth rules for any dual-write interval and validate convergence before contraction. A successful migration on an empty database does not establish rollout safety.

[Context: schema and API evolution](/guides/engineering/backend/#schema-and-contract-evolution)

## Observability and testing

With monitoring permissions, inspect transaction age and waits without dumping business payloads:

```sql
SELECT pid, application_name, state,
       clock_timestamp() - xact_start AS transaction_age,
       wait_event_type, wait_event, pg_blocking_pids(pid) AS blocked_by
FROM pg_stat_activity
WHERE datname = current_database() AND pid <> pg_backend_pid()
  AND (state <> 'idle' OR xact_start IS NOT NULL)
ORDER BY xact_start NULLS LAST;
```

Correlate an affected request with application/pool metrics, trace spans, dependency waits, and release information. Verify which database instance you inspected and what your permissions expose. Use the finding to design a deterministic regression: initial fixture, concurrent schedule or failure point, expected response, committed invariant, and cleanup. Load tests should include realistic slow/failing dependencies and recovery, not only peak successful throughput.

[Context: backend diagnosis and testing](/guides/engineering/backend/#observability-testing-and-production-diagnosis)
