# Retrieval and evidence-grounded generation

A model's weights are a poor store for frequently changing, access-controlled facts. Retrieval-augmented generation supplies selected external evidence at request time so answers can depend on current permitted material. The difficult part is the evidence pipeline: finding the right version, preserving its meaning, choosing what fits, and establishing whether the answer is supported.

## Separate ingestion from answering

Ingestion extracts, normalizes, chunks, embeds, and indexes source content. Answering authenticates a principal, retrieves eligible candidates, ranks and packs evidence, generates a result, and validates it. Keeping these paths explicit makes stale or missing evidence diagnosable.

![A source document passes through extraction, versioned chunks, and indexes. A scoped query retrieves lexical and vector candidates, fuses and reranks them, packs evidence, and generates an answer with validation; authorization gates retrieval and final source access.](/diagrams/ai-rag.svg)

A document record needs a stable source ID, revision, ownership/scope, visibility state, extraction status, and deletion status. Each chunk needs its source revision and location. Rebuilds should not make an old paragraph appear to belong to a newly published policy. Publish an intended version coherently or explicitly tolerate a defined lag.

HTML navigation, repeated footers, OCR errors, and broken tables can dominate retrieval before model choice matters. Inspect extracted content and representative chunks. A clean PDF appearance does not establish a clean machine-readable reading order.

## Chunk around meaning, then measure size

Fixed token windows are a useful baseline. They can split a condition from its consequence, detach a table value from its header, or duplicate the same paragraph across many overlapping chunks. Structure-aware chunking retains headings, boundaries, and enough surrounding context to interpret a result.

| Source form | Useful chunk boundary | Meaning easily lost |
| --- | --- | --- |
| Policy prose | Heading plus related paragraphs | Exception, effective date, scope |
| Tables | Logical row group plus headers/units | Which column a number belongs to |
| Code | Symbol/module plus signature and context | Imports, caller assumptions, version |
| Tickets | Event sequence with speaker/time | Whether a suggestion was accepted |

Use small child chunks for precise matching and fetch a larger parent section when needed. Store both identities so evidence expansion remains versioned. Overlap is a tunable recall aid, not a free improvement: it increases storage, duplicate candidates, and prompt waste. Evaluate answer support and retrieval recall across chunk sizes instead of optimizing the number of chunks.

## Hybrid retrieval addresses different misses

Lexical search finds exact error codes, symbols, rare names, and literal phrases. Dense search finds semantic paraphrases. BM25 weights term evidence using frequency, document length, and corpus rarity; a dense score comes from a learned geometry. Their raw scores are not naturally calibrated to the same scale.

Reciprocal-rank fusion combines ranked lists by adding `1/(k+rank)` for each occurrence. This standalone implementation uses one-based ranks and an illustrative `k=60`:

```python
from collections import defaultdict

def reciprocal_rank_fusion(rankings, k=60):
    scores = defaultdict(float)
    for ranking in rankings:
        for rank, document_id in enumerate(ranking, start=1):
            scores[document_id] += 1 / (k + rank)
    return sorted(scores, key=lambda document_id: (-scores[document_id], document_id))

lexical = ["error-code", "export-policy", "billing"]
dense = ["export-policy", "download-guide", "error-code"]
ranked = reciprocal_rank_fusion([lexical, dense])
print(ranked)
assert ranked[0] == "export-policy"
```

Fusion can promote a document both engines find. It cannot recover a document neither engine retrieves. Deduplicate by stable chunk/source identity and apply access rules before candidate text reaches downstream models. Monitor candidate underfill when tenant or permission filters are selective.

## Reranking spends compute on the candidate boundary

A cross-encoder reranker jointly processes a query and candidate, allowing richer interactions than independently encoded vectors. Use it on a bounded candidate set because scoring every document this way is usually expensive. Other rerankers may use late interaction or generative scoring, with different resource and calibration properties.

A practical pipeline might retrieve 80 lexical and 80 dense candidates, deduplicate to 110, rerank 40, and pack 6–10 evidence units. These are workload examples, not universal settings. Evaluate the first stage where the required passage disappears. Increasing the final prompt budget does nothing if candidate retrieval never found the relevant version.

