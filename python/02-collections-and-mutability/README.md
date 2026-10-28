# Collections and mutability

## Choosing a collection

A collection groups values so a program can process more than one thing at a time. A `list` is an ordered, mutable sequence; it supports indexing, slicing, appending, and duplicates. A `tuple` is an ordered sequence whose elements cannot be reassigned. Tuples often represent a fixed record such as `(latitude, longitude)`. A `set` stores unique hashable values and supports membership, union, and intersection. A `dict` maps unique hashable keys to values and preserves insertion order.

These structures express different intentions. Use a list for a sequence of search results, a set for checking whether a user has a permission, and a dictionary to look up a setting by name. A dictionary lookup and set membership are usually efficient without scanning every element; list membership scans until it finds a match. Sets do not promise a useful iteration order, so sort when presentation order matters.

## Mutation and aliases

Assignment binds another name to an object; it does not copy that object. Mutating through either alias changes shared state. Rebinding an alias changes only that binding. A copy's depth determines which ownership boundaries actually change:

```python
original = [{"tags": ["blue"]}]
alias = original
shallow = original.copy()
shallow.append({"tags": []})
shallow[0]["tags"].append("green")
print(alias is original, shallow is original)
print(len(original), len(shallow))
print(original[0]["tags"])
```

The outputs are `True False`, `1 2`, and `['blue', 'green']`. The outer lists differ, but both contain the same first dictionary and therefore the same nested tag list. A shallow copy protects membership of the outer list, not the entire object graph. Copy the mutable levels the caller must own, or expose immutable records instead. A blanket deep copy may duplicate intentionally shared state and can be expensive; choose the boundary deliberately.

## Hashable keys and a small loop

Dictionary keys and set members must be hashable, with equality and hashes remaining compatible. A tuple is hashable only when all its elements are hashable. Numeric equality also crosses type boundaries: `True`, `1`, and `1.0` compare equal and identify the same ordinary dictionary entry.

```python
ordinary = {}
typed = {}
for value in [True, 1, 1.0]:
    ordinary[value] = "present"
    typed[(type(value), value)] = "present"
print(len(ordinary), len(typed))
print(ordinary[1])
```

The output is `1 3` followed by `present`. Including the type makes three distinct keys in this example; it is useful only if the domain actually distinguishes these values. Alternatively, validate input once and reject unexpected types. Hashability is a technical requirement, while the choice of equality is part of the data model.

## Reading and updating

Use `items()` to iterate over dictionary key-value pairs and `.get(key, default)` when absence is expected. If `None` is a legitimate stored value, `.get(key)` alone cannot distinguish it from a missing key; use membership or a distinct sentinel. Indexing a missing key raises `KeyError`.

`.append()` and `.sort()` mutate a list and return `None`; `sorted(values)` returns a new list. Iteration over dictionary views reflects the underlying dictionary, so materialize a snapshot when the API needs one. A snapshot still contains references to the original values. Comprehensions make a new outer container without promising independent nested objects.

## Common mistakes and tradeoffs

`[[]] * 3` repeats a reference to one inner list; a comprehension creates three separate lists. A tuple can contain a mutable list, so its fixed element references do not make all nested data immutable. Empty braces `{}` create a dictionary; use `set()` for an empty set. Dictionary keys and set members must be hashable, which excludes ordinary lists. Do not mutate a dictionary's size while iterating over it. Decide whether an API mutates its input or returns a new collection, and state that decision clearly.

## Using the supplied function shells

Keep each supplied function signature and return the result specified in Practice. Decide which local containers you own before mutating them. The exercise tests can pass the same input to several calls, so an undocumented input mutation may break later behavior even if the first returned value looks right.

## Practice

Practice preserving order while grouping text. Input values are strings; matching is case-sensitive.

**Prototype:** `unique_words(words)` returns a new list containing each word once, in first-appearance order. `["a", "b", "a"] -> ["a", "b"]`. Do not change the input.

**Final:** `group_words(words)` returns a dictionary mapping each word's first character to a list of all words starting with that character, in input order. Ignore empty strings, retain duplicates, and do not strip whitespace. `["ant", "", "bee", "apple", "ant"] -> {"a": ["ant", "apple", "ant"], "b": ["bee"]}`. Each call returns fresh lists. Empty input returns `{}`. Do not mutate the input. Expected work is linear in the number of words, apart from the cost of storing their references.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
