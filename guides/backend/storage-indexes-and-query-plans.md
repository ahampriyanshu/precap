# Storage engines, indexes, and query plans

Persistence is more than writing a row. The storage engine must turn logical changes into recoverable bytes, find records without scanning everything, and reclaim obsolete versions. Indexes were introduced to reduce read work by maintaining additional access paths. Every such path adds write, memory, and maintenance cost.

This page uses PostgreSQL for concrete examples. The method generalizes: understand the workload, inspect the actual plan, account for storage behavior, and measure with representative data.

## What a durable write does

A database typically changes in-memory pages and records recovery information before those pages reach their final location. In PostgreSQL, write-ahead logging allows crash recovery to redo necessary changes. Commit durability depends on configured flush behavior and the storage system; an HTTP success must align with the durability promise the product makes.

```text
transaction changes buffers
  → write recovery records
  → commit waits for the configured durability boundary
  → dirty data pages can be written later

After a crash: replay the durable recovery log as needed.
```

Replication, backups, and recovery logs solve related but different problems. A replica can repeat an accidental deletion. A backup without the required logs may not recover to the desired point in time. Test restoration and measure recovery time rather than treating “backup job succeeded” as a recovery guarantee.

MVCC updates create row versions rather than rewriting the only visible copy immediately. Vacuum reclaims space that no active snapshot needs and maintains visibility information. Long transactions can retain old versions, increase bloat, and interfere with maintenance even when they perform little visible work.

## An index is an ordered route to candidate rows

A B-tree keeps keys in an ordered structure with bounded page traversal. It supports equality, ranges, and compatible ordering. A hash map's expected constant-time lookup is not a universal replacement: range scans, persistence, concurrency, and storage-page behavior change the requirements.

For tenant-specific history, put the equality scope before the ordered seek keys:

```sql
CREATE INDEX orders_history
ON orders (tenant_id, created_at DESC, id DESC)
INCLUDE (state, total_minor);

SELECT id, created_at, state, total_minor
FROM orders
WHERE tenant_id = 7
  AND (created_at, id) < ('2026-10-01T12:00:00Z', 9001)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

The index narrows the tenant range and provides the requested order. Included columns may support an index-only scan, but PostgreSQL still needs visibility information; pages not marked all-visible can require heap fetches. A covering index does not guarantee zero table access. Additional included data also makes the index larger and updates more expensive.

An index on every column is rarely a good design. Start from expensive query shapes, selectivity, sort order, and write rate. A sequential scan can beat random index-driven heap access when a large fraction of a table is needed.

## Read plans as counts of work

Use estimated plans freely. `EXPLAIN ANALYZE` executes the statement, so run mutating or expensive statements only with an appropriate environment, transaction, and workload budget.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, state
FROM orders
WHERE tenant_id = 7 AND state = 'pending'
ORDER BY created_at DESC
LIMIT 50;
```

Inspect estimated versus actual rows, loops, filters, sort behavior, and buffers. A node returning 5 rows across 10,000 loops may perform 50,000 rows of work. “Rows removed by filter” can expose reading a large candidate set to retain very little. A shared-buffer hit avoids storage reads but still consumes CPU and memory bandwidth.

```text
Nested Loop
  customer candidates: actual rows=12,000
  orders lookup:      actual rows=20 loops=12,000

The inner access runs 12,000 times; its small per-loop time accumulates.
```

Large estimate errors can produce bad join choices. Refresh statistics when appropriate and inspect skew or correlated columns. Tenant sizes often differ by orders of magnitude; a plan tested on one tiny tenant may not represent the largest tenant. Parameterized queries and prepared statements add plan-selection considerations, so reproduce the application's actual execution path.

## Avoid moving query work into the application

An ORM does not remove database costs. Lazy relationships can create N+1 queries. Loading all rows and filtering in Python transfers unnecessary data, uses application memory, and misses useful database access paths.

```sql
SELECT o.id, o.state, COUNT(l.line_no) AS line_count
FROM orders AS o
LEFT JOIN order_lines AS l
  ON l.tenant_id = o.tenant_id AND l.order_id = o.id
WHERE o.tenant_id = $1 AND o.id = ANY($2)
GROUP BY o.id, o.state;
```

This batch shape assumes an appropriate orders key and order-lines key. It replaces repeated line-count lookups for a bounded page. It is not automatically optimal for every cardinality: inspect whether joining and aggregating only the intended IDs occurs in the chosen plan.

## Different indexes and engines serve different work

PostgreSQL GIN indexes can support containment and full-text token lookup. BRIN stores summaries over physical ranges and can be compact for large, naturally correlated append-heavy tables. Partial indexes target a useful subset, such as active jobs. Expression indexes help when queries consistently use an indexed expression. The query predicate must match the intended access path.

LSM-based engines organize writes through memory structures, immutable sorted runs, and compaction. They can provide efficient ingestion but trade that for read amplification, space amplification, and compaction work. Bloom filters reduce unnecessary lookups in runs; they admit false positives and do not replace the underlying record lookup. Neither B-tree nor LSM is universally faster.

Partitioning can improve pruning and lifecycle operations when queries include a suitable partition key. It is not equivalent to distributing compute across machines. Too many partitions can add planning and management cost. A monthly partition strategy does little for a query that provides no time bound.

## Changes must survive production conditions

Index creation consumes I/O and space and can affect replication lag. PostgreSQL's concurrent index build reduces write blocking but has operational restrictions and can leave an invalid index on failure. Schema changes need a plan for old and new code, long transactions, and rollback.

Validate improvements using latency distributions, rows and bytes processed, database CPU, buffers, write overhead, and large-tenant behavior. A faster isolated query that doubles write cost or saturates storage under peak ingestion may be a poor system change.
