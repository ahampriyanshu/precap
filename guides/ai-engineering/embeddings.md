# Embeddings and vector indexes

Keyword matching struggles when relevant material uses different wording. Embeddings learn a representation in which useful relationships become searchable through vector comparison. Approximate indexes make that search affordable over large collections. Neither mechanism establishes factual truth or access rights; they decide which candidates deserve further inspection.

## An embedding is a representation contract

An encoder maps text, images, or other input into a fixed-dimensional vector. Training determines which similarities the geometry tends to preserve. Contrastive training commonly pulls relevant pairs closer and pushes selected negatives apart. Negative sampling matters: distinguishing an invoice from a landscape is easier than distinguishing two almost identical invoice policies.

The contract includes model revision, preprocessing, token limit, pooling, query/document prefixes, vector dimension, normalization, and distance metric. Equal dimensions do not make two encoders compatible. Even the same model with a changed instruction prefix can shift retrieval behavior.

```json
{
  "index_revision": "docs-14",
  "encoder_revision": "domain-encoder-3",
  "dimensions": 768,
  "query_template": "query-v2",
  "document_template": "passage-v2",
  "normalization": "unit_length",
  "metric": "cosine",
  "chunker_revision": "sections-5"
}
```

Treat this metadata as part of the index schema. Reject incompatible query vectors rather than returning plausible-looking scores from unrelated spaces. Measure multilingual content, exact identifiers, negation, tables, and long passages separately.

## Exact search provides a baseline

Cosine similarity measures direction. Dot product also responds to magnitude unless vectors are normalized. Squared Euclidean distance and dot product induce related rankings for unit-normalized vectors, but this equivalence does not apply blindly to arbitrary vectors.

```python
import math

def cosine(left, right):
    dot = sum(a * b for a, b in zip(left, right, strict=True))
    norm = math.sqrt(sum(a*a for a in left) * sum(b*b for b in right))
    if norm == 0:
        raise ValueError("zero vector has no cosine direction")
    return dot / norm

vectors = {"export-guide": [0.9, 0.1], "billing": [0.2, 0.8]}
ranked = sorted(vectors, key=lambda key: cosine([1.0, 0.0], vectors[key]),
                reverse=True)
print(ranked)
assert ranked == ["export-guide", "billing"]
```

The invented vectors expose the calculation; training supplies real semantic quality. A similarity of 0.82 is not an 82% probability of relevance or correctness. Thresholds vary by model, domain, query distribution, and preprocessing.

Exact comparison costs roughly `O(ND)` arithmetic for `N` vectors of width `D`. Raw float32 storage for one million 768-dimensional vectors is about 2.86 GiB, before IDs, metadata, text, indexes, replicas, and allocator overhead. Measure this baseline on a tractable corpus before adding approximation: it distinguishes a representation failure from an index-recall failure.

## HNSW and IVF avoid exhaustive comparison

HNSW organizes vectors into a layered navigable graph. Search first makes broad progress in upper layers and explores a neighborhood in lower layers. More search exploration usually increases recall and query work; more graph connectivity usually increases memory and build cost. Parameter names and update behavior depend on the implementation.

IVF-style indexes group vectors around coarse centroids and search selected partitions. Searching more partitions improves opportunities to find neighbors at additional cost. Product quantization compresses vector representations into codebooks, reducing storage and distance work with approximation error. Quantization and candidate pruning are different sources of lost recall.

![Exact search scans all vectors; graph search explores connected neighbors; inverted-file search selects coarse partitions and compares candidates within them.](/diagrams/ai-vector-indexes.svg)

Benchmark recall against exact nearest neighbors under the same metric, then evaluate semantic relevance separately. An ANN index can have excellent geometric recall over an embedding space that represents the task poorly. Conversely, an excellent encoder can appear weak because a restrictive ANN search misses its nearest neighbors.

## Filtering changes the search problem

A user may search only one tenant, language, document version, or permission scope. Filtering after a small global candidate search can underfill results and miss relevant eligible documents. Filtering before or during traversal can affect index navigation and latency. The database/index implementation determines the available strategies.

This PostgreSQL/pgvector integration fragment assumes compatible vectors and tables with current versions and document grants:

```sql
SELECT c.id, c.document_id, c.version, c.body
FROM document_chunks AS c
WHERE c.tenant_id = $2
  AND c.embedding_revision = $3
  AND c.is_current = true
  AND EXISTS (
    SELECT 1 FROM document_grants AS g
    WHERE g.tenant_id = c.tenant_id
      AND g.document_id = c.document_id
      AND g.principal_id = $4
  )
ORDER BY c.embedding <=> $1
LIMIT 6;
```

Identity and tenant parameters come from trusted authentication. The predicate constrains returned rows, but does not by itself guarantee that an approximate index will find six eligible rows or internally traverse only eligible candidates. Inspect plans; test selective filters; consider exact scans for small eligible sets, iterative search, partitions, or larger bounded candidate budgets. Never send unauthorized text to a reranker/model and ask it to conceal the material.

## Updates and migrations need a consistency policy

Text extraction, chunking, embedding, indexing, and deletion do not complete atomically by default. A source update can temporarily leave mixed document versions. Store source IDs and revisions on every chunk, build an index revision, and switch visibility only after the intended revision is ready.

For encoder migration, build the new vector space separately. Dual-write or replay source changes with a durable checkpoint, evaluate relevance and resource use, then switch query encoder and index together. A gradual migration that mixes incompatible vectors in one comparison is invalid even if dimensions match.

Deletion requires propagation through source stores, chunks, vector indexes, caches, evaluation fixtures, and generated artifacts according to policy. Index compaction may be asynchronous; application visibility and physical reclamation are different events. Authorization changes should take effect at the read boundary even if reindexing lags.

## Retrieval quality needs labeled queries

Track candidate recall, ranking quality, latency, and underfill by realistic query strata. Include exact error codes, abbreviations, misspellings, negation, ambiguous entities, and no-answer queries. A nearest neighbor exists for almost every nonempty vector collection; its existence does not mean the corpus contains an answer.

Use embeddings where paraphrase tolerance adds value. Keep lexical lookup for identifiers and structured filters for authoritative attributes. The next layer combines these candidate sources into an evidence pipeline rather than treating vector similarity as the whole search system.
