# Production debugging: test a hypothesis at each boundary

## Turn a symptom into a falsifiable explanation

A debugging session is a sequence of experiments. Start with a concrete discrepancy: requests spend four seconds in an API while normal requests take 150 ms. List explanations that predict different evidence: queueing for a connection, a slow query, an external call, or CPU work on the request thread.

Keep a small hypothesis table. State the next observation that would weaken an explanation, not just the graph that could support it. “The database is slow” is too broad. “Requests wait for a connection before any SQL starts” predicts a long acquisition interval and a saturated pool even when query execution is healthy.

Use a representative failing operation and a healthy comparison with the same endpoint, tenant class, payload shape, and release where possible. Otherwise, a difference in workload can masquerade as a regression.

## Find where wall-clock time was spent

![Overlapping cache and database child spans explain one request; a separate latency histogram shows the wider distribution.](/diagrams/last-mile-trace.svg)

A distributed trace shows span durations and causal relationships. The critical path determines latency; adding all child durations double-counts overlapping work. A database span may include client-side work or network time, depending on instrumentation.

This Python example calculates the union of two overlapping child intervals within a 1,000 ms request:

```python
children = [(100, 400), (200, 700)]  # milliseconds from request start
merged = []
for start, end in sorted(children):
    if merged and start <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])
covered_ms = sum(end - start for start, end in merged)
print(covered_ms)          # 600, not 800
print(1000 - covered_ms)   # 400 outside these child intervals
```

The uncovered 400 ms is a lead, not automatically CPU time. It can include queueing, missing instrumentation, serialization, scheduling, and network activity. A single trace also cannot establish p99 behavior for the entire service. Correlate the trace with aggregate latency and sampling policy before deciding how representative it is.

## Distinguish saturation, slow work, and blocked work

Use rate, errors, and duration to characterize the service, then utilization, saturation, and errors to inspect a constrained resource. High utilization without queueing may be healthy. Low CPU does not rule out overload when requests are waiting on a small connection pool.

| Observation                                 | Strong next check                                   | Common false conclusion                               |
| ------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| High latency, low CPU, full DB pool         | Acquisition wait, transaction age, connection leaks | Add API replicas without increasing database capacity |
| High CPU, rising event-loop delay           | CPU profile, hot input sizes, synchronous work      | Increase HTTP timeouts                                |
| Queue age rises while throughput stays flat | Arrival rate, service time, worker/dependency limit | Queue depth alone gives the recovery deadline         |
| SQL latency changes for one tenant          | Plan, row estimates, skew, lock wait                | The index exists, so the plan must use it             |
| Browser interaction stalls, API is healthy  | Main-thread tasks, rendering work, client errors    | The network must be the cause                         |

For PostgreSQL, inspect active sessions before running an expensive diagnostic. This query assumes permission to inspect activity:

```sql
SELECT pid, state, wait_event_type, wait_event,
       now() - xact_start AS transaction_age,
       now() - query_start AS query_age
FROM pg_stat_activity
WHERE datname = current_database()
  AND state <> 'idle'
ORDER BY xact_start NULLS LAST;
```

`idle in transaction` is intentionally included: it may hold locks without running a query. Inspect blockers and the owning operation before terminating anything. `EXPLAIN ANALYZE` executes its statement; a production write or an unbounded read is not made safe by calling it a diagnostic.

## Correlate errors with the deployed artifact

An exception count is not an affected-user count. One broken retry loop can emit thousands of reports for one operation. Group by release, environment, stable error type, route template, and affected account cohort; use protected request IDs to inspect individual cases.

For browser failures, match the stack to the exact JavaScript build and its source maps. Replaying an error against a different asset version can lead to the wrong line and wrong hypothesis. Breadcrumbs and a masked replay help reconstruct the preceding navigation and interaction, but backend records still decide whether a transaction committed.

Check the most recent flag or configuration revision as well as the binary. A release dashboard that tracks only Git commits misses behavior changes caused by remote configuration.

## Make the experiment safe and interpretable

Prefer bounded diagnostics: a short profile on one representative instance, a read-only query with a timeout, or increased sampling for one known failure cohort. Record what changed and restore temporary settings afterward. High-volume debug logging can create the next outage through CPU, I/O, or ingestion pressure.

A successful experiment predicts both the immediate symptom and the recovery mechanism. If disabling enrichment lowers worker service time, completion throughput should rise and oldest queue age should fall. A CPU drop alone does not prove the customer journey recovered.

Capture enough evidence for a reproduction: the input shape, schema/configuration version, ordering, clock assumptions, and dependency behavior. Use synthetic or approved redacted data rather than copying a live customer's payload into a development environment.

## State a defensible conclusion

A useful technical account separates the trigger, failure mechanism, amplification, and detection gap. A release may trigger a lock pattern; long transactions cause contention; retries amplify demand; aggregate metrics hide the affected tenant. Fixing only the trigger leaves the mechanism available to the next workload.

In an interview or incident review, explain which evidence ruled out the alternatives and why the chosen mitigation worked. “We restarted it and it recovered” is a timeline. “A leaked pool slot reduced capacity on every timeout, and recycling the instance restored slots while the patch closed them on cancellation” is an explanation that can be tested.
