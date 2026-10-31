# News Feed

## The problem

A news feed shows recent posts from accounts a reader follows. Design a chronological feed first; ranking is a later policy. Posts need durable source storage, new posts should become visible quickly, and pages should avoid duplicates or skips caused merely by inserting newer posts. Follow relationships and post visibility are authorization rules, not just relevance hints.

Assume one million posts per day. An ordinary author has 200 followers, so pushing every post creates about 200 million inbox references per day. At 32 bytes per reference, that is 6.4 GB of logical references before replication and index overhead. One author with ten million followers would create ten million writes for a single post. The follower distribution changes the design more than the average post rate does.

## Naive approach

Fanout on read queries followed-author timelines and merges them at request time. Fanout on write materializes inbox references, making reads cheaper but amplifying popular-author writes. Offset pagination is unstable when new candidates arrive:

```sql
SELECT post_id FROM inbox
WHERE viewer_id = $1
ORDER BY created_at DESC, post_id DESC LIMIT 10 OFFSET 0;
-- New posts enter ahead of this reader's previous page.
SELECT post_id FROM inbox
WHERE viewer_id = $1
ORDER BY created_at DESC, post_id DESC LIMIT 10 OFFSET 10;
```

The second query counts positions in a changed list, so it can repeat prior items. A timestamp-only cursor also cannot order equal-time posts; a unique tie-breaker solves ordering but not late-arrival membership.

## Where the naive approach breaks

Pure push copies work for followers who may never open the feed. A popular author can monopolize the fanout queue, delaying ordinary posts. Retried delivery can duplicate references unless insertion has an identity constraint.

Even strict keyset pagination cannot freeze membership: a delayed fanout event with an old timestamp may appear between page requests. Stable ordering and a stable candidate view are separate promises.

## A better design

Use materialized inboxes for ordinary authors and read-time merging for very high-follower authors:

```text
Publisher -> Post store -> Fanout worker -> Inbox store
                  |                            |
                  +--------> Feed API <---------+ -> Reader
```

The post store owns source posts and author timelines. The follow store supplies authorized relationships. Fanout workers insert references with `(viewer_id, post_id)` uniqueness. The feed API merges inbox and followed high-follower candidates, deduplicates IDs, checks visibility, and orders by trusted `(created_at, post_id)`. Source outbox events make fanout recoverable; they do not eliminate duplicate delivery.

For a stable view, freeze the first request’s candidate membership. Subsequent pages can use a viewer-bound view ID and a strict continuation key:

```sql
SELECT post_id, created_at
FROM feed_view_items
WHERE view_id = $1 AND viewer_id = $2
  AND (created_at, post_id) < ($3, $4)
ORDER BY created_at DESC, post_id DESC
LIMIT $5;
```

This PostgreSQL query assumes an already retained immutable candidate set, nonnull sort fields, and unique post IDs within the view. The parameters identify the view, reader, previous final row, and bounded page size. It implements continuation within that set; it does not create the snapshot. Creation, expiry, cursor authentication, hydration, and current visibility checks are omitted.

A `GET /feed?cursor=opaque&limit=n` token binds those values to the reader and an expiry. New publications and delayed fanout appear on refresh. Retaining views costs memory/storage, so a service may choose bounded expiring result sets, database snapshots, or explicitly weaker pagination.

If fanout crashes halfway through a follower list, replay inserts only missing references. Sorting by source metadata restores order even when delivery is delayed. Ordinary posts may remain absent until fanout catches up. Switching an author between push and pull also requires a migration policy so neither path loses posts.

If high-follower reads fail, an inbox-only degraded feed still needs source hydration and authorization. References alone cannot render content. Recheck deletion, blocks, and access at hydration time: frozen membership must not freeze revoked permission. Measure fanout lag, write amplification, merge fan-in, source failures, feed latency, and view memory/expiry.

## Real-world usage

Activity feeds and followed-author timelines can justify substantial inbox storage when reads dominate. Inactive audiences waste push work. Tune push/pull policy from active-follower and reading distributions, rather than one global follower threshold alone.

## Practice

### Design brief

Design a chronological followed-author feed for one million posts per day. Ordinary authors average 200 followers; one author may have ten million. At 32 bytes per inbox reference, ordinary push fanout alone produces about 6.4 GB of logical references daily. Require durable source posts, quick visibility, and pages without duplicates or skips caused solely by new insertions. State a freshness and pagination contract.

### Draw and explain

In Excalidraw, label source-post ownership, follow relationships, materialized references, media, visibility checks, and feed assembly. Trace publication, an ordinary reader request, and continuation to a second page. Show ordering keys and cursor scope. Explain where work grows with follower count and where it grows with followed-author count. Identify the information needed to choose or change a fanout policy.

### Stress the design

A fanout worker delivers half a post's references and crashes, then replays after a newer post. Show how recovery preserves identity and order. Separately, new posts and delayed deliveries arrive between page requests. Draw what remains stable for that reader and when newly visible items appear.

### Review your design

Compare push, pull, and mixed fanout using active readership and celebrity skew. Explain snapshot cost, expiry, and policy migration. Check that frozen candidates cannot preserve revoked access, and that references remain useful when hydration fails. Choose signals for fanout age, merge fan-in, source failures, page stability, and snapshot memory.