Measure marginal value: a reranker adding 120 ms may be worthwhile if supported answer rate rises substantially, and wasteful if the candidate set is already easy. Long candidates can be truncated inside the reranker, hiding the decisive sentence; its input limit belongs in the representation contract too.

## Pack evidence as a constrained selection problem

Prompt capacity is finite and redundant text can obscure useful evidence. Pack based on relevance, source diversity, needed dependencies, freshness, and token cost. Reserve output and instruction capacity first. Preserve source IDs and source boundaries so support checks can refer to the exact material used.

This standalone budget example prefers higher-value passages but ensures a required policy stays present:

```python
passages = [
    {"id": "policy", "tokens": 900, "required": True, "score": 0.8},
    {"id": "example-a", "tokens": 700, "required": False, "score": 0.9},
    {"id": "example-b", "tokens": 650, "required": False, "score": 0.7},
]
budget = 1700
ordered = sorted(passages, key=lambda row: (not row["required"], -row["score"]))
selected = []
for passage in ordered:
    if passage["tokens"] <= budget:
        selected.append(passage["id"])
        budget -= passage["tokens"]
    elif passage["required"]:
        raise ValueError("required evidence does not fit")
print(selected)
assert selected == ["policy", "example-a"]
```

This is not an optimal general packer; it exposes an explicit invariant absent from “take top-k.” If a required passage cannot fit, shrink unrelated context or return a defined failure. Do not silently drop the governing condition and ask the model to infer it.

## Advanced retrieval follows the question's structure

A single similarity query is insufficient for some tasks. “Which customers used a removed option after its deprecation?” needs a time-bounded policy lookup plus an authoritative usage query. Retrieve explanatory prose for the first and use structured data operations for the second. A vector index does not supply exact aggregation semantics.

Query rewriting can resolve ambiguous terminology, decompose a question into subqueries, or expand abbreviations. It can also change intent. Preserve the original query and constrain expansions to the authenticated task. Multi-query retrieval increases recall opportunities but adds candidate duplication and latency.

Multi-hop retrieval uses an intermediate result to locate further evidence. Bound hops, record dependencies, and verify entity identity at each step. Graph retrieval can help when explicit relationships matter, such as service ownership or dependency paths. Extracted graphs can contain wrong or stale edges; a graph traversal over unreliable extraction is not inherently more grounded.

For large-corpus synthesis, hierarchical summaries can help discover regions of interest, followed by source retrieval for final claims. Keep summary lineage and refresh rules. A summary may omit an exception; consequential claims should return to authoritative source material. Long-context loading can be a strong baseline for small corpora, but still needs access filtering, context-position tests, and cost measurement.

## Freshness and permissions apply at every reuse point

Cache query results by compatible index revision, query representation, relevant filters, and authorization scope. A cache keyed only by text can leak a previous user's sources. Document ACL changes and deletion must invalidate visibility even if old vectors remain physically stored.

Recheck source permission when an answer is opened later. A generated answer or conversation history can contain material the current principal may no longer access. Decide retention and revalidation behavior explicitly; revoking a source grant does not automatically erase copied text from every downstream artifact.

Citations in a product answer are source identifiers backed by application metadata, not model-invented URLs. Check that a cited source was available in this request, refers to the correct revision, and supports the claim. Existence and support are distinct checks. A correct citation attached to an unsupported sentence is still a grounding failure.

## Evaluate the first lost invariant

Build cases with expected evidence, no-answer outcomes, conflicting revisions, permission changes, and adversarial source text. Measure retrieval recall, rank quality, evidence inclusion, claim support, and accepted end-to-end outcomes separately.

| Failure | First inspection |
| --- | --- |
| Answer absent from corpus | Source coverage and expected abstention |
| Correct source not indexed | Extraction/version publication |
| Indexed passage absent from candidates | Lexical/dense recall, filters, query representation |
| Candidate omitted from prompt | Reranking, deduplication, packing dependencies |
| Evidence present but claim unsupported | Generation contract and support grading |
| Correct content from forbidden source | Authorization and cache identity |

This decomposition makes improvement targeted. A better generator cannot compensate for an unauthorized source, and a larger vector database cannot repair a table whose units were lost during extraction.
