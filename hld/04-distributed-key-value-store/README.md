# Distributed Key-Value Store

## The problem

Design a durable store addressed by a single key, with `PUT /keys/{key}` and `GET /keys/{key}`. Clients need predictable behavior when replicas fail or contain different versions. Begin with explicit requirements: this worked system tolerates one unavailable replica for ordinary reads and writes, preserves concurrent versions, and exposes conflicts for an application to resolve. It does not promise linearizable updates.

Assume one billion records averaging 2 KB including metadata. One copy needs about 2 TB; three replicas need roughly 6 TB before indexes, compaction headroom, and backups. Replication multiplies both storage and write traffic. A useful architecture must explain which replicas receive a key, what acknowledgement means, and how an acknowledged value becomes discoverable after a failure.

## Naive approach

One durable server serializes updates but limits capacity and availability. Replication introduces conflicting observations. Choosing the highest timestamp is compact:

```pseudocode
base = {email: old_email, language: old_language}
write A observes base -> {email: new_email, language: old_language}
write B observes base -> {email: old_email, language: new_language}
A and B did not observe each other
winner = write_with_largest_wall_clock_timestamp(A, B)
# One independent field change disappears.
```

A total timestamp order does not prove causal succession. Clock skew can also choose a winner unrelated to arrival order. Preserving concurrent versions requires more information than “last timestamp wins.”

## Where the naive approach breaks

A write reaches replicas A and B, while C is temporarily unreachable. A later read from C returns the previous value. If the coordinator acknowledges before any durable write, a crash can lose a supposedly successful update. If it waits for every replica, one unavailable machine blocks all progress.

Timestamp selection creates another concrete loss. Two disconnected clients update the same base version independently. One adds an email address; the other changes a language preference. The timestamps order the writes even though neither update observed the other. Choosing the later timestamp cannot reconstruct the missing field change. Clock skew can make the apparent winner unrelated to actual arrival order.

## A better design

Partition keys into fixed replica sets. A coordinator locates replicas, enforces deadlines, and collects durable write acknowledgements or read responses.

```text
Client -> Coordinator -> Replica A
                    |-> Replica B
                    |-> Replica C
```

With three fixed replicas, two durable write acknowledgements and two read responses necessarily intersect. That statement assumes unchanged membership, no substituted replicas, and durability as promised. Intersection alone does not prove linearizability: concurrent writes and uncertain timeouts remain.

Use causal context to distinguish superseded from concurrent versions. Here is the reconciliation rule in pseudocode:

```pseudocode
function dominates(x, y):
    writers = union(keys(x), keys(y))
    no_smaller = every(x.get(w, 0) >= y.get(w, 0) for w in writers)
    one_larger = any(x.get(w, 0) > y.get(w, 0) for w in writers)
    return no_smaller and one_larger

frontier = deduplicate_versions(read_responses)
remove v if any(other != v and dominates(other.context, v.context)
                for other in frontier)
return frontier  # Incomparable versions remain separate siblings.
```

For contexts `{a:1}` and `{a:2}`, only the latter survives. `{a:1}` and `{b:1}` are incomparable, so both survive. This rule requires writers to create valid context covering the versions they observed; it cannot infer causality from arbitrary client counters. Vector growth needs a bounded-identity policy. The [Dynamo paper](https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store) motivates versioning and reconciliation.

The API returns sibling values with their contexts. A resolving client merges values according to application semantics and writes with context covering every sibling. The coordinator must not concatenate opaque payloads or discard a sibling because its timestamp looks older. A failed write may have reached some replicas even when the client receives a timeout; retry identity and reconciliation need an explicit policy.

Read repair sends the surviving frontier to responding replicas that lack it. An unavailable replica needs later anti-entropy or recovery; one read cannot repair every copy. Deletes carry causal tombstones, otherwise an old replica can resurrect a value. Retention must account for how long old versions can return.

Replicas own durable local records; the coordinator cannot reverse a partial distributed write by rolling back local memory. Monitor durable-write latency, quorum timeouts, sibling counts, repair backlog, and partition skew. Backups protect against accidental deletions that replication would faithfully copy.

## Real-world usage

Versioned stores fit data with application-defined conflict merging, such as independent preference changes. Inventory decrements and uniqueness claims may require stronger coordination. Availability during a partition trades against immediate agreement; the application must accept that conflict contract before choosing this design.

## Practice

### Design brief

Design a durable key-value store for one billion records averaging 2 KB including metadata. Three copies require roughly 6 TB before operational overhead. Ordinary reads and writes should tolerate one unavailable replica. Preserve concurrent versions for application resolution; state the consistency contract without promising linearizable updates. Define the durability meaning of a successful write and a target request deadline.

### Draw and explain

In Excalidraw, show key placement, coordinators, replica boundaries, and membership ownership. Label durable data, causal metadata, and read/write acknowledgement paths. Sketch a client contract that carries version context and can return conflicts. Trace a write, a read that encounters divergent replicas, and a resolving write. Include the path by which an unavailable replica eventually learns missed updates.

### Stress the design

A write reaches two replicas, but its reply is lost; the third replica returns later with an older value. Explain retry ambiguity and subsequent read outcomes. Separately, two clients update the same base version while disconnected. Draw how both versions remain discoverable and who is allowed to merge their meaning.

### Review your design

Check the assumptions behind quorum intersection, including membership changes and durable acknowledgements. Compare availability against stronger coordination for incompatible workloads. Explain causal-metadata growth, tombstone retention, repair bandwidth, and backup recovery. Identify signals for sibling growth, quorum timeouts, repair lag, and overloaded partitions; distinguish replication from protection against accidental deletion.
