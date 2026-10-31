# Content Delivery Network

## The problem

A content delivery network serves reusable content from locations close to readers. Design one for public product images and translated help pages. Assume 20,000 requests per second at peak, a 200 KB average body, and an origin in one region. Direct origin delivery would move roughly 4 GB per second before protocol overhead. A 95% byte hit ratio reduces origin traffic to about 200 MB per second; request hit ratio alone would hide the effect of large files.

Readers want low latency and correct content. Publishers want changes to appear within a stated freshness window. Personalized account responses must remain private. This worked design accepts up to 60 seconds of ordinary staleness and an additional 30 seconds during a refresh for selected public pages. Payment state and access revocations have no such allowance.

## Naive approach

A reverse proxy can cache successful responses by URL for a minute. But one URL may vary by language, tenant host, or image parameters. Consider an origin response that forgot to declare its language variation:

```http
GET /help HTTP/1.1
Host: docs.example
Accept-Language: en

HTTP/1.1 200 OK
Cache-Control: public, max-age=60
Content-Language: en
```

A later French request has the same target URL and no declared language-dependent cache key. A shared cache can reuse the English response. Missing variation is a correctness defect even if every hit is fast; authenticated content creates a more serious privacy boundary.

## Where the naive approach breaks

Suppose an English page fills `/help`, then a French request hits the same entry. The cache serves the wrong language because its key omitted a response variant. A more serious version stores an authenticated response and later serves it to another reader. Cacheability is an explicit policy, not a conclusion drawn from a `.jpg` suffix.

Expiration also creates coordinated load. At second 60, a thousand requests can independently refresh one popular page. If the origin slows, they consume connections and amplify the outage. Separately, an invalidation can race with an older in-flight fill: deleting the cached entry is insufficient if the old response is allowed to repopulate it afterward.

## A better design

Separate routing, cache eligibility, authoritative responses, and purge control:

```text
Reader -> Edge router -> Edge cache -> Origin service -> Object store
                              ^
                         Purge controller
```

The router selects a nearby healthy edge. The edge enforces bounded storage and freshness; the origin supplies the cache policy and validators. A public translated response should declare its variation:

```http
HTTP/1.1 200 OK
Cache-Control: public, max-age=60
Vary: Accept-Language
ETag: "help-en-v8"

GET /help HTTP/1.1
Host: docs.example
Accept-Language: en
If-None-Match: "help-en-v8"
```

The second exchange is a later conditional revalidation request, with its response omitted. An unchanged representation can produce 304 and renew metadata without sending the body again. `Vary` requires matching the nominated request headers; it does not itself authorize storage or normalize equivalent languages.

An entry records body reference, validator, freshness deadline, stale deadline, and generation. Include host, relevant path/query, and agreed variants in the key. Normalize only equivalences guaranteed by the origin. This design bypasses shared caching for authenticated requests. Including unlimited tracking parameters destroys reuse; omitting meaningful size parameters serves the wrong image.

On expiry, one refresh owner performs the origin request. Others wait or receive stale content only within the selected page’s extra 30-second allowance. A failed refresh releases ownership without extending the original stale deadline. Coordination must cover every node sharing that fill boundary; process-local flags cannot coalesce a whole fleet.

Purging needs generation checks as well as deletion. If generation 8 began filling before a purge and generation 9 now owns the key, discard the late generation-8 result. Otherwise stale bytes can repopulate a purged entry. Purge distribution needs authenticated callers, retries, and acknowledgements; global invalidation remains eventual until every edge applies it. Immutable versioned asset URLs avoid much of this publication race.

## Real-world usage

Public downloads favor long freshness and high reuse. Changing pages favor shorter freshness or validators. More variants improve correctness but reduce reuse. Serving stale content improves availability while weakening freshness; origin replication costs storage and coordination.

Measure byte hit ratio, origin requests, refresh duration, stale responses, eviction rate, purge propagation delay, and latency by region. Bound object size and key cardinality; rate-limit origin fills and authenticate purge callers. A query-string flood should not turn the edge into an origin load generator.

## Practice

### Design brief

Design delivery for public product images and translated help pages at 20,000 peak requests per second with a 200 KB average body. Direct origin traffic is roughly 4 GB per second. Accept up to 60 seconds of ordinary staleness and an additional 30 seconds during refresh for selected public pages. Personalized account responses must remain private. Define latency goals and a publication-freshness contract.

### Draw and explain

In Excalidraw, show reader routing, edge boundaries, origin ownership, durable content, and the management path for publication or purge. Label the full cache identity, response variants, validators, freshness deadlines, and access checks. Trace a fresh hit, an expired popular entry, and a publisher update. Show how origin request and byte budgets change with the expected hit ratio.

### Stress the design

A thousand readers arrive as one popular entry expires while the origin slows. Explain refresh ownership, waiting or stale responses, and the hard limit on staleness. Then let a purge race with an older in-flight fill. Draw the ordering evidence that prevents old content from becoming current again.

### Review your design

Check language and query variants, authenticated traffic, and bounded cache-key cardinality. Compare versioned URLs with distributed purges for different content. Explain the cost of more variants, regional replication, and stale serving. Choose signals for byte hit ratio, origin amplification, purge propagation, and regional latency.
