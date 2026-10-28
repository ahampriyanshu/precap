# Backend Engineering

A backend accepts requests, applies trusted business rules, reads or changes durable state, and returns a result. Its essential concerns are execution, data ownership, correctness under concurrency, and bounded use of resources.

Begin with the path of one request. Then connect processes, APIs, databases, transactions, caches, queues, and service boundaries to the work they perform. Short examples show where a simple implementation stops being sufficient.

## Requests, protocols, and the network path

The client does not call a backend function directly. It sends a message over a network. For a typical HTTPS API, DNS finds an address, a transport and TLS session carry traffic, and HTTP describes the request and response. Connection reuse can avoid repeating setup. HTTP/3 uses QUIC rather than TCP, so distinguish protocol semantics from a particular transport.

Before application code runs, traffic may pass through a CDN, load balancer, or reverse proxy:

```text
client → DNS → TLS/ingress → reverse proxy → application server
                                           → handler → database
client ← status + headers + response body ← handler
```

Each hop can queue, fail, time out, or retry. A slow request may be waiting for a connection rather than executing business logic. Proxies also impose body limits and deadlines. Establish where TLS terminates, which proxy headers are trusted, and how a request ID travels through the path. A forwarded client IP is trustworthy only when the controlled proxy overwrites it and direct bypass is prevented. [HTTP's overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) separates clients, intermediaries, and servers.

[Reference: trace the request path](/cheatsheets/backend/#network-and-request-path)

## Application servers, processes, and request lifecycles

A web server accepts connections and handles protocol details. An application server adapts requests to framework code. The handler executes inside a process with its own memory, runtime, and resource limits. Middleware can add authentication, logging, and error translation around the handler.

This minimal WSGI application shows the adapter boundary. A WSGI server supplies `environ` and consumes the returned bytes; this function does not parse TCP or TLS:

```python
import json

def application(environ, start_response):
    healthy = environ["REQUEST_METHOD"] == "GET" and environ["PATH_INFO"] == "/health"
    body = json.dumps({"status": "ok"} if healthy else {"error": "not_found"}).encode()
    start_response("200 OK" if healthy else "404 Not Found", [
        ("Content-Type", "application/json"),
        ("Content-Length", str(len(body))),
    ])
    return [body]
```

A framework adds routing, parsing, dependency management, and richer responses. WSGI is a synchronous interface; ASGI supports asynchronous request handling and protocols such as WebSockets. Deploy using an appropriate production server, with lifecycle hooks for connection pools and graceful shutdown. Multiple worker processes have separate global variables: a Python dictionary cannot become a shared database by increasing worker count. [WSGI](https://peps.python.org/pep-3333/) specifies this application/server interface.

[Reference: inspect servers and processes](/cheatsheets/backend/#servers-and-processes)

## Concurrency: blocking workers, threads, and event loops

Concurrency is keeping multiple operations in progress; parallelism is executing work simultaneously. A blocking worker occupies its execution slot while waiting for I/O. Threads can overlap waits, and an event loop switches between tasks when they await nonblocking operations. CPU work still consumes execution time somewhere.

Independent asynchronous reads can overlap. This integration fragment assumes an async database client and HTTP client, each configured with its own pool and timeout:

```python
import asyncio

async def load_summary(database, client):
    async with asyncio.TaskGroup() as group:
        orders = group.create_task(database.count_open_orders())
        shipping = group.create_task(client.shipping_status())
    return {"orders": orders.result(), "shipping": shipping.result()}
```

Both tasks must be safe to run independently. Calling a synchronous database driver or doing a large compression operation inside the coroutine blocks its event-loop thread. Move suitable blocking I/O to a bounded executor; isolate substantial CPU work in processes or dedicated compute workers. Threaded CPU parallelism depends on the runtime, extensions, and whether a Python build uses a GIL. Bound admitted requests and downstream concurrency; creating thousands of awaiting tasks can still exhaust memory and pools. [Asyncio tasks](https://docs.python.org/3/library/asyncio-task.html) describe cooperative scheduling and task groups.

[Reference: inspect concurrency and capacity](/cheatsheets/backend/#concurrency-and-capacity)

## HTTP APIs: make the contract explicit

An API contract includes methods, paths, request and response schemas, status codes, error shapes, authorization, and retry behavior. REST commonly exposes resources through HTTP semantics; RPC exposes named operations, while GraphQL lets clients select fields within a schema. Each approach still needs limits, compatibility, and an authority model.

For creating an order, a useful contract might be:

```http
POST /api/orders
Content-Type: application/json
Idempotency-Key: 71d50b29-66a2-4ad9-ae90-7db73bd12f11

{"items":[{"sku":"BAG-42","quantity":1}]}

HTTP/1.1 201 Created
Location: /api/orders/91
Content-Type: application/json

{"id":91,"status":"pending","total_minor":12900,"currency":"USD"}
```

This is an exchange sketch, with authentication omitted for readability. The server calculates the authoritative price. Define whether a repeated key replays the original result, how long it is retained, and how conflicting payloads are rejected. GET should not perform a business mutation; PUT's idempotent intent does not promise an identical response to every repetition. Use bounded list pagination and distinguish malformed input, missing identity, denied access, missing resources, conflicts, and transient failures. Consistent errors let clients recover intentionally. [HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html) defines method and status behavior.

[Reference: inspect API contracts](/cheatsheets/backend/#http-api-contracts)

## Business logic and code boundaries

Keep transport handling, business decisions, and persistence responsibilities identifiable. A handler translates HTTP into a command; a service coordinates the use case and transaction; a repository or query layer manages storage access. These can be modules in one process. The value is explicit dependencies and invariants, rather than a fixed number of architectural layers.

A pure price calculation can be tested independently of HTTP or SQL:

```python
def total_minor(lines):
    total = 0
    for unit_price, quantity in lines:
        if type(unit_price) is not int or type(quantity) is not int:
            raise ValueError("integer price and quantity required")
        if unit_price < 0 or quantity <= 0:
            raise ValueError("invalid price or quantity")
        total += unit_price * quantity
    return total

print(total_minor([(12900, 1), (500, 2)]))
```

It prints `13900`. Production pricing also needs currency, rounding, discounts, and tax rules. Obtain unit prices from an authorized catalog, not the submitted browser total. Keeping that rule separate makes the trust decision visible and reusable from an API or background job. Start with a cohesive module; extract interfaces where alternate implementations or independent testing justify them. A repository abstraction that hides query shape can make performance harder to reason about.

[Reference: review business logic boundaries](/cheatsheets/backend/#business-logic-boundaries)

## Validation, authentication, and authorization

Validation establishes that input has a permitted shape and meaning. Authentication establishes identity. Authorization decides whether that identity may perform this action on this resource now. These are separate checks. A valid order ID and a logged-in user do not establish ownership.

For a tenant-scoped order lookup, resolve the tenant from verified identity and permitted membership. Parameterized SQL keeps values separate from query syntax:

```sql
SELECT id, status, total_minor, currency
FROM orders
WHERE tenant_id = %(tenant_id)s AND id = %(order_id)s;
```

This fragment assumes the caller has resolved a trusted tenant and checked the requested action. Never replace that tenant with an unchecked request field. Apply the same policy to writes, list queries, exports, cache keys, and jobs. Decide whether an unauthorized object is reported as forbidden or missing without leaking its representation. Limit payload size and collection lengths before expensive work. A signed token still needs signature, issuer, audience, expiry, and authorization checks; CORS is not access control for an API. [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) recommends enforcing permissions on every request.

[Reference: verify trust boundaries](/cheatsheets/backend/#validation-and-authorization)

## Persistence: model durable data and invariants

Process memory is fast and temporary. A durable store must define how data survives failure, how concurrent writers interact, and which queries it supports. Relational databases provide schemas, joins, constraints, and transactions. Document, key-value, search, and object stores offer different models and access paths; choose around workload and guarantees.

A simplified relational order record encodes basic invariants in storage:

```sql
CREATE TABLE orders (
    tenant_id bigint NOT NULL,
    id bigint GENERATED ALWAYS AS IDENTITY,
    status text NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
    total_minor bigint NOT NULL CHECK (total_minor >= 0),
    currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, id)
);
```

The currency check validates shape, not membership in a supported currency set. Real orders also need items, prices, customer references, and audit history. Constraints prevent invalid stored states even when a second code path writes data. Connection pools reuse expensive sessions, but a pool is a capacity limit: every process and replica contributes connections. Durability also requires configured storage, replication policy, and tested backup recovery. A replica is not a historical backup. [Database constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) define enforceable row and relationship rules.

[Reference: inspect storage and pools](/cheatsheets/backend/#persistence-and-pools)

## Transactions and concurrent updates

A transaction commits a group of database changes together or rolls them back. Isolation defines what concurrent transactions may observe; atomicity alone does not serialize a read followed by a write. Two buyers can both observe the last unit before either reserves it.

For one inventory row, combine the condition and mutation in one statement inside the order transaction. This assumes an inventory table keyed by `(tenant_id, sku)` with nonnegative `available`:

```sql
UPDATE inventory
SET available = available - %(quantity)s
WHERE tenant_id = %(tenant_id)s AND sku = %(sku)s
  AND %(quantity)s > 0
  AND available >= %(quantity)s
RETURNING available;
```

One returned row means stock was reserved; zero means the condition did not match. Create the order in the same transaction and roll back the reservation if that creation fails. In PostgreSQL Read Committed, an updating statement rechecks a row's predicate after waiting for a concurrent updater. Multi-row rules may require explicit locks in a consistent order or Serializable isolation with whole-transaction retries. For stale UI edits, compare an observed version in the update condition and reject conflicts. Keep network calls outside long database transactions where possible. [Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html) determines which guarantees apply.

[Reference: test transaction boundaries](/cheatsheets/backend/#transactions-and-concurrency)

## Queries, indexes, and pagination

A correct query can still read too much data. An index provides an additional access path at the cost of storage and write maintenance. Its useful ordering follows the filter and sort, not simply the presence of a column in an endpoint. ORM convenience can also hide repeated queries, wide rows, or unbounded relationships.

For an order history filtered by tenant and sorted newest first, align a composite index and a keyset cursor:

```sql
CREATE INDEX orders_history ON orders (tenant_id, created_at DESC, id DESC);

SELECT id, status, total_minor, currency, created_at
FROM orders
WHERE tenant_id = %(tenant_id)s
  AND (created_at, id) < (%(cursor_time)s, %(cursor_id)s)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

Use the same query without the cursor condition for the first page. The ID breaks timestamp ties; protect and validate cursor values and bind them to the filter. Deep OFFSET pagination still walks past skipped rows, while changing data can shift page boundaries. A keyset cursor does not provide a frozen snapshot across requests. Inspect plans and representative cardinalities before adding indexes; a sequential scan can be the right plan for a small table or a large result fraction. [Multicolumn indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html) explain ordering constraints; [EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html) shows the chosen work.

[Reference: inspect queries and indexes](/cheatsheets/backend/#queries-and-indexes)

## Timeouts, retries, and idempotency

A timeout tells the caller that it stopped waiting. The server may have committed before the response disappeared. Retrying an order creation without a deduplication contract can create a second order. Idempotency makes repeated attempts represent one logical operation within a defined scope and retention window.

A database-backed receipt must commit with the business mutation. This is transaction pseudocode, including the conflict path:

```pseudocode
authenticate and authorize command
normalize permitted input; compute request digest
BEGIN
  claim UNIQUE(tenant, actor, operation, idempotency_key)
  if a committed receipt already exists:
    reject a different digest; otherwise return its stored result
  else:
    perform mutation
    store replayable result in the receipt
COMMIT
return result
```

The unique constraint coordinates concurrent attempts; an application-level “check then insert” is insufficient. Receipt expiry must exceed the supported retry window, and replay must not bypass current authorization. Downstream side effects need their own stable operation IDs. Set end-to-end deadlines, bounded attempts, backoff with jitter, and one intentional retry owner. Three attempts at each of three layers can produce 27 dependency attempts. Retrying overload without a budget can prolong an outage. [AWS's timeout and retry guidance](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) explains these failure dynamics.

[Reference: test retry semantics](/cheatsheets/backend/#timeouts-and-idempotency)

## Caching: reduce repeated work with a freshness contract

A cache stores a derived copy so a request can avoid repeated computation or storage access. Cache-aside reads try the cache, load from the source on a miss, and populate the result. The design must specify identity, invalidation, expiration, and how much stale data the product tolerates.

Deleting a key after a write does not eliminate every race:

```python
database = {"version": 1, "price_minor": 12900}
cache = {}
old_read = database.copy()                 # reader misses cache
database.update(version=2, price_minor=11900)
cache.pop("product:42", None)              # writer invalidates after commit
cache["product:42"] = old_read             # delayed reader refills stale data
print(database["version"], cache["product:42"]["version"])
```

It prints `2 1`. A TTL limits reuse after that fill; it does not make the value current or bound replica lag at the source. Version-aware fills, coordinated invalidation, bypassing the cache after a write, or accepting bounded staleness address different requirements. Include tenant, permissions/representation scope, and schema revision in keys where relevant. Protect against stampedes and hot keys with bounded request coalescing and capacity controls. Test the cache-down path: shifting all misses to the database may exceed its capacity. [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching) applies related freshness concepts at the response layer.

[Reference: inspect cache behavior](/cheatsheets/backend/#caching-and-freshness)

## Queues and background work

Queues separate accepting a request from doing work that can finish later. They absorb bursts and let workers scale independently, but introduce queue delay, redelivery, ordering, and recovery decisions. Sending an email after order creation is a natural candidate; accepting payment may need a more explicit state machine.

The transactional outbox closes the gap between a database commit and publishing a message:

```text
API transaction: write order + write outbox event → commit
relay:           read pending event → publish → observe broker confirmation
worker:          receive event → perform durable effect → acknowledge

Crash after publish/before marking outbox sent → possible duplicate publish
Crash after effect/before acknowledgement     → possible duplicate processing
```

Use a stable event ID, idempotent consumers or provider deduplication, bounded retries, and a terminal failure path with replay controls. A consumer acknowledgement and a publisher confirmation protect different boundaries. An in-process task scheduled after the HTTP response can disappear with the process. Monitor oldest pending age and useful completion rate, not only queue depth. If arrivals exceed processing capacity for long enough, a queue postpones overload rather than solving it. [RabbitMQ reliability](https://www.rabbitmq.com/docs/reliability) explains redelivery and acknowledgements.

[Reference: inspect queues and delivery](/cheatsheets/backend/#queues-and-delivery)

## Scaling and service boundaries

Vertical scaling gives one instance more resources; horizontal scaling adds instances. Stateless request handlers make load balancing simpler, while shared authoritative state belongs in an appropriate external store. Adding API replicas does not increase database write capacity, remove hot rows, or fix an expensive query.

Choose a change from the measured constraint:

```text
CPU saturation        → profile; reduce work; add appropriate compute
I/O wait/pool queues  → inspect dependency latency and concurrency budget
Read pressure        → query/index changes; cache; eligible replica reads
Write contention     → shorter transactions; reduce shared hot state
Independent workload → isolate workers or a service with clear ownership
```

Read replicas can serve eligible reads but may lag; preserve read-after-write behavior where the product requires it. Sharding distributes data and adds routing, cross-shard operations, and rebalancing complexity. A modular monolith keeps local calls and transactions simple. Extract a service when independent ownership, failure isolation, or scaling justifies network contracts and operational overhead. Cross-service writes require explicit workflow and compensation/reconciliation; a local transaction cannot commit another service's private database. [PostgreSQL replication](https://www.postgresql.org/docs/current/warm-standby.html) details synchronous and asynchronous tradeoffs.

[Reference: review scaling choices](/cheatsheets/backend/#scaling-and-boundaries)

## Schema and contract evolution

Deployment is a period of mixed versions: old API workers, new workers, open browser tabs, queued events, and cached records can coexist. A rename that works on a clean database may break that overlap. Treat compatibility as a transition, including stored data and rollback behavior.

An expand-and-contract change has separate stages:

```text
1. Expand:  add compatible schema/API fields; old readers still work.
2. Migrate: deploy defined write/read policy; backfill in bounded batches.
3. Observe: check old usage, incomplete rows, errors and lock impact.
4. Contract: remove old behavior after consumers and rollback window expire.
```

Define which field owns the truth during migration. Dual writes without an atomic consistency rule can create disagreement. Backfills must be restartable and avoid overwriting newer user edits. Large indexes or table alterations may contend with production work even when the migration is only a few lines. Version event payloads or maintain compatible handlers until old messages expire. A rollback is safe only when the older code can interpret the data already written. [ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html) documents operation-specific locking and rewrite behavior.

[Reference: review compatible changes](/cheatsheets/backend/#schema-and-contract-evolution)

## Observability, testing, and production diagnosis

Metrics describe populations and saturation, traces show the path of individual operations, and logs record useful events. Correlate them using request/trace identity and release information. Measure request rate, errors, latency distributions, resource usage, pool waits, and background completion delay. Keep sensitive payloads out of telemetry and unbounded IDs out of metric labels.

A slow request needs a decomposition before a remedy:

```text
total latency = admission/proxy wait + application queue + execution
              + pool/dependency waits + serialization/network time

API p99 up, CPU low, DB pool wait high → inspect connection ownership,
query duration, lock waits, transaction lifetimes and downstream capacity.
```

Do not add overlapping parallel span times as if they were serial elapsed time. Follow a trace and correlate system-level evidence. Tests should cover pure rules, real database transactions, API contracts, and critical end-to-end behavior. Use separate connections and explicit barriers for races; inject response loss after commit, worker crashes around acknowledgement, dependency timeouts, and incompatible inputs. Verify the final stored invariant as well as the status code. Baseline realistic load and watch tail latency as concurrency rises; successful low-load requests say little about overload. [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/) provide the instrumentation vocabulary.

[Reference: audit a backend](/cheatsheets/backend/#observability-and-testing)
