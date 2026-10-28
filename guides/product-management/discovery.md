# Choose the problem before the solution

## Frame the decision around an unfinished job

“Redesign onboarding” names a solution. “New self-service accounts cannot complete their first import” names a customer problem that engineering can investigate. Establish who is blocked, the consequence, the frequency, and the workaround. A funnel drop identifies a boundary to inspect; it does not establish the cause.

Trace a few failed attempts through the system. Permission errors, incompatible source schemas, slow workers, and confusing recovery can produce the same abandonment event. A new wizard helps only some of them. Combine support cases and observed workflows with backend evidence before choosing an investment.

Product owns prioritization and customer outcomes within the team's decision model; engineering supplies feasibility, system constraints, and delivery judgment. Staff-level contribution often means exposing a shared failure across several teams, then negotiating a specific owner and outcome.

## Establish a baseline that survives segmentation

Choose the unit, eligible population, and outcome window before computing a rate. For account activation, counting imports rewards accounts that import repeatedly. Counting newly created accounts before their outcome window expires penalizes the newest cohort.

This PostgreSQL example measures accounts with a successful import within seven days, by integration. `$1` and `$2` bound account creation; `$3` is a fixed analysis timestamp. The schema assumes immutable account creation times and authoritative import completion records.

```sql
WITH cohort AS (
  SELECT id, integration, created_at
  FROM accounts
  WHERE created_at >= $1 AND created_at < $2
    AND created_at + INTERVAL '7 days' <= $3
)
SELECT c.integration, COUNT(*) AS eligible_accounts,
       AVG(EXISTS (
         SELECT 1 FROM imports i
         WHERE i.account_id = c.id AND i.status = 'succeeded'
           AND i.completed_at >= c.created_at
           AND i.completed_at < c.created_at + INTERVAL '7 days'
       )::int) AS activation_rate
FROM cohort c
GROUP BY c.integration;
```

`EXISTS` contributes one outcome per account regardless of retries or import count. The maturity filter prevents incomplete observation windows. This still excludes abandoned accounts never created in the database; account activation is not a measure of the entire acquisition funnel. Check missing telemetry and segment definitions before treating a difference as product behavior.

Choose segments that can change the decision: assisted versus self-service setup, permission model, or integration. Google's [HEART framework](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/) connects goals to observable signals; page views alone rarely establish useful work.

## Compare investments under real constraints

Compare fixing permission recovery, broadening integration support, buying a connector, and deferring the work against the current strategy. Include migration, accessibility, operational ownership, and the work displaced by the choice. Make fixed constraints distinguishable from preferences.

RICE—`reach × impact × confidence / effort`—can expose assumptions when populations, periods, and whole-team effort are comparable. [Intercom's original description](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers) treats its inputs as estimates. Try plausible ranges: if a small confidence change reverses the ranking, the next investment may be evidence. Mandatory risk reduction and strategic dependencies need explicit judgment outside that score.

## Leave a decision the team can execute

Record the decision as a short contract. This YAML is an example team artifact, not a schema required by a product tool:

```yaml
population: new self-service accounts using connector A
outcome: first successful import within seven days
bet: permission recovery removes the dominant setup blocker
owners: {product: activation, engineering: integrations}
first_slice: diagnose denied scope and resume the same import
unknown: how often customers can grant the missing permission
revisit_when: permissions are fixed but imports still fail
```

The unknown determines the first slice: validate recovery with affected customers before rebuilding onboarding. Add the baseline, decision date, alternatives, and acceptable guardrails when making a real commitment. The artifact keeps later disagreement tied to evidence and gives adjacent teams a boundary they can implement.
