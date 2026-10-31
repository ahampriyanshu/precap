# Operational telemetry: Grafana, New Relic, Sentry, and replay

## Choose the question before choosing the screen

Centralized telemetry grew from a practical limitation: inspecting files on one machine stops working when requests cross services, workers, and browsers. The tools aggregate different kinds of evidence. The important skill is moving from a symptom to the evidence that can confirm or reject an explanation.

| Tool        | Useful role in an investigation                                                  | Boundary to remember                                                             |
| ----------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Grafana     | Query and visualize metrics, logs, traces, and other configured data sources     | The data source and collection pipeline determine what exists to query           |
| New Relic   | Correlate application performance and logs, then query ingested events with NRQL | Agent/forwarder configuration and attribute mapping determine correlation        |
| Sentry      | Investigate grouped errors, stack traces, release context, and breadcrumbs       | Error reports are neither a transaction ledger nor an unbiased count of attempts |
| Honeybadger | Track application errors and use Insights for structured event/log investigation | Decide what is reported and correlate it with the operation that failed          |
| FullStory   | Reconstruct browser interactions with session replay and captured context        | A replay explains the visible journey; durable backend state decides the outcome |

These roles overlap, and capabilities depend on the configured SDK, pipeline, and account. The table is a way to navigate evidence, not a requirement to deploy all five products.

## Use Grafana with a deliberate data model

Grafana queries configured data sources. A common setup uses Prometheus or Mimir for metrics, Loki for logs, and Tempo for traces. The application or collector supplies the data; a dashboard cannot reconstruct an event that was never collected.

In Loki, choose bounded stream labels such as service and environment. Parse detailed fields from the log body or structured metadata instead of making every request ID a new stream. This LogQL example assumes those labels exist and each body is JSON:

```logql
{service_name="exports", environment="production"}
  | json
  | __error__=""
  | error_code="POOL_TIMEOUT"
```

Use a bounded incident interval in the query UI, compare releases, then find a representative trace from the correlated IDs. Empty results can mean missing collection, a label mismatch, retention, or a genuine absence. Check collection health before turning an empty dashboard into a recovery statement.

## Use New Relic to join performance and log evidence

New Relic's APM logs-in-context flow can enrich logs with trace, span, and entity metadata. Verify correlation on a known request before relying on it during an incident. Use one intentional forwarding route; sending the same records through an agent and another forwarder can duplicate volume and cost.

This NRQL query assumes ingested `Log` records have the team's normalized `service_name`, `level`, `release`, and `error_code` attributes:

```sql
FROM Log
SELECT count(*)
WHERE service_name = 'exports' AND level = 'ERROR'
FACET release, error_code
SINCE 30 minutes ago
```

It counts error log records, not affected customers or an error rate. For a failure rate, use a consistently instrumented attempt population. Query attributes as actually ingested; a missing field may reflect a parser or agent configuration change rather than a disappearing error.

When a slow transaction has healthy query execution but long acquisition waits, inspect pool saturation and transaction lifetime. An APM dependency graph narrows the search; it does not establish that the slowest-looking dependency owns the cause.

## Use Sentry and Honeybadger to prioritize failures

Error grouping turns repeated exceptions into actionable issues. In Sentry, inspect the affected release, environment, stack, and breadcrumbs before assigning ownership. Match source maps or debug artifacts to the exact deployed build so that minified browser frames resolve to the right code.

Honeybadger provides error reporting and Insights for event/log analysis. Keep a stable operation identifier when connecting a captured failure to structured logs. In either tool, decide which boundary reports the error; reporting the same caught exception at every layer creates noise and misleading volume.

A useful diagnostic record has bounded classifications plus protected correlation identifiers. This is an application-owned event shape, not either vendor's API contract:

```json
{
  "event": "export.failed",
  "error_type": "ConnectionAcquireTimeout",
  "error_code": "POOL_TIMEOUT",
  "service_name": "exports",
  "release": "exports@a81f2",
  "config_revision": "flags-118",
  "operation_id": "export-842",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

A stable error code supports aggregation even when the human message changes. Keep unique IDs out of metric labels. Avoid attaching raw payloads or credentials as convenient debugging context; retain approved details in an access-controlled source when they are required.

Prioritize by user impact, recurrence, recoverability, and integrity risk. A noisy harmless retry can outrank a rare lost export in an issue list unless ownership and severity reflect the product outcome.

## Use FullStory to reconstruct the interaction

FullStory can connect a replay to captured events and identity context. A replay helps answer whether the user reached the new flow, saw an error, or repeated an action after ambiguous feedback. Pair its session reference with the release and request context needed to continue the investigation.

Treat a frustration signal as a lead. Repeated clicks can be caused by slow rendering, poor feedback, a disabled control, or an unrelated user action. Compare the browser sequence with network failures and authoritative completion state before naming a cause.

Configure capture, masking/exclusion, retention, and access for the actual screens. Test with synthetic sensitive values, including data that appears only after interaction. DOM masking alone does not establish that URLs, custom event properties, network metadata, or uploaded error attachments are clean. Capture only the replay scope that supports the approved investigation.

## Connect tools through a shared investigation contract

A useful chain is: metric identifies the affected interval and cohort; an error or log supplies a representative operation; a trace finds the waiting boundary; replay explains the browser path; durable records verify the result. It need not traverse every product for every incident.

Preserve service, environment, release, time, trace/operation identifiers, and configuration revision across the relevant streams. Wall clocks can differ, and session IDs are not trace IDs. Avoid joining unrelated records just because their timestamps are close.

Budget evidence collection as production work. Set sampling and retention deliberately, measure dropped records and exporter backlog, and protect response latency when a vendor is unavailable. The system should remain operable when one dashboard or telemetry backend is down.
