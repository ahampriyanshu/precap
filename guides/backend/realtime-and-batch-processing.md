# Realtime delivery, batch jobs, and resumable work

Not every backend operation fits one short request and response. Live interfaces need updates after the initial read; exports and backfills may run for minutes or hours. These workloads need explicit lifetimes, checkpoints, and resource budgets rather than a larger HTTP timeout.

Polling, server-sent events, and WebSockets evolved around different communication needs. Batch processing evolved to move substantial work out of interactive paths while making progress recoverable.

## Choose a communication contract

Polling is operationally simple and works well when moderate delay is acceptable. Conditional requests can avoid retransmitting unchanged representations. Server-sent events provide a server-to-client event stream over HTTP. WebSockets support bidirectional messages and fit collaboration or interactive protocols. A persistent connection is not inherently more correct than polling.

```text
Occasional status change       → bounded polling with conditional requests
One-way notifications/feed     → SSE with explicit resume behavior
Interactive bidirectional data → WebSocket protocol with application flow control
```

Authentication at connection setup does not answer what happens after membership is revoked. Long-lived connections need a reauthorization or expiry policy. Check WebSocket origin where applicable, constrain message sizes and rates, and authorize each logical subscription or command. A valid socket must not grant unrestricted room membership.

## Reconnection is the normal path

Connections drop during mobile network changes, deploys, proxy timeouts, and failures. Delivery needs an event identity and a resume contract. This SSE wire fragment demonstrates framing:

```text
id: 1842
event: order.changed
data: {"order_id":91,"version":8}

id: 1843
event: order.changed
data: {"order_id":92,"version":3}

```

The ID must name a replayable position in a defined stream. A browser's last-event identifier can request a position, but the server must retain enough history and validate that the caller still has access. If the cursor predates retention, return an explicit resynchronization path. Do not silently resume “from now” while presenting the interface as complete.

Notifications can be hints to refetch authoritative state. That simplifies payload evolution but still needs missed-update handling. Ephemeral typing indicators can be dropped; a persisted message or order state cannot inherit the same loss policy.

## Avoid the snapshot-subscription gap

Reading a snapshot and then subscribing can miss a change between those operations. Subscribing first and then reading can duplicate changes or apply them out of order. Coordinate both using a version or stream position.

```text
Server returns snapshot with watermark W.
Client consumes retained changes after W.
Client ignores duplicates/older record versions.
If W is no longer replayable, obtain a new snapshot.
```

The snapshot and watermark need a valid consistency relationship. Taking a database snapshot and an unrelated broker offset independently does not establish one. A database log position, transactional projection version, or supported change-stream resume token can supply the necessary boundary.

## Slow consumers must not grow memory forever

A server can produce events faster than a client can receive them. Bound per-connection buffers and total connection memory. Coalesce replaceable state, drop explicitly ephemeral messages, or disconnect a slow consumer with a documented recovery path. Never drop durable events silently while advancing the resume position.

```text
10,000 connections × 64 KiB buffer cap ≈ 625 MiB of payload buffer capacity
plus socket state, runtime objects, TLS state, and application subscriptions
```

The calculation is an upper-bound budgeting input, not measured total memory. Many small objects can add substantial overhead. Fanout cost also includes serialization and egress; sending one 2 KiB update to 50,000 clients transfers roughly 100 MB before protocol overhead.

## Batch jobs need stable traversal

Large exports should run as bounded jobs, write results to durable object storage, and return an authorized retrieval mechanism. Do not load millions of rows into one application list. Stream or page data under a defined snapshot/consistency policy.

This SQL fragment pages by a fixed ID range:

```sql
SELECT id, state, created_at
FROM orders
WHERE tenant_id = $1 AND id > $2 AND id <= $3
ORDER BY id
LIMIT 1000;
```

`$2` is the last checkpoint; `$3` is a defined high-water bound. This traversal assumes the ID and visibility contract fit the task. A maximum allocated sequence ID does not establish a complete commit boundary: a transaction may commit later with a smaller allocated ID. For an exact export, use a supported consistent snapshot or a source-log boundary rather than relying on that assumption.

Backfills can often tolerate eventual completion if they re-scan safely and compare versions. Financial or compliance exports usually require a stronger membership and snapshot definition. State which one the job provides.

## Checkpoint effects and progress together

A worker may crash after processing a page but before saving its checkpoint. Re-running that page must be safe. Commit the effect and checkpoint together when they share a database, or use deterministic output keys and deduplication when they do not.

```python
def deterministic_part_key(job_id, partition, page):
    if min(partition, page) < 0:
        raise ValueError("nonnegative part identifiers required")
    return f"exports/{job_id}/part-{partition:04d}-{page:08d}.jsonl"

assert deterministic_part_key("exp_42", 2, 17).endswith("00000017.jsonl")
```

This runnable helper names a retry's same output part; a production object write still needs overwrite/conditional-write and manifest semantics. Publish the final manifest only when all intended parts are complete. A partially written file should never appear as a finished export.

Throttle background work against interactive capacity, support cancellation and expiry, and monitor oldest job age and progress rate. Retry storms, oversized tenants, and restarts should produce slower controlled progress rather than repeated full scans or an exhausted database pool.
