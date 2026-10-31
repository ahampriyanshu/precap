# Metrics and Monitoring System

## The problem

A monitoring system ingests measurements, stores time series, answers time-range queries, and evaluates alerts. Assume 20,000 application instances expose 500 series each every 15 seconds. Ten million active series produce about 667,000 samples per second. At a hypothetical 16 bytes per raw timestamp/value pair, that is roughly 922 GB per day before labels, indexes, replication, or compression. Retention and label policy are capacity decisions, not dashboard details.

The system should detect outages within a minute, support recent interactive queries, and retain cheaper historical aggregates. It must also explain missing data: an absent measurement is not automatically a successful request or zero latency. A useful first scope covers counters, gauges, and latency histograms; logs and traces remain separate data products linked through controlled identifiers.

## Naive approach

One database table of arbitrary labels and raw samples is easy to query initially, but every new label combination creates a series and raw scans compete with ingestion. A dashboard may then try to aggregate locally computed percentiles:

```pseudocode
p95_A = percentile(instance_A_observations, 0.95)
p95_B = percentile(instance_B_observations, 0.95)
service_p95 = (p95_A + p95_B) / 2
# Neither original distribution is retained.
# The combined service percentile cannot be recovered from these values.
```

Equal weighting ignores request volume; request-weighted averaging still cannot reconstruct the missing distribution. Quantiles do not compose like sums and counts.

## Where the naive approach breaks

If one instance serves 10,000 fast requests and another serves ten slow ones, averaging their p95 values gives both instances equal influence while discarding the distributions. The combined percentile cannot be reconstructed.

Retries can double counts without an ingestion identity policy. Late data can alter an already evaluated alert. A request-ID label can create millions of short-lived series, and an unbounded query can exhaust memory precisely when operators need the system.

## A better design

Separate collection, durable ingestion, time-series storage, querying, and alert evaluation:

```text
Application metrics -> Collectors -> Ingestion gateway -> Time-series storage
Dashboard / alert evaluator -> Query service -> Time-series storage
```

Collectors attach stable source identity. Gateways authenticate tenants, validate schemas, limit batches, and enforce active-series budgets. Partition by `(tenant, metric_name, sorted_labels)`. A durable buffer absorbs brief storage interruptions, with bounded backlog and an explicit drop/backpressure policy when full. Stable labels and bounded cardinality are capacity controls.

For request latency, record compatible histogram buckets rather than precomputed per-instance p95. A Prometheus classic-histogram query computes rates first, merges bucket distributions, then estimates a quantile:

```promql
histogram_quantile(
  0.95,
  sum by (service, le) (
    rate(request_latency_seconds_bucket[1m])
  )
)
```

This assumes cumulative bucket counters with identical boundaries and enough scrapes in the selected minute. Preserve `le`, the bucket upper bound, while aggregating away instance identity. Applying `rate` before summing lets each counter’s reset be detected. The output is a bucket-based estimate, not an exact percentile of raw observations.

Keep observation count and sum too. Compatible buckets can be merged across instances and time windows; averaging per-minute p95 values still cannot produce an hourly p95. More buckets improve precision at extra ingestion, storage, and query cost. Missing samples are not zero latency or successful requests.

The batch protocol must define replay behavior using stable source identity and sequence, replacement of identical timestamped samples, or an explicitly at-least-once policy. Replicas must not double observations at query time. Late samples may change a window after alert evaluation, so choose an evaluation delay and absence policy. A missing scraper can otherwise look like recovery when its error series disappears.

Storage indexes bounded labels to compressed time blocks. Queries select series before scanning ranges and specify resolution; old data can move to cheaper aggregates with stated detail loss. Route templates, status classes, and services are useful dimensions. Raw URLs, user IDs, and request IDs belong in logs/traces rather than metric labels. Restrict selected-series count, query time, payload size, and tenant quotas so an incident query cannot disable monitoring.

Monitor the monitoring path: sample lag, dropped observations, series rejections, durable-buffer age, storage backlog, and query failures. Expose gaps and partial results instead of silently treating missing evidence as health.

## Real-world usage

Infrastructure and application monitoring use these techniques to turn large streams into bounded operational signals. Different systems choose push or pull collection and different retention tiers, but mergeability and cardinality constraints remain central.

## Practice

### Design brief

Design metrics ingestion, querying, and alerting for 20,000 instances exposing 500 series every 15 seconds. Ten million active series produce about 667,000 samples per second and roughly 922 GB daily at 16 raw bytes per sample, before overhead. Detect outages within a minute, support recent interactive queries, and retain cheaper historical aggregates. Define missing-data behavior and tenant capacity budgets.

### Draw and explain

In Excalidraw, label collection, durable ingestion, time-series ownership, query execution, alert evaluation, and retention tiers. Trace a latency measurement into a service-wide percentile and an alert window. Show series identity, histogram compatibility, replay identity, and late-data handling. Estimate the effect of retention, replication, and label growth; identify where query resource limits protect ingestion during an incident.

### Stress the design

An endpoint starts attaching request IDs as labels. Show how cardinality is bounded and how rejected measurements remain observable. Separately, a collector disappears while an error-rate alert is evaluating. Explain how absence differs from zero errors, how delayed samples affect the decision, and what detects the monitoring gap itself.

### Review your design

Compare push and pull collection for failure visibility and operational cost. Explain histogram precision against sample volume, and what downsampling can preserve. Check counter resets, duplicate replica reads, ingestion backpressure, and tenant isolation. Choose signals for sample age, dropped data, active-series rejection, buffer exhaustion, and query saturation.
