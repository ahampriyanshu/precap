# Testing, observability, and capacity reasoning

A backend is correct only if its invariants survive real concurrency and failures; it is useful only if it completes work within an acceptable budget. Tests, telemetry, and load experiments provide different evidence. A unit test proves one rule under controlled inputs. A production trace reveals one observed execution. A capacity test explores a workload under declared conditions.

Use each to answer a specific uncertainty rather than accumulating green checks or dashboards.

## Test at the boundary that owns the guarantee

Pure functions suit fast tests of pricing, transitions, parsing, and normalization. Real-database tests establish constraints, queries, transaction boundaries, and isolation behavior. Contract tests verify representations and error semantics. End-to-end tests cover a small set of important user journeys and deployment integration.

```text
Claim: two buyers cannot consume the last unit
Required evidence: concurrent transactions on separate connections;
                   final stock and accepted orders satisfy the invariant

Insufficient evidence: a mocked repository returned "out of stock" once
```

Generate explicit failure schedules. Pause both transactions after reading. Drop a response after commit. Crash a worker after its durable effect but before acknowledgement. Reorder a projection update and deletion. Use barriers or controlled hooks, not arbitrary sleeps, to reproduce the boundary.

This executable property check is small but illustrates asserting an invariant over many inputs:

```python
def reserve(available, requested):
    if requested <= 0 or requested > available:
        raise ValueError("invalid reservation")
    return available - requested

for available in range(1, 20):
    for requested in range(1, available + 1):
        remaining = reserve(available, requested)
        assert remaining >= 0
        assert remaining + requested == available
```

It does not prove the database implementation is race-safe. Keep the distinction visible: the pure rule and concurrent persistence need different tests.

## Instrument populations and individual paths

Metrics reveal rate, latency distributions, errors, saturation, and queues. Traces show a request or workflow's causal path. Structured logs record useful events and decisions. Correlate them with trace identity and release version, without dumping credentials or personal payloads.

Use bounded metric dimensions such as route template, method, status class, and dependency name. Raw request IDs, customer IDs, arbitrary URLs, and exception strings create unbounded cardinality. Tenant-level diagnosis may use sampled logs or carefully bounded separate analysis rather than one permanent metric series per possible object.

```text
route=/api/orders/{id}, status_class=2xx  → bounded metric dimensions
route=/api/orders/918273                 → potentially unbounded dimension
```

Histograms retain distributions that can be aggregated appropriately. Averaging per-instance p99 values does not produce fleet p99. Choose useful bucket boundaries and aggregate counts before calculating the percentile. Sampling also affects what traces can establish: absence of a sampled error trace is not evidence of no errors.

## Diagnose the critical path

Suppose API p99 rises from 180 ms to 1.4 s, CPU stays at 35%, database query execution remains near baseline, and pool wait rises sharply. The first hypothesis is scarce or retained connections, not insufficient CPU.

```text
Inspect:
  active vs idle-in-transaction sessions
  transaction lifetime and lock waits
  leaked/long-held connection ownership
  number of replicas × pools × deployment overlap
  background jobs sharing the same budget
```

A query span may exclude the wait to acquire a connection. Instrument pool acquisition separately. Likewise, a fast handler span can hide an ingress queue. Add timing where ownership changes, then correlate with actual resource state.

## Translate latency into capacity budgets

For a workload of 1,000 requests/s, if 30% need a database transaction holding a connection for an average 40 ms, the average connection occupancy from that path is `1,000 × 0.30 × 0.040 = 12`. This is not a recommended pool size: bursts, variance, locks, other paths, maintenance, and failure headroom still matter.

```text
Test budget:
  interactive transaction concurrency
  background worker concurrency
  migration/administrative reserve
  overlap during rolling deployment
  failover and cache-miss surge headroom
```

Measure service demand separately from end-to-end latency. Raising a connection pool can lower one queue briefly while creating a larger queue inside the database. Scaling API replicas can increase total downstream demand even when each replica appears healthy.

## Load tests must expose overload

Use representative request mixes, data volumes, tenant skew, payload sizes, cache states, and background traffic. A closed-loop test where each client waits before sending another request can reduce offered load as the server slows, hiding the severity of queueing. Report actual offered and completed rates and understand coordinated omission in latency measurement.

Increase traffic through the saturation point. A healthy overload policy keeps useful completions stable, rejects excess promptly, and recovers when offered load falls. Track queue age, deadline exhaustion, retries per logical request, memory, event-loop lag, database contention, and useful completion rate.

Also test degraded dependencies, cold caches, one unavailable replica, and a rolling restart. The system's sustainable capacity during a routine deployment may be lower than its all-healthy benchmark.

## Turn findings into an operational contract

Define user-facing service-level indicators: successful checkout completion within a time bound, not just an HTTP process being reachable. A background export needs completion-age and failure indicators separate from API acceptance. Error budgets can guide how aggressively to release or prioritize reliability work.

An incident record should capture observed impact, timeline, contributing mechanisms, detection gaps, and specific improvements with owners. “Increase timeouts” without explaining the bottleneck often makes the next incident last longer. Preserve evidence that distinguishes a slow dependency, a queue, a lock, and an incorrect retry policy.

The strongest review connects an invariant, an execution path, a capacity limit, a failure schedule, and the evidence used to verify them. That makes operational behavior explainable before a customer reports it.
