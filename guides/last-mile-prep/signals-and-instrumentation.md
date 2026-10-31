# Signals, structured logs, and trace context

## Separate the evidence each signal provides

Logs record discrete events; metrics aggregate numeric behavior; traces connect work across boundaries. Profiles explain where execution resources are spent. They answer related questions at different cost and resolution. Start with the user-visible outcome and choose the minimum evidence needed to distinguish its important failure modes.

![Application signals pass through bounded collection and export into metrics, logs, and traces; shared trace IDs connect detailed evidence.](/diagrams/last-mile-telemetry-pipeline.svg)

A request can fail before the API, after acceptance in a queue, or after a durable commit while the response is lost. Instrument the boundary where each promise becomes true. “HTTP success” and “business success” must remain distinguishable when they represent different events.

## Locate the customer-visible regression

Checkout completion falls after a release, while the API dashboard stays green. HTTP `200` may mean only that a job entered a queue. Start with eligible attempts, durable confirmations and elapsed time across the journey; compare release cohorts and meaningful segments.

A latency query should preserve the population being investigated. For **classic Prometheus histogram buckets** emitted once per checkout attempt:

```promql
histogram_quantile(
  0.99,
  sum by (le, region, outcome) (
    rate(checkout_duration_seconds_bucket[5m])
  )
)
```

This calculates p99 per region and outcome from aggregated bucket rates. Averaging instance p99 values would lose the underlying distribution. Fast failures can make aggregate latency improve during an outage, which is why successful and failed outcomes remain distinguishable. Bucket resolution limits the estimate.

Metrics establish extent and timing. Logs identify rejected transitions and dependency errors. Traces expose where representative requests waited. A slow span narrows the explanation; compare healthy and failing paths before declaring a cause.

## Emit structured events with a stable meaning

Free-form messages become hard to group when instances, releases, and teams multiply. Use structured fields for severity, service, environment, operation, release, and correlation. Keep error classifications stable while human wording evolves.

This is an illustrative application log line after JSON serialization:

```json
{
  "timestamp": "2026-10-29T08:14:02.341Z",
  "level": "ERROR",
  "service_name": "exports",
  "environment": "production",
  "event": "export.failed",
  "error_code": "POOL_TIMEOUT",
  "release": "exports@a81f2",
  "duration_ms": 2004,
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

Set severity against the operation's outcome and the action expected. A handled retry is not necessarily a failed customer operation. Record a failure at its owning boundary and retain exception details where they are useful; repeated stack dumps at every layer waste ingestion and obscure unique failures.

Keep raw request bodies, credentials, and unbounded dynamic fields out of routine logs. Detailed identifiers can be useful in protected records, but they do not belong in metric label sets. A route template such as `/exports/:id` stays bounded; one label value per concrete URL does not.

## Instrument the boundaries that change the explanation

Instrument server, HTTP client, database and messaging boundaries first. Add custom spans around consequential business work, rather than every helper function. With the OpenTelemetry SDK and exporters configured at startup, this **application fragment** records an order-commit attempt:

```python
from opentelemetry import trace

tracer = trace.get_tracer("checkout")
with tracer.start_as_current_span("order.commit") as span:
    span.set_attribute("checkout.operation", "create_order")
    span.set_attribute("deployment.revision", release_revision)
    order = commit_order(request)  # application-owned transaction
    span.set_attribute("checkout.outcome", "committed")
```

`release_revision`, `request` and `commit_order` come from the service. The span name stays bounded; neither an order ID nor a raw URL becomes a new operation name. Configure consistent service/environment identity and correlate logs with trace and span IDs. Retain sensitive business identifiers only where access and retention rules permit them.

A Collector can batch, redact and route telemetry, but it is another resource-limited service. Exporter failure should not indefinitely block checkout. Bound queues and application overhead, and make dropped evidence observable.

## Preserve the path through asynchronous work

A trace ends prematurely if context stays inside the publisher process. The transport below is application-specific; OpenTelemetry supplies the propagation operations:

```python
from opentelemetry.propagate import inject, extract

headers = {}
with tracer.start_as_current_span("checkout.publish"):
    inject(headers)
    publish(headers=headers, body=job)

parent = extract(received_message.headers)
with tracer.start_as_current_span("checkout.process", context=parent):
    process(received_message.body)
```

Publisher and consumer are separate processes with compatible propagators and SDK configuration. Injection copies the current context into the carrier; extraction reconstructs the receiving context. For batches or fan-in, span links may represent causality better than choosing one artificial parent.

Distinguish publish latency, queue wait, processing, retries and terminal outcome. Attempts multiplying across browser, gateway and worker reveal retry amplification, not necessarily more customers. Keep credentials and authorization decisions out of baggage; propagated context is untrusted metadata at an external boundary.

## Buy useful evidence within a budget

A metric's label combinations multiply. Twenty routes × five status classes × three regions already permit 300 combinations before adding instance labels. Adding an order ID turns a bounded metric into a stream proportional to traffic.

Keep detailed identifiers in protected logs/traces when needed. Redact before export where possible. Head sampling limits cost early but cannot know a later failure; tail sampling can retain selected completed traces at the cost of buffering and routing. It cannot restore spans discarded upstream.

Use reliable aggregate counters for impact rather than deriving failure rates from error-biased trace samples. Budget ingestion, retention and query cost against the decisions the evidence must support.
