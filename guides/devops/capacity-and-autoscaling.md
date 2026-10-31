# Capacity, autoscaling, and overload

Autoscaling emerged because fixed capacity either wastes resources or fails when demand rises. It is a feedback loop with delay, incomplete signals, and dependency constraints. Understanding the workload's service rate and resource limits matters more than choosing a fashionable metric.

## Establish a capacity model

For a stable system, Little's Law relates average in-flight work to arrival rate and average time: `L = λ × W`. At 600 requests/second and 0.2 seconds average residence time, about 120 requests are in flight on average. This is a consistency check, not a concurrency setting or a tail-latency guarantee.

As utilization approaches saturation, queueing delay often rises sharply. A request waiting for a connection or CPU still consumes memory and some upstream deadline. Load tests should increase concurrency through the knee, observe useful throughput and p95/p99 latency, and identify the actual constrained resource. Rejected requests and timed-out work must remain visible in the result.

A simple fleet model is executable Python:

```python
from math import ceil

peak_rps = 2400
measured_rps_per_pod = 180   # at the accepted latency, with representative requests
operating_fraction = 0.65
required = ceil(peak_rps / (measured_rps_per_pod * operating_fraction))
print(required)             # 21 pods before separate failure-domain planning
```

The 65% target is an illustrative headroom choice. Measurements at one request mix or cache hit rate may not apply to another. Failure capacity and rollout surge capacity must be checked separately. With three zones, 21 evenly spread Pods leave 14 after one zone fails. That surviving fleet cannot serve 2,400 RPS at the same chosen operating fraction; preprovision, scale quickly enough for the objective, shed work, or revise the target.

## Understand the HPA loop

The Horizontal Pod Autoscaler adjusts replica count from observed metrics. A simplified resource-metric calculation is `desired replicas = ceil(current replicas × current metric / target metric)`, with readiness, missing metrics, tolerance, and stabilization affecting real behavior. CPU utilization uses the relevant CPU request as its denominator; missing or inappropriate requests make the signal misleading.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: orders
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: orders
  minReplicas: 6
  maxReplicas: 30
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 65
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

This needs a working resource metrics API and suitable workload requests. CPU can be low while every worker waits for a saturated database. A request-concurrency, queue-age, or completion-lag signal may represent that workload better, provided the autoscaler understands whether adding workers actually improves it.

Scale-down stabilization reduces churn but does not eliminate oscillation from noisy measurements or delayed startup. Observe detection delay, scheduling, image pulling, initialization, and readiness before extra capacity becomes useful. A sharp spike can arrive faster than the entire loop.

## Pod scaling and node scaling solve different shortages

The HPA can request more replicas while every replacement remains Pending. A node autoscaler supplies scheduling capacity subject to cloud quotas, instance availability, placement, and startup delay. Vertical sizing changes per-Pod resource needs, potentially requiring replacement. Coordinate these loops; changing resource requests also changes CPU-utilization percentages used by the HPA.

Keep minimum warm capacity for bursts that cannot tolerate cold start. Use scheduled scaling for well-known traffic events where appropriate, then let demand-based scaling handle residual variation. For batch workloads, admission and priority can defer less urgent work instead of competing with interactive requests.

## Protect the constrained dependency

Suppose a database permits 300 application connections. Reserve 60 for maintenance and other services, leaving 240. With a maximum of 30 API Pods, an 8-connection pool already consumes that whole budget before workers are counted. HPA limits, pool sizes, worker fleets, and rollout surge must share the same capacity model.

Bound queues and admission at a point where rejection is cheap. Apply per-tenant limits when one customer can monopolize shared resources. Use deadlines so queued work that is no longer useful is discarded before consuming scarce capacity. Retries require a budget and jitter; adding retry traffic during saturation can prevent recovery.

A queue absorbs temporary mismatch, but sustained arrivals above service capacity cause unbounded delay. If arrivals are 1,000 tasks/second and workers complete 800, backlog grows by 12,000 tasks per minute. With arrivals continuing at 1,000, workers must exceed that rate before the backlog can shrink. Scaling to 1,000 merely stops growth.

## Diagnose an autoscaling failure as a sequence

In a realistic failure, traffic rises, latency increases, CPU remains moderate, and HPA stays flat. Traces show time waiting for database connections. Increasing the CPU target or adding Pods will not address the bottleneck. First cap admissions and expensive queries, preserve critical traffic, then inspect pool wait, query plans, database I/O, and lock contention. Scale the right boundary only when there is evidence it will help.

For another failure, desired replicas rise but scheduled replicas do not. Inspect quotas, node capacity, affinity, storage-zone constraints, and cloud provisioning events. The same latency graph can come from either incident, but the corrective action differs.

Use the [Kubernetes cheatsheet](/cheatsheets/kubernetes/) to inspect HPA status, requests, scheduling events, and rollout capacity.
