# Queues, streams, and transactional messaging

Background processing separates accepting work from completing it. A work queue distributes tasks among workers; a retained log lets consumers maintain independent positions and replay history. Both decouple timing, but they introduce delivery, ordering, backlog, and recovery decisions that a local function call does not have.

Use asynchronous processing when delayed completion is acceptable or necessary. Do not hide a required synchronous invariant behind an event merely to make an endpoint return faster.

## Acceptance must mean something durable

Scheduling a coroutine after sending an HTTP response can lose the work when the process exits. A durable job or outbox record establishes recoverable intent. Return an operation ID and expose states such as accepted, running, completed, failed, and cancelled where the user needs them.

```text
POST /exports → 202 Accepted
{"operation_id":"exp_42","state":"accepted"}

GET /exports/exp_42
→ running, completed with authorized download, or a stable failure
```

Cancellation is another state transition. A request to cancel may race with completion or an external effect. Define what can still be cancelled and what requires compensation.

## The dual-write gap

Writing an order and then publishing an event creates a failure gap. If the database commits but publishing fails, consumers never learn about the order. Publishing first can expose an event for a transaction that later aborts.

![An order and outbox event commit in one database transaction; a relay publishes with possible duplicates; a consumer deduplicates while applying its durable effect.](/diagrams/backend-outbox.svg)

The outbox stores the business change and event intent in one local transaction:

```sql
BEGIN;
INSERT INTO orders (tenant_id, id, state) VALUES (7, 91, 'submitted');
INSERT INTO outbox (event_id, tenant_id, aggregate_id, event_type, payload)
VALUES ('evt_91_submitted', 7, 91, 'order.submitted.v1',
        '{"order_id":91,"version":1}'::jsonb);
COMMIT;
```

This is a schema-dependent integration fragment. An event needs a stable ID, tenant, aggregate identity, event schema, and enough version information for its consumers. Decide whether it carries a fact snapshot or a pointer that causes a later read of current state; those semantics differ.

The relay reads pending events, publishes, and records progress. A crash after broker acceptance but before recording progress can publish twice. Holding a database transaction open around slow network publishing increases lock duration; claiming batches with a bounded lease or using change-data capture can avoid that pattern, with their own recovery rules.

## Acknowledge after the durable effect

Acknowledging before processing risks losing work. Acknowledging afterward permits redelivery when a worker crashes after committing but before acknowledgement. At-least-once processing is therefore a normal design condition.

```sql
BEGIN;
INSERT INTO processed_events (consumer, event_id)
VALUES ('loyalty', $1)
ON CONFLICT DO NOTHING
RETURNING event_id;
-- If no row was returned, this consumer already applied the event.
-- Otherwise update the loyalty ledger in this same database transaction.
COMMIT;
-- Acknowledge only after the transaction commits.
```

The deduplication marker and effect must commit together. Marking “processed” before a separate transaction can lose the effect; marking afterward can repeat it. For a remote effect such as email or payment, a local marker alone cannot close the crash window. Use provider deduplication or explicit reconciliation.

Deduplication storage needs retention consistent with broker retention and replay policy. Deleting markers while old events remain replayable can reapply historical effects. A replay to rebuild a projection may need a new consumer identity rather than bypassing safeguards arbitrarily.

## Ordering is usually scoped

A partitioned log preserves record order within a partition, not globally across all partitions. Key related aggregate events consistently. More partitions allow more parallelism but do not parallelize one hot aggregate safely without changing its model.

Even ordered delivery can become out-of-order completion if a consumer processes records concurrently. Use per-key sequencing or version checks when order matters. A projection can ignore older versions, detect a gap, and reload from the source, but a financial ledger may require a stricter append policy.

```text
Projection currently at aggregate version 8
event version 7  → duplicate/old; ignore under the projection's contract
event version 9  → apply
event version 11 → gap; repair or wait, rather than silently invent version 10
```

Exactly-once claims have a boundary. Kafka transactions can atomically write Kafka output records and consumed offsets in supported processing arrangements. They do not automatically make an external SQL update or HTTP side effect exactly once. Always name the systems participating in the guarantee.

## A queue does not create processing capacity

If arrival rate is λ and sustainable completion rate is μ, backlog grows while λ exceeds μ. For a backlog of 60,000 jobs, an arrival rate of 400/s, and completion capacity of 600/s, the ideal drain time is `60,000 / (600 - 400) = 300 seconds`. That assumes stable rates and no new bottleneck.

Monitor oldest pending age, useful completion rate, retries, poison-message rate, and downstream saturation. A dead-letter queue is a holding area, not a resolution. Store enough failure context to repair and replay safely, restrict who can trigger replay, and avoid a replay surge that repeats the outage.

Use bounded batches, concurrency, and retry schedules. Separate interactive work from large backfills when they compete for the same database. Retention, deletion, schema evolution, tenant isolation, and consumer lag are part of the event contract, not later operational details.
