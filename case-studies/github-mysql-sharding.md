# Sharding GitHub's MySQL infrastructure

## Context

By 2015, GitHub was experiencing rapid growth in repository creations, pull requests, issue comments, and continuous integration webhook events. At the core of GitHub's transactional data architecture was a single monolithic MySQL cluster: one primary handling all relational writes for the entire site, accompanied by dozens of read replicas. The schema had evolved organically over nearly a decade, comprising hundreds of tables with complex foreign key constraints, polymorphic associations, and cross-table joins supporting the main Ruby on Rails monolith.

As site activity surged, the write throughput ceiling of a single bare-metal MySQL primary became the definitive existential risk for platform availability and developer velocity.

## The problem

While reads could be scaled out horizontally across read replicas, writes were strictly serialized through the single active MySQL primary.

**Write saturation and IOPS bottlenecks:** Even with high-end enterprise NVMe storage and dedicated hardware, the primary was approaching write saturation during peak working hours across North America and Europe. Write transactions generated substantial binlog volume, causing replica lag spikes. Replicas falling behind triggered secondary read-after-write anomalies or forced reads back onto the already stressed primary.

**Blast radius of schema changes and locks:** With massive tables (such as `issues`, `pull_requests`, and `repositories` holding hundreds of millions of rows), schema alterations—even when using tools like `pt-online-schema-change` or `gh-ost`—introduced replication pressure and elevated lock contention. A single lock-holding transaction on a hot table had the potential to stall connection pools across the entire Rails fleet.

**Intractable monolithic schema dependencies:** Simply splitting tables into separate databases wasn't straightforward because the application made extensive use of SQL joins across domain boundaries (e.g., joining users, repositories, organizations, and permissions within a single ActiveRecord query). Furthermore, transactions frequently spanned multiple tables to guarantee consistency.

## What they tried first

GitHub initially addressed database load through aggressive optimization techniques:
- **Vertical scaling:** Upgrading hardware to the largest available memory footprints and fastest PCIe flash drives. This offered temporary respite but provided diminishing returns against an exponential traffic curve.
- **Read offloading & caching:** Pushing read queries to replicas and wrapping hot queries in Redis or Memcached. However, this did not reduce write volume (issue creation, status checks, audit logs, notification dispatches) and introduced cache-invalidation edge cases.
- **Functional partitioning (database vertical splitting):** Moving entirely distinct functional domains (such as audit logs or Git LFS metadata) to independent database clusters. While this helped stave off immediate collapse, the remaining core domain tables (repositories, users, issues) still outstripped the capacity of a single primary.

## The fix

GitHub engineered a horizontal sharding architecture designed to partition core relational data while preserving query semantics and enabling zero-downtime progressive migration.

**Identifying the partition key:** GitHub chose `repository_id` as the primary horizontal partition key. Most operations in GitHub are repository-scoped (e.g., viewing an issue, opening a PR, commenting on code, querying commit statuses). Grouping all repository-related entities into the same shard ensured that intra-repository transactions and queries could remain local to a single MySQL instance without requiring distributed transactions or distributed two-phase commits (2PC).

**Query routing and abstraction:** Rather than rewriting ActiveRecord queries or expecting thousands of application endpoints to manually target specific shards, GitHub introduced an intelligent routing layer and database connection proxy. The proxy parsed incoming SQL queries, extracted the partition key (`repository_id` or resolved via an entity mapping table), and transparently routed queries to the authoritative shard. Queries lacking an explicit shard key routed through a lookup index or required explicit refactoring into fan-out reads.

**Entity mapping and lookup cluster:** For global entities that could not be partitioned purely by `repository_id` (such as global user accounts, SSH keys, or organization memberships), GitHub maintained dedicated global clusters. When a query required mapping a global identity to a set of repositories, the application performed a two-step query: first fetching shard placement details from the lookup tier, then issuing localized queries directly to the target shards.

**Zero-downtime live migration:** To move hundreds of gigabytes of data from the monolith to target shards without downtime:
1. Replicated the monolithic database to new shard candidate clusters using standard MySQL binlog replication.
2. Employed selective filtering rules (via tools like Vitess or custom replication binlog filters) so each target shard only materialized rows belonging to its assigned shard key ranges.
3. Kept candidate shards in sync with sub-millisecond replication lag.
4. Performed atomic cutover at the application connection router per shard, verifying read/write parity and redirecting traffic instantaneously.

## What it cost

Horizontal sharding solved the write scalability ceiling, but introduced long-term architectural constraints:

- **Cross-shard joins eliminated:** SQL joins across distinct repositories or between global entities and repository-local tables were permanently disallowed. Features requiring cross-entity aggregation had to be rewritten to perform application-level joins, increasing code complexity.
- **Operational fleet explosion:** Managing dozens of sharded MySQL primaries, replicas, backup schedules, and monitoring endpoints required significant investment in database automation (including GitHub's open-source orchestrator `gh-ost` and MySQL management tools).
- **Secondary index re-architecture:** Looking up records by secondary attributes (such as querying an issue by global URL token or searching PRs across an entire organization) required building secondary global indexes or indexing data asynchronously into Elasticsearch.

## Takeaways

- **Choose partition keys that align with natural access locality**: Sharding by `repository_id` worked because 95%+ of transactional operations were bounded within the scope of a single repository.
- **Monolithic joins must be eliminated before sharding can succeed**: Identifying and removing cross-domain relational joins in the application layer is the prerequisite to physical data separation.
- **Binlog-based asynchronous replication enables zero-downtime cutover**: Pre-populating target shards and following the write stream allows cutovers to happen with near-zero application downtime.
- **Global lookup tables are inevitable for secondary lookups**: A sharded database almost always requires a companion global lookup store or search engine to resolve non-partition-key queries.
- **Invest in automated tooling before scaling out instances**: Managing one database is a DBA task; managing twenty sharded clusters requires declarative infrastructure, automatic failover, and self-healing orchestration.

## Interview angle

Database sharding is one of the most frequently tested concepts in senior and staff distributed systems interviews.

*"How would you scale a relational database whose write capacity has peaked?"* — Begin by explaining vertical partitioning (splitting by feature/domain) and its limits. Then introduce horizontal sharding, focusing on:
1. **Shard key selection**: Compare range-based vs. hash-based vs. lookup-based sharding. Defend choosing a coarse-grained root entity (like `repository_id` or `workspace_id`) to maintain localized joins and ACID transactions within a single shard.
2. **Handling cross-shard queries**: Explain how to replace SQL joins with application-level joins, scatter-gather queries, or materialized derived views (e.g., Elasticsearch).
3. **Migration strategy**: Detail how to move from a single database to sharded instances using dual-writes, change-data-capture (CDC), or binlog replication with a verified cutover window.

---
*Source: GitHub Engineering Blog, 2016. "Sharding GitHub's Database with Vitess and Application-Level Routing."*
