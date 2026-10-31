// Existing long-form reads, ordered around the mechanisms used in design interviews.
export const systemDesignBasics = [
  {
    slug: "requests-and-protocols",
    label: "Requests and protocols",
    focus: "HTTP, RPC, connection lifecycles and the server boundary.",
  },
  {
    slug: "storage-indexes-and-query-plans",
    label: "Storage and indexes",
    focus: "Access patterns, storage engines and query costs.",
  },
  {
    slug: "transactions-and-concurrency-control",
    label: "Transactions and concurrency",
    focus: "Isolation, MVCC and competing writes.",
  },
  {
    slug: "caches-and-invalidation",
    label: "Caching",
    focus: "Freshness, invalidation and avoiding stampedes.",
  },
  {
    slug: "queues-streams-and-outbox",
    label: "Queues and streams",
    focus: "Delivery guarantees, ordering and the outbox.",
  },
  {
    slug: "replication-partitioning-and-identifiers",
    label: "Replication and partitioning",
    focus: "Consistency, hot partitions and identifier design.",
  },
  {
    slug: "dependency-failures-and-idempotency",
    label: "Failures and retries",
    focus: "Deadlines, retry budgets and idempotency.",
  },
  {
    slug: "testing-observability-and-capacity",
    label: "Capacity and validation",
    focus: "Load, saturation and checking design assumptions.",
  },
] as const;
