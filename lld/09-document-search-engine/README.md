# Document Search Engine

## The problem

A document search engine owns original text and an index derived from that text. Its job is to find matching documents, score them consistently, and keep results correct when a document changes or disappears. These are distinct responsibilities: the text is the source of truth, while the index is a structure built to answer a particular class of queries efficiently.

Define tokenization before designing search. Here, lowercasing followed by extraction of ASCII letter-or-digit runs turns `"Red, BLUE-blue!"` into `['red', 'blue', 'blue']`. Punctuation and underscores separate tokens. Matching tokens is different from matching arbitrary substrings: searching for `"red"` must not find `"credit"`.

## Naive approach

Store a dictionary from document identifier to text. For every query, tokenize every document, count the requested term, sort the matching documents, and return the requested number. For a phrase, slide a window across each document's token sequence and compare the tokens in order.

A term-set check cannot establish phrase adjacency:

```python
tokens = "red slow fox".split()
query = ["red", "fox"]
contains_all = all(term in set(tokens) for term in query)
contains_phrase = any(tokens[i:i + len(query)] == query
                      for i in range(len(tokens) - len(query) + 1))
print(contains_all, contains_phrase)
assert contains_all and not contains_phrase
```

Both terms occur, but their positions differ by two rather than one. Frequency-only postings have discarded information required by a phrase query.

This implementation is straightforward and can be a useful baseline for a small collection. Repeating tokenization, however, makes every search pay for all stored text, including documents that cannot possibly match. Caching tokens per document removes repeated parsing but still scans all documents to locate a rare term.

## Where the naive approach breaks

Suppose only two documents in a collection contain `"python"`. Scanning every document for that query does work proportional to the whole collection rather than the matching subset. A simple term counter also loses positions. A document containing `"red slow fox"` and another containing `"red fox"` both contain the terms `red` and `fox`, but only the second contains the consecutive phrase.

Updates introduce a correctness failure. Add document `a` with `"red red"`, then replace its text with `"blue"`. If indexing only adds new postings, `a` still appears for `red`. Deletion followed by reuse of the same identifier can revive stale matches as well. An index needs a complete lifecycle, not just a fast insert method.

## A better design

Maintain original documents and a positional inverted index: each term maps to document identifiers and their token positions. Keep the old document's token information so replacing or deleting it can remove every old posting before adding new ones. In this exercise, eager removal is easier to reason about than versioned stale postings and background cleanup.

Intersect position offsets after selecting candidate documents:

```python
positions = {"red": {0, 2}, "fox": {1, 3}}
phrase = ["red", "fox"]
starts = set(positions[phrase[0]])
for offset, term in enumerate(phrase[1:], 1):
    starts &= {position - offset for position in positions[term]}
print(sorted(starts))
assert starts == {0, 2}
```

Two starts mean two phrase occurrences in this document. The query fragment assumes every phrase term is present; document intersection, tokenization, result ranking, and removal of old postings remain separate responsibilities.

For `C` text characters and `L` tokens, tokenization scans `O(C)` characters, postings construction adds `O(L)` work, and the index stores `O(L)` positions. A term query visits its `P` document postings and sorting costs `O(P log P)`. Phrase queries intersect candidate document sets and inspect positions in those candidates; their cost depends on phrase length and term frequencies. The index consumes additional memory and makes writes more involved. It is a workload tradeoff, not a universal improvement for every collection size.

## Real-world usage

The same division between source documents and derived indexes appears in help-center search, code search, and local note tools. Positional indexes support consecutive-token matching, while different applications may need language-aware tokenization, stemming, richer ranking, or access filters. This exercise implements a deterministic token model and occurrence counts; it does not model relevance scores, distributed index updates, or search across multiple languages.

## Practice

Use only in-memory state. Document identifiers are nonempty strings; text and query arguments are arbitrary strings. Limits are integers excluding booleans. Tokenization is exactly `re.findall(r"[a-z0-9]+", text.lower())`, using Python's standard `re` module. Empty or punctuation-only documents are valid.

**Prototype:** implement `tokenize(text) -> list[str]` using that rule. Preserve order and duplicate tokens, and return a new list on every call.

**Final:** implement `SearchEngine()`:

- `add(doc_id, text) -> bool`: return `False` without mutation if that identifier already exists; otherwise store it and return `True`.
- `get(doc_id) -> str | None`: return the exact original text, or `None` if missing.
- `update(doc_id, text) -> bool`: replace an existing document and all of its indexed content; return `False` without mutation if missing.
- `delete(doc_id) -> bool`: remove the document and its indexed content; return `False` if missing. A deleted identifier may be added again.
- `search(term, limit=10) -> list[tuple[str, int]]`: tokenize the query and require exactly one token, otherwise raise `ValueError`. Return each matching document once, scored by that token's occurrence count.
- `search_phrase(phrase, limit=10) -> list[tuple[str, int]]`: tokenize the query and match consecutive tokens. Score by number of starting positions, including overlaps. An empty token sequence returns `[]`. A one-token phrase behaves like term search.
- Both search methods rank by score descending, then document identifier lexicographically ascending, and return at most `limit` results. Zero yields `[]`; negative limits raise `ValueError`. Term-query validation still applies with limit zero. Lists are fresh snapshots.
- `stats() -> tuple[int, int]`: return `(document_count, total_token_count)` across current documents, including empty documents in the document count. Updates and deletions must keep these values correct.

No stale matches may survive updates, deletion, or identifier reuse. Raised errors preserve state, and separate instances are independent. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit `exercise.py`; leave `main.py` unchanged.
