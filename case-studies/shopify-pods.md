# The Pods architecture: sharding by tenant

## Context

Shopify runs a multi-tenant e-commerce platform. Through 2015, the platform was a Ruby on Rails monolith backed by a single MySQL primary. All merchants — from small storefronts to large brands — shared the same database. Shopify's growth through this period was driven partly by high-profile merchant launches: limited-edition product drops or celebrity-brand sales where a single merchant's store would receive millions of requests in minutes. These events exposed the fundamental problem with multi-tenant shared infrastructure: one merchant's load could degrade or bring down service for every other merchant on the platform.

## The problem

The single-database multi-tenant architecture had no isolation boundary between merchants at the data tier. Every merchant's orders, products, inventory records, and sessions were rows in the same set of MySQL tables, differentiated by a `shop_id` column.

**The hot merchant problem:** When Kylie Cosmetics launched lip kits on Shopify in 2015, demand exceeded expectations by orders of magnitude. The resulting traffic generated an extreme write rate against the MySQL primary — order insertions, inventory decrements, session writes, payment record creation — all serialized through a single primary. Write throughput on the primary saturated. InnoDB's row-level locking caused contention on hot rows (inventory counters). The primary's replication lag to read replicas grew, causing reads to stale data or fallback to the primary, compounding write pressure.

The MySQL primary slowed and eventually became a bottleneck for all Shopify merchants simultaneously. A merchant selling handmade candles in Vermont experienced degraded performance because a celebrity cosmetics brand was doing a product launch. This is the multi-tenancy isolation failure: one tenant's operational characteristics affect all others.

**Scaling options exhausted:** Vertical scaling (larger MySQL instance) was limited — single-instance MySQL has a practical ceiling on write throughput determined by disk I/O and CPU, not just memory. Read replicas didn't help with write saturation. Caching reduced read load but had no effect on the write path, and cache invalidation in a multi-tenant schema was complex.

**Schema coupling:** Because all merchants shared the same schema, any schema migration (adding a column, adding an index) required locking or online schema changes on tables containing all merchants' data simultaneously. As tables grew, migrations became slower and riskier.

## What they tried first

Shopify initially added read replicas and tuned the query path to shift as much read traffic off the primary as possible. This improved read scalability but left the write bottleneck untouched.

They also investigated sharding within the existing Rails monolith using application-level shard routing. The challenge was that Rails ActiveRecord, configured for a single database, made it technically difficult to route queries to different databases per request. The ORM's connection abstraction didn't cleanly support per-request database selection. Custom patches to ActiveRecord were fragile and required maintenance across Rails upgrades.

The team looked at middleware-level query routing (similar to what Vitess provides) but found that cross-shard queries — which were common in the existing codebase, e.g., queries that joined merchant data across multiple shop_ids — would require significant application rewrites regardless of which routing layer was chosen.

## The fix

The Pods architecture is a full-stack sharding model where each "pod" is a self-contained operational unit:

**Pod composition:** Each pod contains:
- A set of application servers (Rails instances).
- A dedicated MySQL primary and replica set.
- Associated caching layer (Memcached instances).

Merchants are statically assigned to pods. Pod assignment is stored in a global routing database (not MySQL) that maps `shop_id → pod_id`. This routing database is small (just the mapping table) and read-heavy; it's cached at the routing layer.

**Request routing:** A routing layer (reverse proxy or middleware) reads the `shop_id` from the incoming request (extracted from the domain, session, or request path), looks up the pod assignment, and forwards the request to the application servers in the assigned pod. The routing layer is stateless and horizontally scalable.

**Failure isolation:** A MySQL primary failure in pod 7 affects only the merchants assigned to pod 7. Pod 7's application servers return errors; all other pods are unaffected. This converts a full-platform outage into a partial outage bounded by pod size. Pod size (number of merchants per pod) is tunable — smaller pods mean smaller blast radius.

**Hot merchant migration:** When a merchant is expected to generate extreme load (a known product launch), they can be moved to a dedicated single-merchant pod before the event. The migration is a logical reassignment: data is migrated between MySQL instances (using standard MySQL replication or mysqldump), and the routing entry is updated atomically. No application code changes required.

**Cross-shard query policy:** Cross-pod queries are forbidden by policy. Any feature that requires data from multiple merchants is implemented through application-level aggregation using Shopify's data APIs, not direct database joins. This constraint is enforced by code review and enforced at the data layer by the fact that pods are physically separate databases — a cross-pod join is simply not possible without an explicit API call.

**Schema migrations:** Migrations run pod by pod. Because each pod has a bounded merchant count, the tables are smaller, and migrations complete faster. Migrations are run sequentially across pods with monitoring between each — a failed migration can be stopped before it affects all pods.

## What it cost

The pods architecture is more operationally complex than a single database. Each pod is an independent operational unit: it must be monitored individually, backed up independently, and upgraded separately. The fleet management overhead is significant at scale.

Merchant reassignment (moving a merchant between pods for load balancing) requires a live data migration with a cutover window, during which the merchant may experience a brief period of reduced service. Automating this safely took considerable engineering investment.

The prohibition on cross-pod queries required rewriting existing features that relied on cross-merchant joins, and permanently constrains product development — any new feature must be designed with the pod isolation model in mind from the start.

## Takeaways

- **Multi-tenant shared infrastructure provides no isolation between tenant load profiles**: One tenant's traffic spike degrades all others; isolation requires a physical boundary (separate databases, separate app tiers).
- **Static tenant-to-shard assignment with a routing lookup table is simpler and more reliable than dynamic consistent hashing**: The routing table is easy to reason about, easy to update manually for special cases, and doesn't require rehashing on cluster changes.
- **Failure blast radius is proportional to shard size**: Smaller pods mean fewer merchants affected per failure. The tradeoff is more pods to operate.
- **Cross-shard join prohibition is a constraint that must be enforced at multiple layers**: Policy alone is insufficient; the physical separation of databases makes enforcement automatic at the data layer.
- **Hot tenant migration as a first-class operational procedure is what makes the architecture practical for event-driven load**: Without a smooth migration path, the pods architecture would be static and unable to respond to known load events.

## Interview angle

The Pods architecture comes up in multi-tenant system design questions and database sharding discussions.

*"How would you design a multi-tenant SaaS platform that isolates tenant performance?"* — Pods (or an equivalent model) is the standard answer. The key design decisions to explain: how is the shard key chosen (tenant/shop ID), how is routing implemented (lookup table vs. consistent hashing), what happens when a shard is hot (migration vs. splitting), and what queries are forbidden (cross-shard joins).

A common follow-up: What's the difference between a Pods-style architecture and consistent hash-based sharding? Pods use a lookup table (flexible, manually adjustable, supports arbitrary assignment including hot-tenant migration); consistent hashing distributes keys by formula (no lookup table, automatic distribution, harder to manually override). Pods-style wins when you need manual control over placement; consistent hashing wins when you have many small keys and want automatic distribution.

Another angle: How do you do schema migrations across all pods? The answer is sequential (or parallel with limits) pod-by-pod migration with a backward-compatible schema change strategy (never drop columns in the same release that stops writing them).

---
*Source: Shopify Engineering Blog, 2018. "Deconstructing the Monolith: Designing Software that Maximizes Developer Productivity."*
