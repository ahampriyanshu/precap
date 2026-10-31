# Distributed Cache

## The problem

Design a cache shared by many application servers so repeated reads avoid expensive database work. Values are disposable copies; the database remains authoritative. The cache must distribute keys across nodes, handle node membership changes, and keep a cache failure from turning into a database failure.

Assume ten million hot entries with average payloads of 1 KB. Payload alone occupies about 10 GB; two copies require about 20 GB before keys, allocator overhead, and headroom. Suppose the application receives 100,000 reads per second. A 95% hit rate leaves about 5,000 origin reads per second, whereas a fall to 80% leaves 20,000. That fourfold origin increase is the central capacity risk when a cache node disappears or a fleet starts cold.

## Naive approach

A modulo client sends each key to `hash(key) % node_count`, then reads the origin and caches the result on a miss. Membership becomes part of the routing protocol:

```pseudocode
old_nodes = [A, B, C]
new_nodes = [A, B, C, D]
position = stable_hash(key)
old_owner = old_nodes[position mod 3]
new_owner = new_nodes[position mod 4]
# Many healthy-node keys now route somewhere else.
```

Both clients must agree on the hash, node order, and topology. Python’s process-dependent string hash is unsuitable for that shared protocol. Adding capacity can otherwise create a cold-cache event rather than a gradual redistribution.

## Where the naive approach breaks

Adding a fourth node changes the modulus from three to four. Many keys route to a different destination despite their previous node remaining healthy. A deployment intended to add capacity suddenly causes widespread misses. Applications fetch those keys from the database at once, producing a load spike before the new capacity becomes useful.

A single hot key creates another failure trace. Its owner fails, every requester misses, and thousands of identical reads hit the origin before the first refill completes. Even perfect distribution across ordinary keys does not divide that key's demand. A stale topology is also dangerous: two clients may populate different nodes for the same key and invalidate only one copy. Routing correctness and value freshness need separate protocols.

## A better design

Use an explicit topology version and a stable hash space. Give each physical node multiple token positions; route a key to the first token clockwise, wrapping at the end.

```text
Application -> Cache client + topology -> Owner cache node
                       | miss
                       v
                  Origin database
```

The routing and replica-selection mechanism can be stated without inventing a network implementation:

```pseudocode
position = stable_hash(key)
tokens = topology[version].tokens_in_clockwise_order
primary = first_token_at_or_after(tokens, position, wrapping=True)
replicas = []
for token in clockwise_walk(tokens, start=primary):
    if token.physical_node not in replicas:
        replicas.append(token.physical_node)
    if len(replicas) == configured_replica_count:
        break
```

Replica selection skips repeated virtual tokens on the same machine; otherwise “two replicas” could share one failure domain. This assumes enough distinct healthy nodes and one agreed topology. It specifies placement, not byte copying, membership consensus, or automatic repair.

Inserting one token transfers only its acquired interval from the previous owner; other intervals retain ownership. Plan migration, temporary dual reads, or controlled refill while clients change topology versions. Virtual nodes improve balancing options, but a hot key still concentrates traffic and node memory is not equivalent to request load.

The database owns accepted source values. Writes commit there and invalidate or refresh cached entries through a defined mechanism. Reads route to an owner, check freshness, and fetch the origin on misses. Bound concurrent origin refills per key, use deadlines, and serve acceptable stale content only for operations whose policy permits it. A process-local lock coalesces only that process’s requests. Node loss and cold starts need origin admission control as well as extra cache nodes.

Replication can preserve hits during a node outage at memory and invalidation cost; accepting misses may be simpler if the origin has headroom. TTL bounds eligibility of an untouched entry, but does not prevent staleness immediately after a source update. Reliable invalidation, source versions, or explicit read-through authority address that different requirement. Longer TTLs lower origin load while increasing dependence on the invalidation path.

## Real-world usage

Shared caches suit catalog reads, computed fragments, and other expensive results with explicit freshness rules. Track hit rate by operation, origin fallback rate, refill concurrency, evictions, per-node memory, and ownership imbalance during deployments. Cap value sizes and cache-key cardinality so untrusted requests cannot fill memory cheaply.

## Practice

### Design brief

Design a shared cache for ten million hot entries averaging 1 KB and 100,000 reads per second. The database remains authoritative. A 95% hit rate leaves about 5,000 origin reads per second; an 80% hit rate leaves 20,000. State the origin's safe refill budget and define which reads may accept stale values. Estimate memory with replicas and operational headroom.

### Draw and explain

Use Excalidraw to show applications, cache routing, membership ownership, cache nodes, and the origin boundary. Label the placement rule, topology version, value ownership, and freshness metadata. Trace a hit, a miss, and a source-data update. Draw a before-and-after placement view for adding a node, identifying the keys that move and how their bytes become available.

### Stress the design

Remove a node holding a hot key while thousands of readers request it. Explain how the design limits concurrent origin work and what readers receive while refilling. Next, let clients disagree about membership during a source update. Trace which copies may remain stale and how the system converges.

### Review your design

Compare replication with controlled misses using the origin budget. Check whether TTL, invalidation, and topology rollout each solve the intended problem. Explain the memory and freshness cost of stale serving, and why virtual nodes cannot divide a single key's traffic. Choose measures for movement, refill pressure, eviction, and skew.
