# Deprecating features without abandoning users

## Low usage is a lead, not a removal decision

Deprecation exists because keeping every interface forever accumulates maintenance, security, and product complexity. Removing a rarely clicked control can still break a critical annual workflow, an integration, or a contractual promise. The relevant question is which job depends on the capability and what happens when it disappears.

Separate deprecation, migration, sunset, and deletion. Deprecation announces that consumers should move. Migration provides a viable route. Sunset ends availability under a communicated policy. Deletion removes the old implementation and data after recovery, retention, and access obligations are resolved.

A senior engineer should expose hidden dependents, estimate migration cost, design compatibility, and define evidence that removal is safe enough. Product and customer-facing owners must help decide the promise made to affected users.

## Inventory actual dependents and measure at the authority

Count unique active consumers, affected workflows, versions, and recent outcomes. Browser analytics misses automation, blocked trackers, and clients that call an API directly. Request logs can miss long-lived scheduled jobs that have not run during the observation window.

This PostgreSQL example assumes an authoritative API usage ledger, one row per request. It finds the latest observed use of a retiring version:

```sql
SELECT account_id, client_version,
       max(occurred_at) AS last_seen,
       count(*) AS requests,
       count(*) FILTER (WHERE status_code >= 200 AND status_code < 300)
         AS successful_requests
FROM api_usage
WHERE route_template = '/v1/export'
  AND occurred_at >= $1 AND occurred_at < $2
GROUP BY account_id, client_version
ORDER BY last_seen DESC;
```

Choose an interval that covers the feature's usage cycle. A zero result can mean no use, lost collection, sampling, or the wrong route tag. Reconcile against registered integrations, support cases, contracts, and customer interviews. Decide which identifiers may be accessed by the migration team and retain only the evidence needed.

Segment by migration difficulty, not only account size. An older mobile client, an unavailable integration maintainer, or a regulated approval workflow can change the feasible support window.

## Offer an equivalent outcome and a migration contract

The replacement need not reproduce every implementation detail, but it must cover the supported job. Compare semantics, authorization, ordering, pagination, error behavior, quotas, exports, and data portability. A renamed endpoint with different retry semantics is a behavior migration.

Describe the supported path and its limits explicitly:

```yaml
retiring: export API v1
replacement: export API v2
incompatible_change: submission returns a job; completion is asynchronous
migration:
  - persist the operation ID and poll the job endpoint
  - keep the same idempotency key when retrying submission
  - consume terminal failure states, not only HTTP acceptance
support_owner: integrations-team
sunset_gate: notified owners have a supported path and remaining exceptions are decided
```

An adapter can preserve the old contract while clients migrate, but it adds an owner and end date. Shadow reads can compare results without changing the response; shadow writes must be side-effect-free or isolated. Sending real payments through both paths is not a safe parity check.

Test migrations on representative schemas and clients. For data changes, use expand–migrate–contract: add the compatible structure, backfill with checkpoints, switch reads/writes under a plan, verify, then remove the old structure. A flag does not make an irreversible data deletion reversible.

## Announce dates where consumers can discover them

Use the surfaces the affected population actually sees: API metadata, product messages, integration-owner communication, and account-specific support. A changelog is useful but rarely sufficient for a critical dependency. Distinguish “deprecated” from “will stop working on this date.”

For an HTTP API, these illustrative response headers announce a deprecation instant and an internal migration document:

```http
HTTP/1.1 200 OK
Deprecation: @1688169599
Link: </migration/export-v2>; rel="deprecation"; type="text/html"
Content-Type: application/json
```

`Deprecation` uses an `@`-prefixed Unix timestamp, not a quoted HTTP date. The example timestamp is historical and does not set this site's schedule. If a definite shutdown date is agreed, the separate `Sunset` header uses HTTP-date syntax. Clients still need a documented policy; neither header performs migration or authorizes breaking a promise.

Assign exception owners and expiry dates. Avoid indefinite private extensions that create a permanent, untested product variant.

## Make the sunset gate observable and reversible where possible

Before removal, verify that notified consumers have migrated or have an explicit decision, the replacement handles their workload, support has a recovery path, and remaining use is understood. A planned reversible restriction for a small notified cohort can reveal dependents only when it is authorized and does not threaten data or critical operations.

When disabling access, return an actionable, documented response rather than a generic server error. Keep operation history and supported export paths available for the agreed window. Monitor calls to the retired endpoint, migration errors, support contacts, and new-path correctness after the switch.

Rollback may mean restoring an adapter or access, not restoring an old database image over newer customer writes. Name the last point at which each part of the migration is reversible.

## Finish the removal and carry forward the decision

Delete unused code, flags, jobs, alerts, dashboards, documentation, and access grants after the recovery window. Apply the data retention decision to backups, derived stores, and vendor exports where relevant; disabling the UI is not a data deletion procedure.

Record why the capability was retired, who depended on it, what evidence supported removal, and which compatibility boundary remains. This prevents a future team from reintroducing the same feature without understanding the tradeoff, or keeping an obsolete adapter because no one knows whether it is still required.
