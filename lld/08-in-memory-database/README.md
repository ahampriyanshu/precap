# In-Memory Database

## The problem

An in-memory database groups fields under record keys. A field has a string value, may expire, and may change over time. The database must answer both a current read and a historical question: what value was visible at a particular logical timestamp? These responsibilities are related, but deleting expired data from a current map cannot by itself support historical reads.

Time comes from the caller as nondecreasing integers. It does not come from a clock, timer, or background thread. A value written at time 10 with a lifetime of 5 is visible at 10 through 14 and absent at 15. Defining that boundary explicitly prevents different methods from disagreeing about existence.

## Naive approach

Start with a nested dictionary: record key maps to field name maps to value. Add an expiration timestamp beside each value. On every read, check whether the value has expired. This is a useful current-state design, but overwriting or deleting an entry destroys the earlier value.

Searching backwards for any unexpired value resurrects an overwritten version:

```python
history = [(2, "new", None), (5, "ready", 8)]
query_time = 8
wrong = next(value for written, value, expires in reversed(history)
             if written <= query_time
             and (expires is None or query_time < expires))
print(wrong)
assert wrong == "new"  # The correct answer is absence.
```

Expiration ends the latest version’s visibility; it does not undo the replacement and restore an earlier value.

To preserve history, one simple extension copies the entire database after every successful mutation. Historical reads choose the latest snapshot at or before the requested time. The approach is understandable and may be acceptable for very small datasets, but every change duplicates unrelated records. Expiration still needs evaluation at the historical time rather than at the time of the query.

## Where the naive approach breaks

Write `status="new"` at time 2 without expiration. At time 5 overwrite it with `"ready"` and lifetime 3. A historical read at 7 returns `"ready"`; a read at 8 returns absence. It must not fall back to `"new"` simply because the latest version has expired. The later write replaced that older version's visibility.

Deleting `"done"` at 10 must preserve its visibility at 9. Removing complete history loses that distinction. Failed conditional updates append nothing: comparing against an expired or different value is not a write.

## A better design

Keep a timeline per `(record, field)`. Each successful write appends its logical timestamp, value, and optional expiration boundary. A successful deletion appends a tombstone, an explicit marker for absence. Find the latest entry at or before the requested time, then evaluate only that entry. A tombstone or expired entry means absence; never search backwards for a replacement value.

Choose a version first, then evaluate that version alone:

```python
from bisect import bisect_right

versions = [(2, "new", None), (5, "ready", 8), (5, "final", 9)]
query_time = 8
i = bisect_right([entry[0] for entry in versions], query_time) - 1
written, value, expires = versions[i]
visible = value if expires is None or query_time < expires else None
print(visible)
assert visible == "final"
```

The right insertion boundary chooses the last equal-timestamp write. This fragment assumes a nonempty eligible history and omits tombstone handling. Building its timestamp list costs O(H); store a parallel ordered timestamp sequence to obtain O(log H) lookup without that scan.

Nondecreasing call timestamps keep timelines ordered. Equal timestamps are allowed, so lookup must choose the last appended entry at that timestamp. A binary search using the right insertion boundary handles this rule. Conditional updates compare against the visible value at the operation's timestamp and append only on a match. Validate timestamps and lifetimes before advancing the accepted time or changing history.

For `H` versions of one field, historical lookup can take `O(log H)` time. Appending is amortized `O(1)`, and retained history uses space proportional to successful mutations. A record scan examines its `F` known fields, performs their lookups, and sorts matching names; it is not a constant time operation. History grows until a retention policy removes it, and cleanup cannot discard versions still required by promised historical reads.

## Real-world usage

This design is useful for test fixtures, expiring settings, and audit-oriented state exploration. Version timelines and deletion markers are common storage ideas, but this exercise does not implement a disk engine, indexes for arbitrary queries, or concurrent transaction isolation. Logical time makes the rules deterministic; it does not supply synchronization between independent writers.

## Practice

All keys, fields, and values are strings; empty strings are valid and `None` denotes absence. No disk, network, wall time, or threading is needed.

**Prototype:** implement `RecordStore()` with `set(key, field, value) -> None`, `get(key, field) -> str | None`, and `scan(key, prefix="") -> list[tuple[str, str]]`. Setting replaces an existing field. Scan includes fields starting with the case-sensitive prefix and sorts by field name. Missing records produce `None` or `[]`. Returned lists are fresh snapshots; records and instances are independent.

**Final:** implement `TemporalDatabase()`:

- Every public method takes a nonnegative integer `ts`. Valid calls, including reads and unsuccessful conditional/deletion calls, advance the accepted time. Equal timestamps are allowed; a later call at the same timestamp wins. A smaller timestamp raises `ValueError` without changing history or accepted time. Booleans and noninteger arguments are outside this exercise's input domain.
- `set(ts, key, field, value, ttl=None) -> None` writes a version. `ttl=None` means no expiration; otherwise `ttl` is a positive integer. A write at `ts` is visible on `[ts, ts + ttl)`. Replacing a field replaces its lifetime too. A nonpositive TTL raises `ValueError` before any time or state change.
- `get(ts, key, field) -> str | None` reads at `ts`.
- `delete(ts, key, field) -> bool` appends a deletion marker only when the field is currently visible. Missing or expired fields return `False`.
- `compare_and_set(ts, key, field, expected, value, ttl=None) -> bool` writes the new value and lifetime only if the current visible value equals the string `expected`. Missing/expired fields return `False`. TTL validation occurs even if comparison would fail.
- `scan(ts, key, prefix="")` returns a fresh list of visible `(field, value)` tuples, filtered by case-sensitive prefix and sorted by field name.
- `get_at(ts, key, field, at) -> str | None` reads history at integer `at`, where `0 <= at <= ts`. Invalid `at` raises `ValueError` without advancing accepted time. Reads before creation, at/after expiration, or after a deletion return `None`. An expired newer version never reveals an older version. History reflects operations already processed; later same-timestamp writes become visible to later calls.

Rejected operations preserve history. All validation errors preserve accepted time as well. Separate instances share nothing. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit `exercise.py`; leave `main.py` unchanged.
