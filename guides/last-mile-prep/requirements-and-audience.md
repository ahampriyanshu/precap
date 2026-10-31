# Requirements, audience, and engineering judgment

## Translate the request into a problem and a decision

Product judgment at senior level means understanding the job the system serves, exposing missing assumptions, and choosing an implementation that can test or fulfill the promise. It does not require pretending to own every commercial decision. Product, engineering, design, support, and operations bring different evidence and authority.

“Build a bulk export button” is a solution request. Clarify who needs the export, what they do with it, how often they need it, the current workaround, and the consequence of failure. The answer may require a downloadable file, a scheduled delivery, an integration, or a permission change. Producing the requested button quickly can still solve the wrong problem.

Separate observed behavior from interpretation. Support reports, workflow observation, production failures, and customer interviews can explain a blockage. A funnel identifies where people stop; it does not prove why they stop.

## Know the user, buyer, administrator, and operator

“The customer” may refer to several people with conflicting constraints. The analyst wants a useful dataset; the administrator controls access; the buyer cares about cost and risk; the on-call team owns recovery. For an API product, the integrator and the eventual end user can also be different audiences.

| Audience             | Question that can change the design                                           |
| -------------------- | ----------------------------------------------------------------------------- |
| Primary user         | What unfinished job are they trying to complete, and what is a usable result? |
| Administrator        | Who can enable, grant, revoke, or audit access?                               |
| Integrator           | What are the compatibility, retry, quota, and migration expectations?         |
| Buyer or sponsor     | Which outcome justifies the investment and ongoing cost?                      |
| Operator and support | How do they detect, explain, recover, and remediate a failure?                |

Segment by a difference that changes the decision: self-service versus assisted setup, permission model, accessibility needs, geography, integration, or workload size. Avoid inventing personas from job titles when their actual behavior and constraints are unknown.

Identify whose evidence is missing. A feature optimized for the administrator can make the end user's frequent task worse. A solution built only from the largest account's workflow can impose costs on the entire product.

## Gather functional requirements and system promises together

Walk through the normal flow, an interrupted flow, a repeated action, and a permission change. Ask what must remain true while the workflow runs. Requirements gathering is often discovering those invariants, not accumulating a longer list of screens.

For an export, the important questions include data scope, snapshot semantics, delivery, format, maximum size, freshness, asynchronous status, cancellation, and access after revocation. “Fast” is not testable until the population, percentile, workload, and deadline are defined.

This YAML is an illustrative requirement contract, not a universal product template:

```yaml
job: an account analyst exports the records they are allowed to inspect
population: interactive exports up to the agreed row/byte limit
invariants:
  - every delivered row belongs to the authorized account and scope
  - retries of one submission do not create duplicate billed jobs
  - the snapshot time is visible in the result metadata
service_promise:
  acceptance: request returns a durable operation ID
  completion: agreed percentile deadline at the declared peak load
failure: terminal error is visible; no misleading partial success
open_decision: access policy if authorization changes before download
```

Replace unresolved promises with agreed numbers before committing capacity or a delivery date. Keep the authorization question open until the owner decides whether access is rechecked at delivery, download, or both. Concealing that decision inside a cache implementation is a product and security bug.

## Convert ambiguity into acceptance examples

Examples reveal disagreement early. State the initial conditions, action, and observable result; include a boundary case that a normal demo misses. Distinguish a product requirement from one possible implementation.

```text
Given an authorized analyst submitted an export and received operation E
When the client retries the same submission with the same idempotency key
Then the service returns operation E and does not bill a second export

Given the analyst's export permission is revoked before download
When the analyst requests the completed file
Then the service applies the agreed revocation policy and records its decision
```

The second example deliberately requires an agreed policy; it does not silently invent one. Add cases for large workloads, duplicate completion notifications, expired download links, and a customer switching accounts in the browser. Use them to align product, API, data, and operational behavior before splitting frontend and backend tasks.

## Establish a useful outcome and a trustworthy baseline

Choose the unit, eligible population, and observation window before computing a rate. For shared-account activation, counting imports rewards accounts that import repeatedly; counting accounts whose seven-day window is still open penalizes the newest cohort.

Choose one primary outcome near the customer job, diagnostic signals that explain it, and guardrails against unacceptable side effects. “First usable export within the promised time” is more informative than button clicks. Separate correctness and reliability requirements from a hoped-for change in retention or revenue.

Use existing evidence to estimate the problem's frequency and cost, and label the missing evidence. A small, bounded first slice should resolve the most consequential uncertainty, such as whether customers can grant the required integration permission. It need not rebuild the entire workflow to learn that.

## Compare investments and make the tradeoff explicit

Compare repairing the current path, supporting a smaller population, buying a capability, rebuilding, and deferring. Include migration, accessibility, ongoing operations, support, and opportunity cost. A low implementation estimate that excludes backfill and deprecation is not the cost of the decision.

RICE—reach × impact × confidence / effort—can expose assumptions when populations, periods, and whole-team effort are comparable. Treat the inputs as estimates, try plausible ranges, and do not force mandatory risk reduction or strategic dependencies into a misleading score.

Capture the selected bet, owner, first complete slice, important rejected alternative, and revisit condition. Staff-level contribution often means recognizing that several teams share the same unresolved requirement and establishing a reusable boundary instead of shipping separate local fixes.

## Keep scope and learning connected during delivery

A complete slice lets the chosen population finish the job, including durable state, feedback, and recovery. Reduce the supported cases to keep it small while preserving the promises made to those who are exposed. A new setup screen without the reliable import path cannot validate an activation bet.

When new information appears, renegotiate scope, time, quality, or population explicitly. “We found a migration requirement” should change the decision record and plan. Silently dropping recovery or correctness to protect the original date makes the risk invisible until customers discover it.
