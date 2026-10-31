# Incident triage: scope, stabilize, and communicate

## Why triage comes before a complete explanation

Production failures rarely arrive with a trustworthy cause attached. An alert says latency increased; support says exports never finish; a deployment happened nearby. Triage turns those observations into an impact statement and a safe next action. Waiting for certainty can extend the outage, while acting on the first plausible explanation can make recovery harder.

A senior engineer is expected to establish what is failing, who is affected, whether damage is accumulating, and which intervention has the best recovery-to-risk tradeoff. Incident command becomes a coordination role when several teams are involved; it does not require the commander to debug every service personally.

Separate three statements in the incident record: **observed**, **suspected**, and **decided**. “Workers stopped completing jobs” is an observation. “The new serializer is blocking them” is a hypothesis. “Pause new exports while checking that hypothesis” is a decision with a reason and an owner.

## Define the affected population and the clock

Start at the user-visible operation rather than the loudest infrastructure graph. A request accepted with `202` is not a completed export. A low global error rate can hide a complete outage for one tenant, browser version, or region.

This example incident record is a working document, updated as evidence changes:

```yaml
incident: INC-142
observed_since_utc: "2026-10-29T08:14:00Z"
impact: EU export jobs accepted but not completing
scope: new and queued exports in eu-west; other regions unconfirmed
integrity_risk: retries may duplicate delivery notifications
roles:
  commander: platform-oncall
  investigation: export-owner
  communications: support-lead
mitigation: pause new EU exports; keep durable queue contents
next_update_utc: "2026-10-29T08:30:00Z"
```

The first confirmed failure is not necessarily the start of the incident. Preserve that uncertainty, use a consistent timezone, and record deployment revisions and configuration versions. Update the scope when new evidence contradicts the initial boundary. Do not turn an incomplete impact estimate into a precise customer count.

## Gather evidence that separates competing causes

Compare the incident against the last healthy interval and an unaffected cohort. Did accepted work increase, completion decrease, or both? Did queue age rise before CPU? Did only one release revision fail? A before/after change across all traffic can be caused by an upstream workload shift.

Assume `export_jobs` durably records acceptance and terminal states. This read-only PostgreSQL query distinguishes an empty queue from accumulated unfinished work:

```sql
SELECT region, state, count(*) AS jobs,
       min(accepted_at) AS oldest_accepted
FROM export_jobs
WHERE accepted_at >= $1 AND accepted_at < $2
GROUP BY region, state
ORDER BY region, state;
```

`$1` and `$2` bound the same incident interval in every comparison. Inspect older unfinished work separately; filtering to the incident interval cannot establish the total backlog. If jobs disappear from the table after processing, use a durable completion ledger instead of treating absence as success.

Inspect the change timeline: code, flags, configuration, schema, credentials, dependency behavior, and traffic composition. A correlated deployment is a useful candidate, not proof. Preserve representative request IDs and error evidence before restarting processes that hold the only diagnostic state.

## Choose a mitigation against the failure mechanism

A mitigation reduces harm while investigation continues. Judge it by expected effect, time to apply, blast radius, reversibility, and how recovery will be verified.

| Evidence                                     | Candidate action                           | Check before acting                                             |
| -------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| Only the new binary fails                    | Roll back compatible code                  | Can the old binary read data written by the new one?            |
| Optional enrichment consumes the worker pool | Disable enrichment through a flag          | Does the degraded result still satisfy the product promise?     |
| Retries overwhelm a dependency               | Cap retries and shed new work              | Which operations must remain accepted or reconciled?            |
| A worker repeatedly corrupts one input       | Quarantine that job and continue safe work | Can the job be retained and replayed without duplicate effects? |
| Active incorrect writes                      | Stop the write path                        | What dependent readers or workflows must also be paused?        |

Restarting everything may temporarily clear symptoms while erasing evidence or triggering another retry storm. Scaling helps a capacity shortage; it can worsen database saturation or lock contention. A rollback cannot reverse an external charge, sent email, or destructive migration.

Assign each intervention one owner and record its start time. Prefer one controlled change at a time when possible so that outcomes remain interpretable. A high-severity event may require several simultaneous mitigations; document that the evidence will be harder to disentangle.

## Communicate decisions, impact, and uncertainty

Responders need the current working hypothesis and next check. Customers need the affected capability, available workaround, and next update. Leadership needs impact, risk, and decisions requiring coordination. None of these audiences benefits from a stream of unfiltered log messages.

A useful update is short: “EU exports remain delayed. New requests are paused; existing jobs are retained. We disabled the optional enrichment step and are checking completion and duplicate delivery. Next update at 08:30 UTC.” State a recovery estimate only when evidence supports it.

Escalate early when the affected boundary lacks an owner, a security or integrity issue is plausible, or the proposed recovery crosses team authority. Record customer remediation separately from service restoration. Closing the incident while accepted work remains stranded leaves the most important part unfinished.

## Verify that the mitigation improved the experience

Define success before applying the change: new exports complete within the agreed deadline, the oldest queue age falls, duplicate deliveries stay at zero, and the affected cohort sees successful results. Check at least one independent source when the telemetry pipeline may be impaired.

A single healthy request is a canary, not proof that backlog and edge cases recovered. Observe enough relevant traffic, keep an explicit owner for reconciliation, and retain a way to stop the recovery if error rates or integrity checks worsen. These checks distinguish a plausible intervention from a verified mitigation.
