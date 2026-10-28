# Turn telemetry into reliability decisions

## Set the target at the experience boundary

Define an eligible checkout attempt and its terminal result before choosing a target. A successful status code can conceal late or incorrect fulfillment. Timeouts remain part of the denominator even when their final outcomes are hard to reconcile.

An event-based SLO makes the budget arithmetic explicit. These are illustrative observed counts for one reporting window:

```python
eligible, bad = 200_000, 2_000
slo = 0.999
allowed_fraction = 1 - slo
observed_fraction = bad / eligible
print(f"bad fraction: {observed_fraction:.1%}")
print(f"burn rate: {observed_fraction / allowed_fraction:.1f}x")
```

The output is a 1.0% bad-event fraction and a 10.0× burn rate. The service is consuming its allowed fraction ten times faster than sustainable at this traffic mix. Choose the SLO and window with product and operational owners; a target implies a cost and a response policy. Segment the view when one region or payment method can fail inside a healthy aggregate.

## Make every interruption justify an action

A single short-window spike is noisy; a long window alone can keep alerting after recovery. Pair evidence of material consumption with confirmation that the problem is still active. For a 99.9% event-based SLO, these **recording-rule names** represent bad/eligible event-rate ratios over their stated windows:

```promql
(checkout:bad_ratio_1h > 14.4 * 0.001)
and
(checkout:bad_ratio_5m > 14.4 * 0.001)
```

Both records must preserve the same service/region labels and eligibility rules. The threshold is a fast-burn example from [Google's SLO alerting method](https://sre.google/workbook/alerting-on-slos/), not a universal threshold. Zero denominators and missing telemetry require explicit handling; they are not proof of success. Low traffic may need synthetic checks or direct handling of important failed transactions.

Every page should identify impact, owner and the first useful action, with a dashboard, release context and runbook. CPU and queue depth warrant paging when they predict a specific imminent failure with a useful response; otherwise route them to investigation or capacity work. Deduplicate dependency cascades.

## Restore the journey and verify recovery

Assign incident leadership and separate mitigation, investigation and communication. Roll back compatible code, shed optional work, cap retries or disable a failing capability. Irreversible schema changes require a recovery strategy beyond selecting yesterday's image.

A green request graph does not establish recovery for work already accepted. This **PostgreSQL reconciliation query** assumes `orders.accepted_at` is durable and terminal states are maintained by the order service:

```sql
SELECT region, count(*) AS overdue,
       min(accepted_at) AS oldest_accepted
FROM orders
WHERE state NOT IN ('completed', 'cancelled')
  AND accepted_at < now() - interval '10 minutes'
GROUP BY region;
```

The ten-minute deadline is an example business promise. Investigate those orders even if new requests succeed. A query of one database snapshot cannot reconcile a charge held only in a provider; join through stable operation IDs and verify ambiguous outcomes at their authority. Keep an explicit owner for backlog drain, duplicate effects and customer reconciliation.

Compare independent evidence—edge traffic, client failures, synthetic journeys and durable records—when the telemetry pipeline is impaired. Report uncertainty instead of converting missing data into an exact impact count.

## Convert the incident into an investment decision

Select actions against the failure mechanism, detection gap and recovery friction. Give each an owner, deadline and completion evidence. A useful reconciliation tool or bounded retry policy can improve recovery more than a long list of low-value alerts.

Use budget consumption to negotiate release risk under an agreed policy. Include queue drain time, peak arrivals and capacity during failures in planning. Spare error budget does not make an irreversible change safe.

The measurement pipeline needs its own owner: monitor Collector queue utilization, refused data, export failures and data flow. A failed export can be retried, so failure counts alone do not establish loss. [OpenTelemetry's internal telemetry reference](https://opentelemetry.io/docs/collector/internal-telemetry/) identifies these signals. Reduce expensive unused streams while preserving coverage of the journeys that drive operational decisions.
