# Caches, freshness, and invalidation

A cache avoids repeated work by retaining a derived result closer to the reader. It can lower latency and protect a database from repeated reads. It also introduces another version of reality, with its own key space, eviction policy, failure modes, and access controls.

The central design choice is the freshness contract: what may be stale, for whom, for how long, and what must happen after a write. A cache is safe when those answers fit the product, not when the hit rate is high.

## Define the cached representation

Caching a raw product record differs from caching a permission-filtered response or a calculated price. The key must identify every input that can change the result: tenant, locale, currency, schema revision, and authorization scope where relevant.

```text
v4:tenant:7:product:42:currency:USD:locale:en

Avoid:
product:42  when IDs or representations differ between tenants
```

Hashing a key does not repair an incomplete identity. Caching an administrator's expanded representation and returning it to a regular user is a data leak even if both requests address the same product.

Cache-aside reads check the cache, load the authoritative source on a miss, then populate the cache. Write-through places the write path behind the cache layer; write-behind acknowledges before the durable source is updated and therefore carries a different loss and recovery contract. Name the pattern only after its commit and failure behavior are explicit.

## Deleting after a write leaves a race

This executable schedule demonstrates a delayed reader refilling stale data after invalidation:

```python
database = {"version": 1, "price_minor": 12900}
cache = {}

old_read = database.copy()                     # reader misses
database.update(version=2, price_minor=11900)   # writer commits
cache.pop("product:42", None)                  # writer invalidates
cache["product:42"] = old_read                 # delayed reader fills

assert database["version"] == 2
assert cache["product:42"]["version"] == 1
print("stale refill reproduced")
```

![A delayed cache miss reads version one, a writer commits version two and invalidates, then the reader refills version one; invalidation alone does not order all writers.](/diagrams/backend-cache-race.svg)

A TTL bounds reuse after that particular fill; it does not make the loaded value current. If the reader fetched from a lagging replica, the source was stale before caching. Repeated stale refreshes can extend the time a user sees outdated data.

Possible responses differ by requirement. Accept bounded staleness for a public catalog. Bypass the cache for a user's immediate read-after-write. Use version-aware conditional writes into the cache so older values cannot replace a newer known version. Use immutable versioned keys plus a reliably updated pointer. Each needs a defined failure path; “invalidate twice” with a delay is a mitigation with timing assumptions, not a general proof.

## Stampedes turn misses into an outage

When a hot key expires, thousands of callers can load it simultaneously. Per-key request coalescing lets one refresh serve nearby waiters. Jittered expirations reduce synchronized misses across unrelated keys. Stale-while-revalidate can preserve responsiveness when old data is acceptable, but needs a hard stale limit and bounded refresh ownership.

```text
soft expiry reached → serve permitted stale value; one bounded refresh starts
hard expiry reached → wait briefly for refresh or return a controlled fallback
refresh fails       → record failure; do not extend stale life indefinitely
```

Coalescing only inside one process still allows one refresh per replica. Distributed refresh coordination can reduce this further but adds its own failure handling. Do not hold a fragile distributed lock as the sole correctness mechanism for a financial operation.

Negative caching reduces repeated reads for missing objects, but requires a short, deliberate lifetime and tenant-safe key. A newly created object can remain apparently missing until that entry expires or is invalidated. Avoid caching authorization failures as universal object absence.

## Eviction, expiration, and hot keys are different

Expiration implements a time policy; eviction frees memory under pressure. An entry with a long TTL can still disappear under an eviction policy. Callers must handle a miss at any time. Decide whether errors or empty results are cacheable rather than accidentally persisting a temporary failure as the truth.

A cache can be overloaded even at a high hit rate. One hot key can concentrate traffic on one shard. Large values amplify network and serialization costs. A frequently rewritten key can generate invalidation and replication work. Local caching can help hot immutable data, but introduces another invalidation boundary.

Measure byte hit rate and avoided source work as well as request hit rate. A 95% hit rate on cheap keys can hide expensive misses that dominate database load.

## The cache-down path is a capacity decision

Suppose peak traffic is 20,000 requests/s and the database normally sees a 2% miss rate: about 400 loads/s. If the cache disappears and all calls fall through, the source suddenly receives up to 20,000 loads/s. A transparent fallback can be the event that takes down the authoritative store.

```text
cache unavailable
  → bounded source concurrency
  → serve safe local/stale results where allowed
  → degrade optional features
  → reject excess work before the database queue grows
```

Set budgets from tested source capacity. Distinguish a normal miss from cache infrastructure failure in telemetry. A process restart or deployment can also create a cold-cache wave, so recovery needs controlled warming rather than a simultaneous full refill.

For each cached object, document owner, key inputs, freshness, miss behavior, invalidation source, maximum size, and failure behavior. If those decisions are more complicated than the work being saved, keep the authoritative read until measurement justifies caching.
