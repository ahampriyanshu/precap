# Distributed Message Queue

## The problem

A distributed queue decouples an event producer from the services that process its events. Design a partitioned, retained log for order events. Producers should survive a slow downstream service; consumers should restart and resume. Events for one order need a stable order, while unrelated orders can progress independently. Retention allows replay after a consumer bug, so consuming a record does not immediately delete it.

Assume 50,000 events per second, averaging 1 KB, retained for 24 hours. That is about 4.32 TB of logical payload per day. Three copies require roughly 13 TB before indexes, headers, and operating headroom. Storage and recovery bandwidth matter as much as steady-state throughput. Define a producer acknowledgement to mean durable replication under an explicit failure policy, not merely receipt by a socket.

## Naive approach

A table of unprocessed events can serve a small queue, but a global processed flag cannot track independent groups. Parallel completion also breaks a “highest completed offset” checkpoint:

```pseudocode
start processing offset 10
start processing offset 11
finish offset 11
save committed_next_offset = 12
crash before finishing offset 10
restart at 12  # Offset 10 was silently skipped.
```

A global lock avoids concurrent completion by serializing all work; deleting completed rows instead sacrifices replay for other groups.

## Where the naive approach breaks

Consider offsets 10 and 11 processed concurrently. Worker B finishes 11 first and records “processed through 11.” Worker A crashes before finishing 10. Restarting at 12 silently loses work. The latest completed offset is not the same as a contiguous completed prefix.

Now consider reassignment. A paused consumer retains an old batch, its partition moves to a replacement, and the paused consumer resumes. Without a generation check, both can advance progress. Even correct queue acknowledgements do not make an external charge atomic with that progress: a charge can succeed just before the consumer crashes. Redelivery may repeat the charge unless the downstream operation has its own idempotency boundary.

## A better design

Partition by stable order identity and assign each partition to one consumer within each group:

```text
Producer -> Partition leader -> Replicated log -> Consumer group -> Business store
                                 ^                   |
                                 +-- Coordinator <---+
```

A leader assigns partition offsets and replicates before acknowledging under a defined durability policy. A coordinator owns assignment generations and committed progress. Different groups keep independent positions against the retained log. Leader election also needs a replication protocol that prevents an obsolete leader from accepting writes; a partition function cannot supply that guarantee.

A consumer that parallelizes a batch needs to track completion gaps. The checkpoint algorithm is local pseudocode; the broker commit still requires a valid assignment generation:

```pseudocode
next_offset = 10
completed = {11}
while next_offset in completed:
    completed.remove(next_offset)
    next_offset += 1
# next_offset is still 10: do not skip the gap.
completed.add(10)
while next_offset in completed:
    completed.remove(next_offset)
    next_offset += 1
commit(group, generation, partition, next_offset)  # Now 12.
```

A crash before 10 finishes replays both 10 and 11. Repetition is the cost of avoiding loss. The broker must reject an obsolete generation’s commit, and the business destination needs idempotency if replay could repeat effects. [Kafka’s design documentation](https://kafka.apache.org/40/design/design/) explains the additional cooperation required for effects outside the log.

Expose append, bounded poll, and commit APIs; persist records under `(topic, partition, offset)` and progress under `(group, topic, partition)`. Commit stores the next offset to read, not merely the most recently observed result. Stable partition placement orders appends per key; if business effects themselves must be ordered, serialize those effects too. Concurrent completion can otherwise invert them.

Changing partition count can change placement and requires migration planning. More partitions increase parallelism but add metadata, files, replication, and rebalance work; one hot key still limits a partition. Retention bounds replay: a consumer behind longer than retained history needs an explicit recovery procedure. Monitor lag in records and seconds, under-replicated partitions, rebalance frequency, poison retries, and producer acknowledgement latency. Enforce topic/group permissions and payload and producer quotas.

## Real-world usage

Order pipelines and change-data processing benefit from replay and independent groups. Independent tasks without replay may suit a work queue that deletes acknowledged jobs. Synchronous replication strengthens acknowledged-write safety at extra latency and can reduce write availability when enough replicas are unreachable.

## Practice

### Design brief

Design a retained log for order events at 50,000 events per second, averaging 1 KB and retained for 24 hours. Logical payload is about 4.32 TB daily; three copies require roughly 13 TB before overhead. Preserve order within an order while allowing unrelated orders to progress independently. Support independent consumer groups and replay. Define producer durability and consumer recovery promises.

### Draw and explain

Use Excalidraw to show partition placement, replicated storage, producer routing, group coordination, and downstream business effects. Label leaders, ownership generations, offsets, and durable progress. Trace append through acknowledgement, consumption through progress advancement, and a new group replaying retained data. Estimate storage and recovery bandwidth, then explain how partition count limits useful consumer parallelism.

### Stress the design

A consumer finishes offset 11 before offset 10, then crashes. Draw its valid restart point and which records may repeat. Next, reassign a partition while its old consumer pauses and later resumes. Explain how stale progress updates are rejected and how an external charge avoids duplication if processing repeats.

### Review your design

Check ordered effects separately from ordered log records. Compare replication acknowledgements against write latency and availability. Explain hot-order limits, poison-event handling, and what happens when lag exceeds retention. Assess the cost of repartitioning and group rebalances. Choose signals for replication health, acknowledgement latency, lag age, and replay capacity.
