# Replication, partitioning, and identifiers

Replication keeps several copies of data. Partitioning divides data into subsets. They solve different pressures: replicas improve resilience or read capacity; partitions spread storage and some execution work. Combining them creates a distributed system with routing, lag, failover, and rebalancing behavior that applications must understand.

The first step is to state the consistency requirement of each operation. “Use a replica” is incomplete without deciding what the caller may observe after a write or failover.

## Follow a replicated write

With asynchronous replication, the primary can acknowledge before a replica has received or applied the change. A subsequent read from that replica can return an older state. Synchronous configurations can wait for stronger replica milestones at additional latency and availability cost; exactly which milestone matters.

```text
t0 primary commits order 91 and returns success
t1 user reads order 91 through a lagging replica → missing
t2 replica replays the commit
t3 the same read succeeds
```

Read-after-write can be preserved by routing relevant reads to the authoritative primary, carrying a replication-position requirement and waiting on an eligible replica, or using an explicit consistency token supported by the system. A fixed “read primary for five seconds” window is a heuristic; lag can exceed it. A position token must be interpreted against the correct database history after failover, not compared as an unrelated number.

Classify reads. Public analytics may tolerate minutes of delay; confirming a just-created resource usually should not. An authorization revocation read can have a stricter freshness requirement than an ordinary profile read.

## Failover changes the uncertainty

Failover needs a leader decision and protection against the old leader continuing to accept writes. A health check alone cannot distinguish a dead machine from a network partition. Fencing, storage ownership, and consensus-based control prevent two authorities from independently accepting conflicting histories.

Synchronous durability is not automatically zero data loss under every failover policy. Consider which replicas acknowledged, which one is promoted, and whether acknowledged data is present there. Define recovery point objective as acceptable data loss and recovery time objective as acceptable restoration time, then test the procedure.

CAP concerns behavior when a network partition prevents coordination: a system cannot guarantee both linearizable consistency and availability for all affected operations under that condition. It does not mean picking any two of three desirable features during normal operation. Different operations can use different tradeoffs if the API makes them explicit.

## Shard by a useful ownership boundary

A shard key determines where data lives and where operations can execute locally. Tenant-based routing often keeps tenant transactions local. It also creates skew when one tenant becomes much larger than the rest. Time-based partitioning simplifies retention but can concentrate writes in the newest partition. A hashed key spreads load but makes ordered ranges and colocated joins harder.

```text
tenant → directory lookup → shard
shard → primary + replicas

Directory entry: tenant 7 → shard B, routing epoch 12
```

A routing directory permits moving a tenant without redefining every key. Migration must handle mixed routing caches, in-flight writes, copy progress, and a cutover barrier. An epoch can help reject stale writers if the receiving storage path enforces it. Merely adding an epoch field to requests has no effect by itself.

Consistent hashing reduces key movement when a node set changes, but does not remove hot keys, replica placement decisions, or rebalancing traffic. Virtual nodes smooth distribution; they do not divide a single indivisible hot record.

## Global operations become explicit work

Cross-shard joins, unique constraints, transactions, and pagination no longer have a cheap local implementation. Decide whether to colocate the invariant, use a distributed transaction supported by the database, maintain a derived global view, or run an asynchronous workflow.

```text
Local tenant order lookup → one shard
All-tenant revenue report → fanout/aggregation or an analytical projection
Globally unique username  → shared authority or a reservation protocol
```

Fanout multiplies tail and failure exposure. Asking 100 shards for a page is not equivalent to asking one database, even when the median shard is fast. Set partial-result and timeout semantics rather than silently dropping slow shards.

## Choose identifiers for their actual guarantees

A database sequence provides efficient local uniqueness, but values can have gaps and need not match commit order. A transaction can allocate an ID, pause, and commit after another transaction with a larger ID. Do not use a sequence alone as a reliable incremental commit cursor.

UUIDs allow independent generation with negligible collision probability under correct generation, not mathematical impossibility. Time-ordered variants can improve locality, but embedded time is not a trustworthy global event order. Snowflake-style IDs combine time, worker identity, and a sequence; worker uniqueness, clock rollback, and per-tick exhaustion become operational responsibilities.

This runnable example distinguishes uniqueness from chronology:

```python
allocated = {"transaction_A": 100, "transaction_B": 101}
commit_order = ["transaction_B", "transaction_A"]
assert [allocated[name] for name in commit_order] == [101, 100]
print("allocation order does not establish commit order")
```

Use a log offset, database-supported commit position, or explicit version where an ordered processing boundary is required. For pagination, pair the chosen order with a deterministic tie breaker; for authorization, never treat a hard-to-guess identifier as permission.

## Expand only after identifying the limit

Before sharding, inspect expensive queries, indexing, hot rows, connection use, storage headroom, and archival opportunities. Partitioning introduces a permanent routing and recovery responsibility. If the measured constraint is one contended inventory row, distributing unrelated rows across ten machines will not remove that serialization point.
