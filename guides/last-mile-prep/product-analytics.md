# Product analytics: PostHog, Pendo, and GA4

## Define the decision and the unit being counted

Product analytics makes customer behavior observable across journeys and releases. A page view says a page was observed; it does not prove the user completed the job. A senior engineer should be able to turn a product question into an event contract, identify where the result becomes authoritative, and explain the limits of the measurement.

For an asynchronous import, distinguish intent, acceptance, completion, and useful follow-up usage. Count accounts when the job is shared by an account; count independent users when the experience and decision are actually personal. Define the outcome window before drawing the funnel.

| Question                         | Evidence that can answer it                                                |
| -------------------------------- | -------------------------------------------------------------------------- |
| Did the user reach the new flow? | Exposure recorded when the relevant UI or behavior was actually reached    |
| Was the operation accepted?      | Authoritative acceptance event with a stable operation ID                  |
| Did it complete correctly?       | Durable terminal outcome, including failures and retries                   |
| Did it create continuing value?  | A declared retention or repeated useful-work outcome after a mature window |

A drop between two stages identifies a boundary to investigate, not a reason to redesign the interface.

## Understand the role of PostHog, Pendo, and GA4

PostHog supports event-based product analysis and connects experiments to feature flags and captured outcomes. Pendo combines visitor/account product usage, tagged pages/features, and explicit Track Events. GA4 uses automatically collected, enhanced-measurement, recommended, and custom events for web/app analysis, including acquisition and conversion journeys.

Prefer one clear owner and contract for each question instead of expecting identical counts across products. Their identity, session, filtering, retention, and reporting semantics can differ. Browser blockers, consent, and delayed ingestion can also change the observed population.

Pendo's page/feature tagging is useful for interface interaction. Explicit Track Events are appropriate for an application-defined action that is not adequately represented by a click. In GA4, use a suitable recommended event when it matches the meaning; create a custom event when it does not. A custom parameter may need reporting configuration before it appears in the intended report.

## Write an event contract before writing the SDK call

Start from meaning, producer, identity, and deduplication. The same event name must not mean “button clicked” in one release and “job completed” in the next.

This illustrative contract defines a server-owned outcome. It describes the team's pipeline, not a universal vendor payload:

```yaml
event: import_completed
version: 1
producer: import-worker-after-durable-commit
unit: operation
required:
  event_id: stable outcome identifier, reused during delivery retries
  operation_id: stable import identifier
  account_id: approved opaque account identifier
  occurred_at: completion time in UTC
  integration: bounded connector name
  workflow_version: implementation that completed the job
deduplicate_by: event_id
```

Persist the completion and an outbox event in the same transaction when they share a database. Deliver the outbox with retry and deduplicate downstream. This closes the failure window between a committed result and a best-effort analytics call; it does not make delivery exactly once by itself.

Avoid firing completion from a render effect, polling response, or thank-you page. Those paths can repeat or never run. An analytics event is evidence of a committed result only if the producer and pipeline preserve that contract.

## Treat SDK calls as adapters, not event definitions

A browser-owned interaction can be sent after the SDK is initialized and the applicable capture decision is made. These are **alternative integration fragments**, not instructions to send the same interaction to every destination:

```javascript
// PostHog browser SDK already initialized for this application.
posthog.capture("import_help_opened", {
  integration: "connector_a",
  entry_point: "permission_error",
});

// Alternative GA4 adapter, after the Google tag has been initialized.
gtag("event", "import_help_opened", {
  integration: "connector_a",
  entry_point: "permission_error",
});
```

Keep the shared meaning stable even if SDK parameters differ. Neither call proves an import completed. Browser adapters can be blocked, retried, or lost on navigation; important business outcomes need a server-owned path. Keep private ingestion credentials on the server and choose capture behavior before sending data.

For a Pendo Track Event, use the initialized SDK or server API with the required visitor/account context. Server-originated events must map to the same approved identities as the web experience. Define the mapping in the application contract rather than inferring an account from a display name.

## Preserve identity without merging unrelated users

Distinguish anonymous visitor, authenticated user, account, session, and operation IDs. One person can switch accounts, and a shared device can serve several people. An identify/reset lifecycle must follow login, logout, and tenant switching so that one customer's activity does not become another's history.

Send approved opaque identifiers rather than email addresses or raw URLs containing secrets. An opaque identifier can still be personal or sensitive data; access, retention, consent/capture policy, and deletion procedures still apply. Scope account analytics to the intended unit, with stable definitions for bots, staff traffic, and test environments.

Record event time and ingestion time separately when the pipeline supports them. Offline and retried events can arrive out of order, so “received next” is not necessarily “happened next.”

## Validate a funnel against authoritative outcomes

A useful funnel uses one consistent population and observation window. This PostgreSQL example measures seven-day import completion among newly created accounts using a durable import table:

```sql
WITH cohort AS (
  SELECT id, created_at
  FROM accounts
  WHERE created_at >= $1 AND created_at < $2
    AND created_at + INTERVAL '7 days' <= $3
)
SELECT count(*) AS eligible_accounts,
       count(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM imports i
         WHERE i.account_id = c.id AND i.status = 'succeeded'
           AND i.completed_at >= c.created_at
           AND i.completed_at < c.created_at + INTERVAL '7 days'
       )) AS completed_within_seven_days
FROM cohort c;
```

`$3` is a fixed analysis timestamp. `EXISTS` counts each account once, and the maturity condition avoids penalizing accounts whose window is still open. Compare this result with the product dashboard under the same cohort rules. Investigate a discrepancy as a measurement issue before declaring a product regression.

Validate missing and duplicate events, schema drift, identity resets, and release-to-release changes in trigger placement. Reconcile samples of accepted and completed operations end to end. Querying an event name successfully is only the first instrumentation check.

## Use the evidence at the right strength

Retention and funnels show patterns. A well-designed randomized experiment can support a causal claim under its assumptions; a before/after graph can be confounded by seasonality, acquisition mix, or a concurrent launch. Replays and support evidence explain mechanisms but do not quantify prevalence on their own.

Agree on the action a metric could change: expand a rollout, investigate a blocked cohort, revise onboarding, or retire an unused path. Keep instrumentation that supports those decisions, and remove captures whose operational and privacy cost exceeds their value. The goal is a trustworthy decision, not the largest event catalog.
