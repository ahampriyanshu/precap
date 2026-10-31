# A/B tests and product evidence

## Ship a complete slice of the intended outcome

A useful slice helps the chosen population finish an import, including feedback, durable state, and recovery. A new setup screen without a reliable import path cannot test that bet. Reduce supported cases to make the slice small; preserve the promises made to exposed accounts.

Agree on asynchronous states, API compatibility, rollout control, and operational ownership across frontend and backend. Make the critical dependency visible: a shared permissions API can determine the delivery date more than the interface work.

Write the release and measurement contract before exposure. This YAML illustrates a team agreement; its thresholds need a measured baseline and an owner who can stop rollout.

```yaml
unit: account
population: new self-service accounts using connector A
primary:
  outcome: first successful import within seven days
  denominator: eligible assigned accounts with a mature window
exposure: permission-recovery screen actually rendered
guardrails:
  data_correctness: no lost or duplicated imported records
  reliability: import failure rate and p95 completion time
stop_owner: integrations on-call
```

Assignment and exposure answer different questions. Analyze assigned accounts for the primary intention-to-treat comparison; exposure helps diagnose whether the feature was reached. Comparing only exposed users can select different populations in each variant. Define correctness checks and numerical reliability limits before launch.

## Measure the outcome without rewarding a proxy

Permission completion is a diagnostic signal. A successful import is a nearer outcome; retained useful usage arrives later. A click named “activation” does not validate any of these relationships. Removing a step can improve a funnel while increasing incomplete or incorrect imports.

Use authoritative completion state for the outcome. Keep eligibility, outcome windows, and event semantics consistent across variants. A change in when events fire can create apparent product movement.

Inspect predeclared segments alongside the aggregate. Improved results for simple integrations can conceal harm to restricted-permission accounts. Keep diagnostic exploration distinct from the evidence used for the primary decision.

## Separate safe exposure from credible inference

![An experiment compares control and treatment retention while checking an error-rate guardrail before expansion.](/diagrams/last-mile-experiment.svg)

A staged rollout limits harm; randomization supports causal inference. Assign at the level where the experience is shared. Account-level assignment prevents teammates from seeing incompatible setup flows.

Persist assignment at the chosen unit with an immutable experiment and analysis-cohort identity. A release percentage may expand over time; an analysis cohort needs a fixed assignment policy. Exposure records diagnose whether assigned accounts reached the experience, while the primary comparison remains tied to the predeclared eligible assigned population.

Predeclare the minimum useful effect, analysis method, and duration. Account-level correlation, baseline variance, delayed outcomes, and usage cycles affect power. Monitor continuously for harm; repeated significance checks need an appropriate sequential method. Sparse traffic may justify qualitative evidence or a smaller reversible commitment, with narrower claims.

## Check allocation and quantify the effect

Check sample-ratio mismatch before interpreting the metric. A planned 50/50 assignment that becomes 70/30 among eligible accounts can indicate a bucketing, eligibility, or logging defect. Compare assignment and ingestion independently; a correct assignment service does not prove both variants' outcome events arrive equally.

Report absolute effect alongside relative uplift. This runnable example uses an approximate fixed-horizon interval for two large independent binomial samples:

```python
from math import sqrt

control_n, control_success = 50_000, 10_000
treatment_n, treatment_success = 50_000, 11_000
p0 = control_success / control_n
p1 = treatment_success / treatment_n
effect = p1 - p0
se = sqrt(p0 * (1 - p0) / control_n + p1 * (1 - p1) / treatment_n)
print(f"absolute effect: {100 * effect:.1f} percentage points")
print(f"relative uplift: {100 * effect / p0:.1f}%")
print(f"approximate 95% interval: {100 * (effect - 1.96 * se):.2f}"
      f" to {100 * (effect + 1.96 * se):.2f} percentage points")
```

The observed effect is 2.0 percentage points, or 10.0% relative uplift; the approximate interval is 1.50 to 2.50 percentage points. This calculation assumes one independent outcome per unit, sufficiently large counts, and a fixed analysis plan. Repeated peeking, clustered users, interference, rare outcomes, or choosing the best of many metrics require a method that handles those conditions. Use the agreed statistical analysis rather than treating this fragment as an experiment platform.

Define a minimum useful effect against engineering and product cost, not only statistical detectability. A precise tiny improvement may not pay for extra latency, complexity, or support burden. Conversely, an inconclusive result can justify another bounded learning step without claiming equivalence.

## Make the next decision and retire the temporary work

Expand when benefit matters, guardrails hold, and the evidence applies to the next population. Iterate when a specific obstacle remains. Stop when benefit is too small for its cost or harm outweighs it. Inconclusive evidence does not establish equivalence.

Record confidence and the cost of waiting for slower outcomes. Remove stale flags, finish migrations, and assign ongoing ownership after the decision. For platform work, measure adoption, integration effort, and reliability directly; connect those to enabled product bets without claiming business outcomes the evidence cannot support.
