# File Storage System

## The problem

A file storage catalog maps names to metadata and enforces a total size limit. It must answer direct lookups, list matching prefixes, copy entries, and remove entries when their lifetime ends. This exercise stores byte counts rather than file contents. That keeps the design focused on metadata consistency: a file either exists with its full size charged to the quota, or it does not exist and consumes no quota.

Treat names as flat keys. A name such as `reports/march.csv` contains a slash, but this catalog has no directories, parent permissions, or filesystem normalization. Prefix matching is a string operation. Expiration is also explicit: a file is live before its expiration boundary and absent at or after it. A logical clock makes expiration reproducible.

## Naive approach

Store a list of dictionaries containing a name and size. Search that list for each lookup or upload, and compute used space by summing every entry before each write. Prefix search can filter the same list and sort matches by size. For a small catalog, this search remains easy to inspect and test.

Restarting a copied TTL changes the retention contract:

```python
created, lifetime = 0, 5
source_expiry = created + lifetime
copy_time = 3
wrong_copy_expiry = copy_time + lifetime
print(source_expiry, wrong_copy_expiry)
assert wrong_copy_expiry > source_expiry
```

The copy survives until 8 even though its source expires at 5. Store an absolute boundary when copies must retain the original lifetime.

Add expiration by recording a creation time and duration. A shortcut checks expiration only in `get`. Another is to let `copy` create a completely new duration from the original duration. Both choices look reasonable locally but make other operations disagree about the same file.

## Where the naive approach breaks

If expired entries disappear from reads but still count toward quota, an apparently empty catalog can reject uploads. If prefix search forgets the expiration check, it returns objects that direct lookup says are missing. Copying a nearly expired file with a restarted lifetime also extends retention unintentionally.

State can become inconsistent when an upload inserts its entry before verifying available space, or when a copy charges quota and then discovers a duplicate destination. Rolling back half a mutation is more complicated than validating the entire request first. Clock movement needs its own contract: allowing arbitrary backward jumps after removing expired entries cannot reconstruct the discarded state.

## A better design

Use a dictionary keyed by file name, an absolute expiration value per entry, and a maintained used-byte counter. Let `advance_to` own time changes and remove every newly expired entry while decrementing that counter. Other operations see one coherent catalog at the current time. A full expiration scan is deliberate here; a min-heap can reduce repeated scans, but deletion and replacement then require handling stale heap entries.

A copy can be planned from one coherent catalog view:

```python
source = {"size": 4, "expires_at": 5}
used, quota, now = 4, 10, 3
assert now < source["expires_at"]
projected_usage = used + source["size"]
assert projected_usage <= quota
copied = source.copy()
print(projected_usage, copied["expires_at"])
assert copied["expires_at"] == 5
```

Both entries consume eight bytes until the same boundary. Destination uniqueness, clock advancement, and quota commitment belong to the catalog operation; calculating projected usage alone is not a concurrent reservation.

Dictionary lookup, upload, delete, and metadata copy take expected O(1) time. Advancing time scans N files, so it takes O(N). Searching scans N names and sorts M matches in O(N + M log M), ignoring string-comparison lengths. Taking only the first ten results does not remove the scan cost. Prefix indexes help when queries dominate, but add memory and write maintenance. The exercise favors a small auditable implementation over an unnecessary index.

## Real-world usage

Quota accounting and expiration rules appear in upload services, temporary export catalogs, and cached artifact stores. Consistent visibility across lookup, search, and accounting is more important than the choice of container alone. This catalog performs sequential metadata operations in memory. Persistent file bytes, concurrent reservations, background cleanup, access control, and historical restoration are separate concerns. Expiration here is exact at the logical boundary; it is an exercise contract, rather than a claim about a particular storage provider's cleanup schedule.

## Practice

Inputs have the documented types: names/prefixes are strings; sizes, quota, timestamps, limits, and supplied TTLs are integers. Sizes are bytes; no unit parsing is required. Instances are independent. Every returned dictionary and list must be fresh. There is no overwrite, filesystem access, or historical rollback.

**Prototype:** implement `FileCatalog()` with `upload(name, size) -> bool` and `get(name) -> int | None`. An empty upload name or negative size raises `ValueError`. Duplicate names return `False` and retain their size. Otherwise upload returns `True`. Zero-byte files are valid. Missing get returns `None`. The prototype has no quota or expiration.

**Final:** implement `FileStorage(quota)`:

- Negative quota raises `ValueError`; zero is valid. Start at logical time 0 with usage 0.
- `advance_to(timestamp) -> None`: require timestamp >= current time (and thus nonnegative), otherwise raise `ValueError` without changing state or time. Equal timestamps are allowed. Set time and remove every entry with `expires_at <= timestamp`, releasing its size exactly once. No other method advances time.
- `upload(name, size, ttl=None) -> bool`: empty name, negative size, or a supplied TTL below 1 raises `ValueError` before other checks. Omitted TTL means no expiration. Return `False` for an existing name or insufficient quota, unchanged. On success store expiry `current_time + ttl` or `None`, charge size, and return `True`.
- `get(name) -> dict | None`: return exactly `{"name": name, "size": bytes, "expires_at": integer_or_None}` for an existing entry, otherwise `None`.
- `copy(source, destination) -> bool`: empty destination raises `ValueError` before other checks. Missing source, existing destination (including source == destination), or insufficient quota returns `False` unchanged. Success creates distinct metadata with the same size and absolute expiry as the source, charges the full size again, and returns `True`.
- `delete(name) -> bool`: return `True` and release the size if present; return `False` if absent. Repeated deletion must not release space twice.
- `usage() -> int`: return the total sizes of all current entries.
- `search(prefix, limit=10) -> list[dict]`: match case-sensitive `name.startswith(prefix)`. Empty prefix matches all. Sort by size descending then name ascending, return at most `limit` snapshots. Negative limit raises `ValueError` without mutation; zero returns `[]`.

Rejected calls leave all entries and quota accounting unchanged. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit only `exercise.py`.
