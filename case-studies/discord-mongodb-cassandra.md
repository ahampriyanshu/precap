# Moving billions of messages from MongoDB to Cassandra

## Context

Discord launched in 2015 on MongoDB. By 2017 they had accumulated ~100 million messages across millions of channels, with daily message volume growing rapidly. The data model was straightforward: a single `messages` collection with a compound index on `(channel_id, created_at)`. MongoDB's B-tree indexes served them well at small scale. The problem was entirely predictable in retrospect — it just took growth to surface it. When index size outgrew available RAM, the latency profile changed from milliseconds to seconds in the worst case.

## The problem

MongoDB's default storage engine (WiredTiger by 2017) uses B-tree indexes. For the messages collection, the compound index on `(channel_id, created_at)` allowed efficient range scans within a channel. This works as long as the working set of the index fits in RAM.

As Discord scaled, two things happened simultaneously. First, the total index size grew past available RAM, forcing the OS to page index nodes in and out of disk. Second, access patterns were highly non-uniform — popular channels (gaming servers, announcement channels) saw vastly more reads than quiet ones. This created hot spots where the same index pages were repeatedly evicted and re-fetched.

The concrete failure mode: a read request for recent messages in a hot channel would scan a B-tree range, encounter index nodes not in the buffer pool, and block on disk I/O. MongoDB's read path at the time locked the collection-level reader context during I/O, amplifying the latency impact across concurrent readers.

Tail latency (p99) on message fetches climbed into the seconds. Because Discord's WebSocket gateway waited synchronously for message history before delivering a channel load, this manifested as channels appearing to "hang" for users. The issue was reproducible and load-dependent — quiet periods were fine, peak hours were broken.

The fundamental issue was a data model mismatch. MongoDB's document model and B-tree indexes are general-purpose. Discord's access pattern is append-only writes and time-bounded range reads per channel — a pattern that maps naturally to log-structured storage, not B-trees.

## What they tried first

The team first attempted to tune MongoDB. They increased the WiredTiger cache size, added read replicas to offload read traffic, and experimented with index prefix compression to reduce index memory footprint.

Read replicas helped briefly but didn't address the root cause — the index was still B-tree-based, and even with replicas, any node serving a cold channel would hit disk. Cache increases delayed the problem but didn't eliminate it. With message volume doubling roughly every few months, any headroom bought by tuning was consumed quickly.

They also looked at bucketing within MongoDB: pre-aggregating messages into documents where each document held a fixed-size batch of messages per channel. This would have reduced index cardinality, but implementing it on a live collection without downtime was operationally complex, and it still didn't address the fundamental B-tree read amplification problem on cold partitions.

After these incremental attempts, the team concluded the data model itself was wrong for the access pattern, not just the tuning parameters.

## The fix

The migration target was Apache Cassandra, chosen because its storage model — SSTables with log-structured merge (LSM) trees — aligns directly with append-only write patterns, and because its partition model gives explicit control over data locality.

**Data model redesign:** The core insight was to introduce a `bucket` column alongside `channel_id` as a composite partition key. `bucket = message_timestamp / BUCKET_SIZE`, where BUCKET_SIZE was chosen to bound partition size to a few hundred megabytes (roughly 10 days of messages for the busiest channels). The clustering key within each partition is `message_id` (a Snowflake-style ID with time embedded).

```
CREATE TABLE messages (
  channel_id  bigint,
  bucket      int,         -- epoch_ms / BUCKET_SIZE
  message_id  bigint,      -- time-ordered Snowflake ID
  author_id   bigint,
  content     text,
  PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
```

**Write path:** Pure appends to the current bucket for a channel. Cassandra's LSM storage handles high write throughput without the read-amplification penalty of B-trees. Writes go to the commit log and memtable in memory, flushed to SSTables asynchronously.

**Read path:** Fetching recent messages means querying the current bucket. If fewer than the requested page size of messages are returned (bucket boundary), the client scatters to the previous bucket and merges. Because bucket IDs are deterministic from timestamps, no index lookup is needed to find which bucket to query.

**Bounded partition size:** The bucket scheme guarantees partitions stay small. Cassandra performance degrades with very large partitions (Cassandra reads an entire partition's index block even for point lookups). Keeping partitions under a few hundred MB avoids this.

**Migration strategy:** Discord ran a dual-write period where new messages were written to both MongoDB and Cassandra. Historical data was backfilled with a background job that read from MongoDB and wrote to Cassandra in time-ordered batches. After validation (comparing read results between both systems), read traffic was gradually shifted to Cassandra by channel percentile, with MongoDB as fallback for mismatches.

The migration completed without user-visible downtime. Post-migration, p99 read latency dropped from seconds to low single-digit milliseconds.

## What it cost

The migration required roughly six months of engineering time across infrastructure and backend teams. Running dual writes doubled write load on the database tier temporarily. The Cassandra cluster required provisioning additional hardware capacity upfront — Cassandra is memory and I/O hungry and doesn't scale down cheaply.

Operationally, Cassandra is more complex to run than MongoDB. Compaction strategies, tombstone accumulation (delete-heavy workloads produce tombstones that slow reads), and repair scheduling became ongoing concerns. Discord also had to instrument and monitor partition sizes continuously to catch channels where bucket sizing assumptions broke down. The eventual consistency model required explicit handling of edge cases in the read path.

## Takeaways

- **Data model must match access pattern**: B-tree indexes are general-purpose; LSM trees favor append-heavy workloads. Picking the wrong one means tuning is a losing battle.
- **Partition key design controls data locality**: In Cassandra, the partition key determines which node holds the data. A bad partition key (e.g., just `channel_id`) produces unbounded partitions; a composite key with a time bucket bounds them.
- **Working set vs. total data size is the threshold that matters**: MongoDB was fine until the index stopped fitting in RAM. The transition from RAM-resident to disk-resident indexes is a step-function change in latency, not gradual.
- **Dual-write migration with percentage-based traffic shifting is the safest live migration pattern**: Allows rollback at each step, validates data correctness before committing.
- **Eventual consistency has real product implications**: Any migration to Cassandra requires auditing every read path for consistency assumptions that were previously implicit in a strongly consistent store.

## Interview angle

This case study surfaces at the intersection of database internals and data modeling questions.

A common framing: *"You have a chat application. Messages are written constantly and users read recent history. How do you design the storage layer at scale?"* The expected answer covers partition key design — specifically why `channel_id` alone is a bad partition key (unbounded growth), why `(channel_id, bucket)` works, and how to pick `BUCKET_SIZE`.

Follow-up questions often probe: What happens when a user scrolls back through a year of messages? (Answer: paginate across buckets, scatter-gather, merge by message_id.) How do you handle deletes? (Cassandra uses tombstones; they accumulate and slow reads if not compacted — TTL or explicit compaction tuning needed.) What's the consistency model? (Eventual by default; `QUORUM` reads/writes for stronger consistency at latency cost.)

The MongoDB → Cassandra migration is also a good vehicle for questions about live data migrations: dual-write pattern, backfill strategy, validation, traffic cutover, and rollback plan. If you say "big bang migration," you fail the question.

---
*Source: Discord Engineering Blog, 2017. "How Discord Stores Billions of Messages."*
