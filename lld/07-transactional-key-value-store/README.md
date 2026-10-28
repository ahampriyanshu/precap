# Transactional Key-Value Store

## The problem

A transactional key-value store lets a caller make a group of tentative edits and either retain or discard them. Its basic state is a mapping from string keys to string values. The interesting responsibility is defining which view a read observes and which edits a rollback removes. A missing key must remain distinguishable from a key holding the empty string.

Nested transactions add another boundary. An inner commit should merge into its immediate parent, not bypass it and write to the base store. If that parent later rolls back, the inner transaction's committed changes must disappear with it. Transaction depth therefore belongs to the store's explicit state.

## Naive approach

A dictionary supports expected constant time `set`, `get`, and `delete`. To add rollback, save the dictionary when `begin()` is called and restore it later. A first attempt might assign `saved = current`, expecting this to preserve the earlier view. Both names actually reference the same mutable dictionary, so subsequent writes change the supposed checkpoint too.

Assignment does not create a checkpoint:

```python
current = {"mode": "base"}
saved = current
current["mode"] = "tentative"
current = saved  # An attempted rollback.
print(current["mode"])
assert current["mode"] == "tentative"
```

Both names referred to the same dictionary. A shallow copy is enough only because this store’s string values cannot be mutated through shared references.

One global backup also cannot represent nesting. Starting a second transaction overwrites the first backup. An inner commit may appear to work, but the outer rollback no longer knows which state to restore. These are state representation errors, not problems that a more elaborate dispatcher can solve.

## Where the naive approach breaks

Start with `mode="base"`. Begin an outer transaction, set `mode="outer"`, begin an inner transaction, and set `mode="inner"`. Committing the inner transaction leaves the visible value `"inner"` at depth one. Rolling back the outer transaction must restore `"base"` at depth zero. A commit that writes straight to the base dictionary violates this trace.

Deletion has its own trap. If a transaction is represented as a dictionary of changed values with fallback reads from its parent, simply removing a local key does not hide a key in the parent. Such a design needs an explicit deletion marker. A copied full view avoids that complication, at the cost of copying more state.

## A better design

For a small store, use a stack of complete dictionary views. Keep one base view at depth zero. `begin()` pushes a shallow copy of the current view. This is sufficient because keys and values are strings, which are immutable. Reads and writes always use the top view; callers never receive that dictionary itself.

The stack’s nesting rule is small enough to inspect directly:

```python
views = [{"mode": "base"}]
views.append(views[-1].copy())  # Begin outer.
views[-1]["mode"] = "outer"
views.append(views[-1].copy())  # Begin inner.
views[-1]["mode"] = "inner"
child = views.pop()
views[-1] = child             # Commit into the parent only.
views.pop()                  # Roll back outer.
print(views[-1]["mode"])
assert views == [{"mode": "base"}]
```

The inner commit remains tentative relative to the base. These frame operations omit public argument checks and depth-zero errors; they illustrate nested ownership, not isolation between independent database sessions.

With `N` visible keys, beginning a transaction takes `O(N)` time and space. Point reads and writes are expected `O(1)` within a view. Replacing a frame reference is constant time conceptually, although Python may spend time releasing discarded dictionaries. `D` nested full views can retain `O(DN)` entries. Snapshot filtering scans `N` keys and sorts the matches. For larger workloads, change-only frames or undo logs reduce copying but require tombstones, careful merge rules, and more complex reads.

## Real-world usage

Nested rollback boundaries are useful in configuration editing, interactive tools, and tests that temporarily modify shared setup. They also help explain savepoint-like behavior, but this exercise is a single-session model. Copied dictionaries do not provide isolation between concurrent sessions, crash recovery, or the durability of a database transaction. Named savepoints and concurrent writers are intentionally outside its contract.

## Practice

Keys, values, and prefixes are strings; empty strings are valid. Values are never `None`. Everything stays in memory. There are no clocks, threads, persistence, or input type conversions.

**Prototype:** implement `KeyValueStore()` with independent storage. `set(key, value)` inserts or replaces and returns `None`; `get(key)` returns its string value or `None`; `delete(key)` returns `True` if it removed a key and `False` otherwise. Deleting and recreating a key is valid.

**Final:** implement `TransactionalStore()` with the same `set`, `get`, and `delete` behavior plus:

- `begin() -> int`: start a nested transaction from the current visible state and return the new depth.
- `commit() -> int`: merge only the innermost transaction into its immediate parent, close that transaction, and return the new depth. An outer rollback must still undo an inner commit.
- `rollback() -> int`: discard only the innermost transaction, close it, and return the new depth.
- `depth() -> int`: return zero for the base view, one after a single unmatched `begin()`, and so on.
- `snapshot(prefix="") -> dict[str, str]`: return a fresh dictionary of the currently visible keys starting with the case-sensitive prefix, inserted into the result in ascending key order. An empty prefix includes every key. Mutating the result must not affect any transaction or base view.

Calling `commit()` or `rollback()` at depth zero raises `RuntimeError` and preserves the visible state and depth. Reads see all edits in the innermost view, including uncommitted writes and deletions. Duplicate `set` replaces a value. Separate instances share no state. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit `exercise.py`; leave `main.py` unchanged.
