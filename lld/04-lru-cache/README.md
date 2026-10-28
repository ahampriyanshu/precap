# LRU Cache

## The problem

A cache stores a bounded number of key-value pairs so repeated lookups can avoid repeating expensive work. Once it reaches capacity, adding another key requires an eviction policy. Least recently used, or LRU, evicts the entry whose most recent successful access happened furthest in the past.

The design challenge is keeping values and recency consistent. A successful read changes state even though it returns an existing value. Updating a stored value also counts as use. A miss must not create an entry or disturb the relative order of existing entries.

## Naive approach

Begin with a list of keys ordered from oldest to newest. To touch a key, remove its old occurrence if present and append it. That pure operation makes the policy easy to see. A dictionary can hold values alongside the list, giving quick value lookup.

Duplicate recency entries can evict a key that was just refreshed:

```python
values = {"A": 1, "B": 2}
order = ["A", "B"]
order.append("A")  # Incorrect touch: old A remains.
victim = order.pop(0)
values.pop(victim)
print(victim, sorted(values))
assert "A" not in values
```

The first A is obsolete, yet deleting by its key removes the current value. Membership and recency must have a one-to-one relationship.

This works for a small cache, but the two collections describe the same membership. Every insertion, update, deletion, and eviction must change them consistently. Linear removal also means a successful lookup can take O(n) time for n stored entries, despite the dictionary lookup itself being fast.

## Where the naive approach breaks

Appending an existing key without removing its old position creates duplicate recency records. Later eviction may remove the new value through an obsolete record. Updating a value without refreshing its position makes a recently used entry appear old. Treating a miss as a touch can evict useful data for a key that has no value.

Zero capacity is a useful boundary: every write must leave the cache empty, and no eviction from an empty collection should be attempted. Returned item lists also need a clear ownership rule. A caller clearing a snapshot must not erase the cache or change recency.

## A better design

Give one `LRUCache` object ownership of membership, values, and recency. Its public operations are get, put, delete, and an ordered snapshot. Define a single invariant: every stored key occurs exactly once in the recency order, and the number of stored keys never exceeds capacity. Validate a write before changing either membership or order.

An ordered container provides the two primitives the policy needs:

```python
from collections import OrderedDict

items = OrderedDict([("A", 1), ("B", 2)])
items.move_to_end("A")  # A successful read refreshes recency.
items["C"] = 3
victim = items.popitem(last=False)
print(victim, list(items))
assert victim == ("B", 2)
```

The result is A,C, with B evicted. This fragment demonstrates refresh and oldest removal; the cache API still owns capacity validation, zero-capacity writes, misses, and snapshot copying.

A dictionary plus a doubly linked list gives expected O(1) lookup, removal, refresh, and eviction when each dictionary entry points to its list node. Python's `OrderedDict` offers the same operations through an existing abstraction. Composition is useful here: the cache owns the policy while the ordered container owns its linking details. A regular ordered dictionary alone does not refresh insertion order when a value changes unless the implementation explicitly moves it.

Snapshots cost O(n); storing the cache costs O(n). The list-based prototype is still reasonable for tiny capacities because it has fewer moving parts. Choosing the container should follow expected scale and maintenance costs, while keeping the public behavior identical.

## Real-world usage

LRU can retain parsed documents, computation results, or recently accessed records. It works best when recent use predicts near-future use; a sequential scan can push out frequently reused entries. Capacity measured in entry count does not bound memory when values have different sizes. This exercise uses integer values and serialized calls, with no expiration, loading callback, persistence, or coordination of concurrent misses.

## Practice

**Prototype:** implement `touch_order(keys, key)`. Assume `keys` contains distinct nonempty strings and `key` is a nonempty string. Return a fresh list in oldest-to-newest order, moving an existing key to the end or appending a missing key. Do not mutate `keys`. There is no capacity limit at this stage.

**Final:** implement `LRUCache(capacity)`. Capacity must be a nonnegative integer, excluding booleans; invalid capacity raises `ValueError`. Keys must be nonempty strings. Stored values must be integers, excluding booleans; negative values are valid. Invalid keys or stored values raise `ValueError` before any state or order change.

`put(key, value)` returns `None`, inserts or updates the value, and makes the key most recent. Evict the least recent key only if needed. At zero capacity, valid puts are no-ops. `get(key, default=None)` returns the value and refreshes recency on a hit; a miss returns the supplied default without changing state. Defaults may be any object. `delete(key)` returns `True` if removed and `False` if absent; it does not refresh other keys. `items()` returns a fresh list of `(key, value)` tuples ordered least recent first. Instances own independent state. Repeated updates occupy one entry.

Run `python main.py --stage prototype`, then `python main.py --stage final`. Default stage is `final`. Edit `exercise.py`; leave `main.py` unchanged.
