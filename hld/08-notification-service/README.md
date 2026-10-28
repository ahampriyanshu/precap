# Notification Service

## The problem

A notification service turns business events into messages sent through email, SMS, or push providers. Design one for order confirmations and delivery updates. The business operation should not wait for a provider, but a committed order must not lose its notification merely because a worker restarts. Users also expect preferences and unsubscribe rules to be respected.

Assume five million events per day, with two channel deliveries per event on average. Ten million attempts per day average about 116 attempts per second. A tenfold peak needs roughly 1,160 attempts per second before retries. A provider limit of 500 requests per second means backlog will grow during that peak; adding workers alone cannot fix it. We need queueing, channel-specific limits, and a stated delay objective, such as 99% of ordinary confirmations attempted within one minute.

## Naive approach

Calling a provider directly after committing an order creates an unrecoverable gap unless something durably records the pending work:

```pseudocode
commit_order(order_id)
# Process can crash here: no durable pending notification exists.
provider.send_confirmation(order_id)
# Process can also crash here: acceptance is unknown locally.
mark_sent(order_id)
```

Calling the provider first reverses the problem: a confirmation can escape for a transaction that later rolls back. A local sent flag does not reveal whether a timed-out remote call was accepted.

## Where the naive approach breaks

The hardest result is a timeout. A provider may have accepted a message before the connection dropped. Retrying may send it twice; refusing to retry may lose it. A local `sent` flag cannot reveal an outcome that the service never observed.

A provider outage can also cause a retry storm. Immediate retries compete with new work, repeatedly hit the same rate limit, and increase user-visible delay. If all errors share one policy, a permanently invalid address can consume as much capacity as a temporary outage. Multiple workers can further duplicate attempts unless claiming a job has an ownership boundary.

## A better design

Commit the business change and its event together, then deliver asynchronously:

```text
Business API -> Business DB + Outbox -> Relay -> Delivery queue -> Worker -> Provider
```

For example, the order service’s relational transaction can create the order and its outbox event as one durable unit:

```sql
BEGIN;
INSERT INTO orders (order_id, status)
VALUES ($1, 'confirmed');
INSERT INTO outbox (event_id, order_id, event_type)
VALUES ($2, $1, 'order.confirmed');
COMMIT;
```

This fragment omits schemas and the surrounding order validation; order and event identities have unique constraints. On any statement failure, the application rolls back. A retry of an existing order must validate and return its saved outcome rather than create a fresh event. No provider call occurs inside this transaction. A relay publishes committed outbox rows with stable event IDs, and consumers deduplicate because relay publication may repeat. [AWS outbox guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) describes this duplicate boundary.

Notification intake resolves preferences, renders approved templates, and inserts delivery jobs unique on `(event_id, channel, recipient)`. A row stores state, attempt, due time, lease token, and provider identifier. The API distinguishes accepted work, attempted delivery, and provider acceptance; acceptance is not proof of arrival or reading.

Workers atomically claim due jobs, obtain fresh attempt tokens, enforce provider-specific quotas, and pass a stable logical delivery key where the provider supports idempotency. Retry transient and unknown outcomes with backoff and jitter; terminate invalid addresses and exhausted budgets. Adding workers cannot exceed provider capacity safely, so backlog age is a first-class delay signal.

If attempt 1 reaches the provider and crashes before saving acceptance, attempt 2 uses the same logical key but new ownership token. Provider idempotency may suppress duplicate acceptance. Without it, duplicate messages remain possible. Local fencing rejects stale state updates but cannot undo a prior remote send. Reconciliation should retain unknown outcomes rather than relabeling every timeout as a definite failure.

Separate urgent confirmations from bulk campaigns so a large campaign cannot starve a password reset. Recheck preferences at dispatch, authenticate provider callbacks, and protect contact data. Monitor oldest pending age, unknown outcomes, provider throttling, permanent failures, duplicate suppression, and terminal-job backlog.

## Real-world usage

Order confirmations and delivery updates need recoverable asynchronous work. Retry budgets trade timeliness against provider spend and duplicate risk. Keep enough event history to explain suppression and retries without unnecessarily retaining message bodies or secrets.

## Practice

### Design brief

Design asynchronous order confirmations and delivery updates for five million events daily, averaging two channel deliveries each. Peak demand approaches 1,160 attempts per second before retries, while one provider allows 500 requests per second. Aim for 99% of ordinary confirmations to be attempted within one minute. Define acceptance, attempted delivery, and provider confirmation separately, including preference and unsubscribe behavior.

### Draw and explain

In Excalidraw, label the business transaction boundary, durable notification ownership, channel scheduling, provider boundaries, and callback ingress. Trace an order commit to an eventual delivery attempt. Show event identity, delivery identity, attempt ownership, status transitions, and where current preferences are checked. Estimate backlog growth during the peak and explain how draining it affects the delay objective.

### Stress the design

The provider accepts a message, but the worker times out before recording the outcome. Show what a replacement worker knows and the duplicate risk with and without provider idempotency. Separately, throttle a provider during a sustained burst. Explain how retries, new confirmations, and permanent address failures compete for capacity.

### Review your design

Check the business-event handoff, duplicate intake, stale worker results, and authenticated callbacks. Compare retry budgets and provider failover against duplicate delivery and spend. Explain isolation between urgent and bulk work, privacy of contact data, and operational recovery for exhausted jobs. Choose signals for oldest pending age, unknown outcomes, throttling, and suppression.
