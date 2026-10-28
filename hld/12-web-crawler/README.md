# Web Crawler

## The problem

A crawler discovers public pages, fetches them within a budget, and sends useful content to downstream processing. Assume a target of 10 million fetches per day with 100 KB average responses. That is about 116 requests per second on average and 1 TB of response data per day. A fivefold peak is manageable globally, but sending those requests to one small host would be abusive. Capacity must be allocated per origin as well as across the fleet.

Requirements include URL deduplication, robots-policy checks, fair scheduling across hosts, bounded retries, and recovery after worker failure. Freshness matters: important changing pages should be revisited sooner than old archives. Fetching every discoverable link is not a meaningful goal because calendars, filters, and generated parameters can create effectively unlimited URLs.

## Naive approach

A single FIFO frontier with a visited set is adequate for a controlled site. Across many origins, global throughput does not enforce per-host politeness:

```pseudocode
url = global_frontier.pop()
response = fetch(url)
if response.status == 429:
    global_frontier.push(url)  # Immediately eligible again.
links = extract_links(response)
global_frontier.extend(links)
```

A failing host with many discovered links keeps winning dispatch slots. More workers amplify its overload. Deduplicating only after fetching also allows concurrent duplicate requests, while a visited bit cannot distinguish retry state from completed work.

## Where the naive approach breaks

Consider a host that returns `429` while another host is healthy. A shared queue repeatedly dispatches the failing host because its backlog is largest. Immediate retries amplify the overload. A single global rate limit cannot protect that host while allowing healthy ones to proceed.

URL identity is also harder than string equality. Fragments do not change the fetched document; query parameters sometimes do. Removing all parameters can merge different pages, while retaining every tracking parameter can explode the frontier. A worker that crashes after fetching but before acknowledgement creates a duplicate attempt. A stale worker must not delete a newer attempt's queue state. Robots policies can change while URLs are waiting, so enqueue-time checks alone are insufficient.

## A better design

Separate discovering a URL from permission to fetch it. Maintain per-origin queues and choose eligible origins fairly.

```text
Seeds / extracted links -> URL normalizer -> Frontier scheduler
Frontier scheduler -> Fetch workers -> Content store / parser
Robots policy cache -> Frontier scheduler
```

Normalization applies a documented scheme/query/fragment policy. An exact store owns `(crawl_generation, canonical_url)` admission. A probabilistic filter can reduce lookups, but false positives cannot silently discard coverage when completeness matters. Store large response bytes separately from frontier metadata.

Dispatch needs one origin budget owner, not independent worker counters. The following pseudocode identifies that coordination boundary:

```pseudocode
transaction(frontier_partition):
    origin = choose_fair_eligible_origin(now)
    candidate_url = peek_ready_url(origin)
    require current_robots_policy_allows(origin, candidate_url)
    require origin.in_flight < origin.connection_limit
    require now >= origin.next_allowed_at
    attempt = lease_url(candidate_url, fresh_token(), deadline)
    origin.in_flight += 1
    origin.next_allowed_at = next_polite_dispatch_time(origin, now)
return attempt
```

The transaction/conditional-store implementation, robots loading, and network fetch are omitted. Both dispatch spacing and in-flight count are required: a slow response must still consume a connection slot. Rebalancing origin ownership needs a handover or fence so two schedulers cannot independently spend the same budget.

Workers enforce connect/read deadlines and maximum bytes, then report completion with the current attempt token. A stale completion cannot release a replacement’s lease. Lease expiry recovers crashes but may overlap a worker still fetching, so tolerate occasional repeated GETs. Retry temporary errors after delayed eligibility, honor relevant `Retry-After` guidance, and exhaust a bounded retry budget. High priority affects selection within an origin, not permission to overwhelm it.

Recheck robots at dispatch because policies can change in the queue. [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html) describes policy handling and explicitly separates robots rules from access authorization.

Fetchers also cross a security boundary. Restrict protocols, reject private/link-local destinations, recheck DNS and redirects, and avoid forwarding credentials. Observe per-host errors, oldest backlog, robots failures, duplicate admission, response bytes, and retry volume. Global concurrency trades coverage speed against bandwidth and recovery cost; origin budgets protect individual sites.

## Real-world usage

Search indexing, public-data collection, and link checking use frontiers with different freshness and coverage goals. [Google's crawl-budget guide](https://developers.google.com/crawling/docs/crawl-budget) distinguishes what a crawler wants to fetch from what a host can sustain. This supports reasoning about demand and capacity separately; the hypothetical scheduler here is not a reconstruction of Googlebot.

## Practice

### Design brief

Design a crawler targeting ten million public-page fetches daily with 100 KB average responses: about 116 requests per second and 1 TB per day, with a fivefold peak. Require URL deduplication, robots-policy checks, fair host scheduling, bounded retries, and recovery after worker failure. Define coverage and revisit priorities rather than treating every discovered URL as equally valuable. State per-origin politeness and response-size budgets.

### Draw and explain

In Excalidraw, label discovery, URL identity, frontier ownership, robots state, fetch workers, content storage, and the external-network boundary. Trace discovery through admission, dispatch, completion, and link extraction. Show host eligibility, retry state, lease ownership, and stored-content metadata. Explain how the scheduler shares fleet capacity without allowing one host's backlog to consume its entire allowance.

### Stress the design

One host returns `429` while another remains healthy. Trace retry timing and fair progress for both. Separately, a worker pauses after fetching, its lease expires, and a replacement starts. Draw how a late completion interacts with current frontier ownership, including any unavoidable repeated network request.

### Review your design

Compare exact deduplication with probabilistic filtering when missed pages matter. Explain URL normalization risks, freshness versus coverage, and ownership handover during rebalancing. Check changing robots policy, redirect resolution, private-address protection, and retry exhaustion. Choose signals for per-host pressure, frontier age, duplicate fetches, and useful content yield.
