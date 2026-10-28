# Tries and prefix search

A trie stores strings as paths of characters. Each edge adds one character; a path from the root spells a prefix. A terminal marker records that a complete word ends there. Shared prefixes reuse the same path, making tries useful for autocomplete, dictionaries, and exact prefix filtering.

A set answers “is this entire word present?” efficiently, but finding all words beginning with a prefix usually requires scanning the set. A trie first follows the prefix path, then explores only its descendants. It trades memory and construction work for a more focused query.

The scan baseline performs filtering before sorting and limiting:

```python
words, prefix, limit = ["cart", "car", "cat", "car"], "ca", 2
matches = set()
for word in words:
    if word.startswith(prefix):
        matches.add(word)
print(sorted(matches)[:limit])
```

It prints `['car', 'cart']`; deduplication and lexicographic order are separate from the prefix test.

## A path is not necessarily a word

Insert `'car'`, `'cart'`, and `'cat'`. They share root → `c` → `a`. The `r` node is terminal for `'car'` and also has a `t` child ending `'cart'`; the sibling `t` node ends `'cat'`.

For prefix `'ca'`, walk two edges to reach the subtree. Visit child `r` before `t`, emit `'car'` before descending to `'cart'`, then emit `'cat'`. The result is `['car', 'cart', 'cat']`. If the limit is `2`, stop after `'cart'` rather than building every possible completion.

The terminal marker is essential: without it, the path for `'car'` cannot distinguish an inserted word from a prefix that exists only because `'cart'` was inserted.

A private object can serve as a terminal key that no string character can collide with:

```python
END = object()
root = {}
for word in ["car", "cart", "cat"]:
    node = root
    for char in word:
        node = node.setdefault(char, {})
    node[END] = True
node = root
for char in "ca":
    node = node[char]
print(END in node, END in node["r"])
print(sorted(key for key in node if key is not END))
```

It prints `False True` and `['r', 't']`. The prefix `ca` is a path, while `car` is also a word; traversal must exclude the sentinel when sorting child characters. An empty word marks the root terminal. An empty prefix starts enumeration from the root. Inserting the same word twice should not create duplicate results.

The baseline scans all words with `startswith`, deduplicates matches, sorts them, then applies the limit. If `S` is total input character count, building a trie costs expected O(S) dictionary operations and up to O(S) nodes. Following a prefix of length `p` costs O(p). Enumeration additionally costs the visited subtree, sorting child keys, and constructing returned strings. It is not merely O(p) when many completions are requested. Python string concatenation can add copying costs; account for how you build output words.

This API rebuilds the index on every call, so a one-off query may be simpler and faster with the baseline. Reusing a long-lived trie amortizes construction across many queries. A sorted word list with binary-search prefix bounds is another compact choice. Tries can use substantial memory when each node owns a dictionary. They do not provide typo correction or fuzzy matching without additional search rules. Exact matching here preserves case and code-point ordering; language-aware collation would require a different policy.

## Practice

Implement `prototype(words: list[str], prefix: str, limit: int) -> list[str]` and `solve` with the same signature. Return at most `limit` unique input words beginning with `prefix`, in Python lexicographic order. Matching is exact and case-sensitive. Empty words and prefixes are valid; `limit=0` returns `[]`. A negative limit raises `ValueError`.

Example: `(['cold','colder','coal','cold'], 'co', 3)` returns `['coal','cold','colder']`.

Prototype: filter, deduplicate, and sort. Final: build a trie, follow the prefix, and enumerate in sorted character order until the limit. Include construction cost when explaining performance. Preserve the word list, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
