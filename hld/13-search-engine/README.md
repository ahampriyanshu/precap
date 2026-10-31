# Search Engine

## The problem

A search service turns document changes into ranked query results. Assume 100 million documents, 2 KB of searchable text per document, and 5,000 queries per second. Raw text alone occupies about 200 GB before indexes, stored fields, replicas, and operational headroom. With 20 shards, every unpruned query fans out to 20 shard requests: roughly 100,000 shard requests per second. Partition count changes the work behind each user request.

For this design, queries should usually finish within 200 ms, and document updates may take a few seconds to appear. Deletes must eventually remove results without allowing an older update to resurrect them. The authoritative document store owns accepted content and versions; the search index is a derived serving view that can be rebuilt. Search visibility and durable acceptance are separate promises.

## Naive approach

Scanning every stored document and sorting every match works for a small corpus, but cannot sustain this workload. An inverted index improves lookup while introducing a derived-state lifecycle. Ignoring document versions allows a delayed event to resurrect a deletion:

```pseudocode
apply(document_id, version=8, deleted=true)
# A delayed earlier event arrives after the delete.
apply(document_id, version=7, deleted=false, content=old_text)
search(document_id) -> old_text
# Arrival order replaced a newer authoritative state.
```

A queue can reorder or redeliver events. The index needs a durable per-document version boundary, not an assumption that ingestion time is source order.

## Where the naive approach breaks

Adding shards creates coordination questions. Scores computed from unrelated shard-local statistics may not be comparable. A coordinator cannot simply append each shard's top ten, because the global best ten may all belong to one shard. Timeouts can make an apparently fast response incomplete; the API must reveal partial results or fail according to a documented policy.

Updates also arrive out of order. Version 8 may be indexed before a delayed version 7. A delete followed by an older update must remain deleted. If tombstones disappear too soon, a replay can revive removed content. Finally, acknowledging an accepted event does not mean every query replica has refreshed its searchable view. Retrying the write until it appears can create additional load without fixing the underlying visibility delay.

## A better design

Separate ingestion from querying around a versioned, partitioned index:

```text
Document API -> Primary store / change log -> Index workers -> Search shards
Client -> Query coordinator -> Search shards
```

The document API commits authorized content/version plus an outbox event. At-least-once workers route each document to one shard. A relational version gate is:

```sql
INSERT INTO indexed_versions AS stored
    (document_id, version, content, deleted)
VALUES ($1, $2, $3, $4)
ON CONFLICT (document_id) DO UPDATE
SET version = EXCLUDED.version,
    content = EXCLUDED.content,
    deleted = EXCLUDED.deleted
WHERE stored.version < EXCLUDED.version
RETURNING document_id, version;
```

Assume a primary key on document ID and trusted source-monotonic versions. PostgreSQL evaluates the conflict update under its row coordination, so a stale or equal event changes nothing. Equal-version payloads must agree; detect producer conflicts separately. This table illustrates version admission, not posting-list construction. The shard must coordinate the fence with index mutation or recover safely from its log.

Keep tombstone versions until replay and replica recovery cannot reintroduce older content. Recoverable logs and checkpoints support rebuilds; compacting tombstones without a replay bound loses the fence. Reindex into a new generation, validate it, then switch an alias rather than serve a half-built schema.

`GET /search?q=...&limit=10` returns IDs, comparable scores, generation, and completeness. Shards use the same token analysis and ranking contract. A coordinator merges shard top-k results with a stable ID tie-break. Local top k suffices only when each document has one shard owner and scores share one comparable ordering. Replica copies are not extra documents. A timeout must produce explicit partial results or fail according to policy.

Search visibility differs from durable event acceptance. Refresh publishes a searchable view; a read-after-write option may wait for a specific version or refresh token, adding latency and coupling.

Apply authorization filters inside shard candidate selection. Filtering only after the top ten can leak or omit authorized matches. Bound query fanout, expensive filters, and result sizes; slow shards dominate tail latency. Monitor ingestion lag, stale-event rejection, refresh age, shard skew, partial-query rate, and p99 latency.

## Real-world usage

Catalogues, documents, and log search trade immediate visibility for efficient ranked reads. The serving contract must include rebuilds, authorization, and explicit partial-result behavior.

## Practice

### Design brief

Design search for 100 million documents with 2 KB of searchable text each and 5,000 queries per second. Queries should usually finish within 200 ms; updates may take a few seconds to appear. Deletes must not be undone by older updates. With 20 shards, unpruned queries create roughly 100,000 shard requests per second. State freshness, completeness, and relevance expectations before choosing partitioning.

### Draw and explain

Use Excalidraw to separate authoritative documents, change ingestion, derived indexes, and query serving. Label document versions, shard ownership, searchable generations, access checks, and durable rebuild sources. Trace an accepted update to searchable visibility, then a query through candidate selection and global result merging. Explain score comparability, tie-breaking, and what the response says when a shard misses its deadline.

### Stress the design

A delete is indexed, then an older update arrives from replay. Show why the document stays deleted and how long the required ordering evidence survives. Next, slow one shard during a query. Draw deadline handling and the user's observable completeness contract without exceeding the latency budget silently.

### Review your design

Compare shard count with fanout cost, skew, and recovery time. Explain read-after-write options, safe index-generation replacement, and temporary rebuild storage. Check authorization before candidate truncation and cache scope. Choose signals for ingestion lag, stale-event rejection, refresh age, partial queries, and tail latency.
