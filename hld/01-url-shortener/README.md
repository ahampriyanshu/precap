# URL Shortener

## The problem

Design a service that creates a short alias for a destination URL and redirects requests for that alias. An alias must identify one destination, even when requests reach different API workers. Assume destinations are immutable after creation; editing, expiry, and takedown would require additional cache rules.

For this worked design, expect one million new links and 100 million redirects daily. Average redirect traffic is about 1,160 requests per second; planning for a tenfold peak gives roughly 12,000. At an estimated 500 bytes per mapping, a year of new mappings needs about 183 GB before indexes and replication. Redirect throughput and write correctness are different sizing problems. The API should keep redirects fast without sacrificing uniqueness during link creation.

## Naive approach

One worker can generate an alias, check a dictionary, insert `alias -> destination`, and redirect lookups. `POST /links` creates links; `GET /{alias}` returns a temporary redirect or a missing-link response. The race survives moving separate checks into a shared store:

```pseudocode
worker A: lookup("guide") -> absent
worker B: lookup("guide") -> absent
worker A: choose destination A
worker B: choose destination B
worker A: insert("guide", destination A)
worker B: insert("guide", destination B)
```

Both workers observed absence, but neither observation reserved the name. Without enforced uniqueness, both may claim success; with a unique constraint, one insert must conflict. The API must handle that result rather than treating the earlier check as permission.

## Where the naive approach breaks

Worker A sees `guide` as free and creates it for one destination. Worker B, using another dictionary, also sees it as free and accepts a different destination. Users receive different redirects depending on routing. Moving both dictionaries into a shared database does not fix a separate read-then-write sequence: both workers can read absence before either writes.

Retries create another failure trace. A worker commits a mapping, then loses its response. The client retries and needs a successful answer for the same alias and destination, rather than a second mapping or an unexplained conflict. Caching missing aliases creates a separate visibility problem: a worker may continue reporting a miss after another worker successfully creates the link.

## A better design

Use stateless workers, a shared authoritative mapping store, and positive read caches. The store owns alias uniqueness; a cache holds a temporary copy.

```text
Client -> Load balancer -> API worker -> Positive cache
                              | miss / claim
                              v
                      Authoritative mapping store
```

A PostgreSQL variant makes the claim a storage operation, rather than an application convention:

```sql
CREATE TABLE links (
    alias text PRIMARY KEY,
    destination text NOT NULL
);
INSERT INTO links (alias, destination)
VALUES ($1, $2)
ON CONFLICT (alias) DO NOTHING
RETURNING alias, destination;
```

The driver binds the alias and validated destination. A returned row means this statement inserted the mapping; no row means it did not. After a conflict, read the authoritative row in a subsequent statement and compare destination and owner: an authorized identical retry returns the existing result, while conflicting reuse fails. This minimal schema omits owner and audit columns.

Generated-alias conflicts trigger another candidate; custom aliases return a clear conflict. Candidate randomness reduces collision frequency but does not enforce uniqueness. A lost response remains ambiguous until the retry finds the immutable committed mapping.

On redirects, check an unexpired positive entry, read the store on a miss, then cache a found destination for a bounded TTL. Do not cache misses initially: a newly claimed alias becomes visible on the next authoritative lookup. Store timeouts produce a service error, because they do not establish absence. An expired cache entry cannot decide current existence. Claim-sensitive reads need an authority with sufficient visibility; a lagging replica can briefly hide a successful creation.

A hot alias concentrates traffic on one key despite ordinary sharding. Edge caching and request coalescing reduce that load. Larger caches trade memory for fewer store reads; stronger replication acknowledgement policies trade write latency and availability for acknowledged-write safety. Record redirect latency, cache hits, conflicts, store timeouts, and traffic concentration.

## Real-world usage

This pattern fits invitation codes, share links, and named public resources: caches accelerate reads while one authority decides ownership. Measure redirect latency, cache hit rate, store timeouts, claim conflicts, and traffic concentration by alias. Rate-limit creation and scan destinations for abuse without fetching arbitrary URLs from an unrestricted internal network. Administrative takedown needs an explicit invalidation mechanism before the immutability assumption can be relaxed.

## Practice

### Design brief

Design a URL shortener for one million new links and 100 million redirects daily, with redirect peaks near 12,000 requests per second. Destinations are immutable after creation. Support generated and custom aliases, and define what clients observe when creation is retried. State your redirect latency and availability goals, retention assumption, and estimated storage growth.

### Draw and explain

Use Excalidraw to draw creation and redirect paths. Label service boundaries, the owner of alias uniqueness, durable mapping data, and any cached copies. Mark acknowledgement points and distinguish a missing alias from an unavailable dependency. Sketch the request and response contracts, then trace a popular alias from a cold lookup to repeated reads. Show how traffic and ownership distribute as workers are added.

### Stress the design

Two workers claim the same custom alias concurrently. One commits, but its response is lost. Explain the retry outcome without relying on a cache to establish ownership. Next, let a hot alias dominate redirects while the mapping store is unavailable. Mark what can still be served and when that permission ends.

### Review your design

Check uniqueness enforcement, retry identity, cache freshness, and hot-key capacity. Compare alias generation choices and edge caching against their operational costs. Explain what would change for takedowns or editable destinations. Identify metrics that distinguish store failure, cache misses, claim conflicts, and concentrated traffic.
