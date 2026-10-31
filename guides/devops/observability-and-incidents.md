# Observability, SLOs, and incident response

A platform is useful when customers can complete their work. Host health and deployment status are intermediate signals. Observability connects an observed outcome to the work that produced it; SLOs make the acceptable level of failure explicit. This turns operations from reacting to every unusual graph into prioritizing impact and recovery.

## Define the useful outcome and its denominator

An availability SLI needs a precise event definition: which requests count, what success means, and where it is measured. A 200 response with an empty checkout result can be a product failure. A client cancellation may represent a slow system or unrelated navigation. The denominator and exclusions should be intentional and resistant to hiding failures.

For a 99.9% success target over a rolling window of one million eligible requests, the budget is 1,000 unsuccessful requests. If failures occur at 1%, budget is consumed ten times the target rate. A request-based objective and a time-based objective can produce different conclusions during a concentrated traffic event.

```promql
sum(rate(http_requests_total{service="orders",outcome="failure"}[5m]))
/
clamp_min(sum(rate(http_requests_total{service="orders"}[5m])), 0.001)
```

This illustrative PromQL computes a short-window failure fraction for an agreed metric contract. It is not a complete paging rule: low traffic, missing telemetry, and label mismatches need handling. Pair fast and slow burn windows to detect both sharp and sustained impact, and evaluate whether there are enough events for the result to be meaningful.

## Connect metrics, traces, and logs

Metrics summarize behavior over time. Traces show a sample of request or workflow execution across boundaries. Logs record discrete events with context. Propagate trace context through HTTP and messages, and attach service/version/resource identity so the evidence can be related to the release.

Use histograms to aggregate latency distributions across instances. Averaging per-instance p99 values does not produce a fleet p99. Labeling every metric with user ID or request ID creates an unbounded series set; keep high-cardinality identifiers in controlled traces or logs instead.

Sampling trades detail for cost. Head sampling makes the decision early; tail sampling can retain interesting traces after observing them, with buffering and correlation costs. A sampled trace is evidence of a path, not a representative denominator for an availability calculation. Monitor the telemetry pipeline itself: dropped spans or delayed logs can distort an incident investigation.

## Diagnose from the outside inward

Begin with impact: affected operation, tenants, regions, versions, and time window. Compare a known-good path. Then inspect traffic, errors, latency, and saturation at the boundaries on the failing path. A recent deployment is a useful hypothesis, not proof of causality.

Suppose p99 rises immediately after a rollout but CPU falls. Traces show a new sequential dependency call and increased database pool wait. The low CPU is consistent with waiting, not spare useful capacity. Pausing rollout and restoring a compatible path may recover faster than scaling the frontend fleet.

For background jobs, measure useful completion, oldest pending age, retry rate, and terminal failures. Queue length alone misses a stalled old job among many fast completions. Correlate producer and consumer versions, schema revisions, and stable operation identifiers.

## Organize the response around recovery

Assign an incident lead, an investigation owner, and a communication owner when scope warrants it. Record observations and actions with timestamps. Separate hypotheses from confirmed evidence so two people do not make conflicting changes based on different assumptions.

Prefer reversible mitigations with a known boundary: halt a rollout, disable an optional expensive feature, shed a noncritical queue, or route around a failed zone if remaining capacity exists. A database failover, forced lock removal, or data repair may carry greater risk and needs explicit invariants and an accountable operator.

Verify recovery through customer-path success, tail latency, backlog drainage, and data integrity. A green dashboard with no incoming traffic is not recovery. Continue monitoring delayed effects such as retries, replication lag, and reconciliation jobs after the immediate symptoms improve.

## Learn without creating a checklist factory

A useful review explains trigger, contributing conditions, detection gap, mitigation effectiveness, and why existing defenses did not contain the failure. Actions should change a mechanism: enforce an invariant, reduce blast radius, improve recovery, or make a previously invisible boundary observable. “Be more careful” does not alter the system.

Reliability work competes with features and cost. Use error-budget consumption, customer harm, and recovery exposure to justify the next investment. A service meeting a reasonable SLO may benefit more from simpler operations than from another redundancy layer nobody can diagnose.
