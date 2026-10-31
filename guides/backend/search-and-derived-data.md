# Search indexes and derived data

Transactional databases answer authoritative questions: whether an order exists, who owns it, and which state committed. Search systems answer a different kind of question: which documents best match a phrase, filter, or similarity request. Inverted indexes were introduced because scanning every document and scoring every word does not scale to interactive search.

A search index, materialized view, or analytical projection is derived state. Its value comes from a better read model; its cost is keeping that model correct enough, fresh enough, and recoverable.

## How an inverted index changes the work

An inverted index maps a term to documents containing it, often including positions and field statistics. A query first finds candidate documents, then filters and ranks them. Tokenization, normalization, stemming, synonyms, and field weighting change what matching means; they are product behavior, not merely storage settings.

This runnable miniature shows candidate retrieval without attempting a production ranking model:

```python
from collections import defaultdict
import re

documents = {
    1: "payment authorization timed out",
    2: "payment captured successfully",
    3: "inventory reservation timed out",
}
index = defaultdict(set)
for document_id, text in documents.items():
    for term in set(re.findall(r"[a-z]+", text.lower())):
        index[term].add(document_id)

candidates = index["payment"] & index["out"]
assert candidates == {1}
print(sorted(candidates))
```

Real search must handle language, punctuation, phrase positions, typos, filters, ranking, and updates. BM25-like lexical scoring uses term occurrence and corpus statistics to rank matches; it is not a measure of factual correctness. Embedding search finds nearby vectors under a chosen metric but can return conceptually related material without exact keyword matches. Hybrid retrieval combines candidate sources with a deliberate ranking policy.

## Start with the simplest useful index

PostgreSQL full-text search can cover many application search needs without another cluster. This integration fragment stores a generated search document and indexes it:

```sql
ALTER TABLE articles ADD COLUMN search_document tsvector
GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
) STORED;

CREATE INDEX articles_search ON articles USING GIN (search_document);

SELECT id, title,
       ts_rank(search_document, websearch_to_tsquery('english', $2)) AS rank
FROM articles
WHERE tenant_id = $1
  AND search_document @@ websearch_to_tsquery('english', $2)
ORDER BY rank DESC, id DESC
LIMIT 20;
```

This assumes an `articles` table with the named columns. Index changes and generated-column backfills need an operational rollout plan for a large table. Apply tenant and permission scope before returning results, including snippets, counts, suggestions, and facets. Filtering a returned page afterward can both leak information and produce incomplete, misleading pages.

A dedicated engine becomes useful for richer analyzers, ranking controls, large-scale distributed search, or operational separation. It also adds data synchronization, shard planning, index versioning, and another failure mode. Choose from measured workload and search requirements rather than a default service list.

## Synchronization needs versions and deletion semantics

The authoritative transaction can emit an outbox event; a consumer updates the index. Records need stable identity and a monotonic per-record version or equivalent ordering contract. A delayed update must not resurrect a document after a newer deletion.

```text
Source version 10 → title changed
Source version 11 → document deleted

Index receives delete v11, then delayed update v10.
Without a version/tombstone rule, the deleted document can reappear.
```

A deletion event needs enough information to remove derived data even after the source row is gone. Tombstone retention must cover the replay and lag window. Privacy deletion includes search indexes, caches, exports, object storage, and the documented backup-retention policy; deleting only the primary row is incomplete.

Refresh and commit behavior determine when indexed changes become searchable. Measure source-to-search lag and expose the user experience deliberately: a newly edited document may show authoritative detail immediately while search catches up. Do not make a security revocation depend on an indefinitely stale search ACL. Recheck access at the authoritative boundary when required.

## Rebuild without losing concurrent changes

An index must be reproducible. A full rebuild that scans current rows and then switches traffic can miss updates that occurred during the scan unless the change stream has a coordinated boundary.

```text
1. Establish a recoverable source snapshot and change-stream position.
2. Build a new index generation from that snapshot.
3. Apply changes after the recorded position with version checks.
4. Catch up and validate counts, deletions, samples, and query behavior.
5. Switch the read alias; retain a bounded rollback window.
```

The exact snapshot/log-position coordination depends on the database and capture system. A timestamp guessed before the scan is not automatically a safe change-data-capture boundary. Backfill events and live events need a rule that prevents older values overwriting newer ones.

## Materialized views and analytical projections

A denormalized dashboard can precompute totals rather than rerun expensive joins on every request. Distinguish a replaceable aggregate from an authoritative ledger. Incrementing a counter on every redelivered event overcounts unless the consumer deduplicates or uses a versioned replacement strategy.

```text
Authoritative ledger: immutable accepted monetary entries
Derived daily revenue: sum of eligible ledger entries under a named rule
Reconciliation: compare derived totals to a fresh source aggregation
```

Define how late events, corrections, refunds, timezone boundaries, and deleted records affect the view. Event time and processing time answer different questions. A chart labeled “revenue yesterday” needs a timezone and revision policy, not just a scheduled query.

Monitor indexing failures, oldest unapplied event age, source/index version divergence, query latency, empty-result rate, and relevance quality. A healthy cluster with stale or inaccessible results is still a product failure.
