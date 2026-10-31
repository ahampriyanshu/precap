# Document Search Engine in C++

A term index needs frequencies; a phrase index additionally needs positions. Phrase starts must preserve consecutive token order, including repeated-token overlaps. In `a a a`, phrase `a a` starts twice, so skipping forward by phrase length after a match undercounts.

```cpp
using Posting=std::map<std::string,std::vector<std::size_t>>;
// One term maps each document ID to every token position in that document.
```

An update must remove all old postings before installing new ones; merely adding new terms leaves stale matches and wrong totals. Keep original text separately from normalized tokens so get() can return exact content. The token rule lowercases Unicode, then retains ASCII letter/digit runs. `Text` makes code points explicit; U+0130 lowers to i plus a combining separator, and Kelvin sign lowers to k. ASCII-only tolower would silently change this rule. Sort results by decreasing score and then ID, and return detached value pairs.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

Text and query parameters use `Text` (UTF-32 code points), rather than UTF-8 bytes. Token output is ASCII `std::string`; document IDs remain `std::string`. Tokenization applies Unicode lowercase then ASCII [a-z0-9] runs, including the two non-ASCII lowercase mappings that emit ASCII. No locale-dependent cctype behavior is used.

## Practice

Use only in-memory state. Document identifiers are nonempty strings; text and query arguments are arbitrary strings. Limits are integers within the declared C++ numeric type. Tokenization lowercases Unicode code points and extracts consecutive ASCII letter/digit runs, as described above. Empty or punctuation-only documents are valid.

**Prototype:** implement `tokenize()` using the lowercase/ASCII-run rule above. Preserve order and duplicate tokens, and return a new list on every call.

**Final:** implement `SearchEngine()`:

- `add()`: return `false` without mutation if that identifier already exists; otherwise store it and return `true`.
- `get()`: return the exact original text, or `nullopt` if missing.
- `update()`: replace an existing document and all of its indexed content; return `false` without mutation if missing.
- `erase()`: remove the document and its indexed content; return `false` if missing. A deleted identifier may be added again.
- `search()`: tokenize the query and require exactly one token, otherwise raise `std::invalid_argument`. Return each matching document once, scored by that token's occurrence count.
- `search_phrase()`: tokenize the query and match consecutive tokens. Score by number of starting positions, including overlaps. An empty token sequence returns `[]`. A one-token phrase behaves like term search.
- Both search methods rank by score descending, then document identifier lexicographically ascending, and return at most `limit` results. Zero yields `[]`; negative limits raise `std::invalid_argument`. Term-query validation still applies with limit zero. Lists are fresh snapshots.
- `stats()`: return `(document_count, total_token_count)` across current documents, including empty documents in the document count. Updates and deletions must keep these values correct.

No stale matches may survive updates, deletion, or identifier reuse. Raised errors preserve state, and separate instances are independent.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp

inline Strings tokenize(const Text& text);
class SearchEngine { public:
 SearchEngine();
 bool add(const std::string& id,const Text& text);
 Opt<Text> get(const std::string& id) const;
 bool update(const std::string& id,const Text& text);
 bool erase(const std::string& id);
 Vec<std::pair<std::string,Int>> search(const Text& term,Int limit=10) const;
 Vec<std::pair<std::string,Int>> search_phrase(const Text& phrase,Int limit=10) const;
 Pair stats() const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
