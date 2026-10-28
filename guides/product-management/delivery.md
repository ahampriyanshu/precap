# Ship, measure, and make the next call

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

Use authoritative completion state for the outcome. Keep eligibility, outcome windows, and event semantics consistent across variants. A change in when events fire can create apparent product movement. Microsoft's [metric interpretation paper](https://www.microsoft.com/en-us/research/wp-content/uploads/2020/08/2017-08-KDDMetricInterpretationPitfalls.pdf) documents population and denominator failures of this kind.

Inspect predeclared segments alongside the aggregate. Improved results for simple integrations can conceal harm to restricted-permission accounts. Keep diagnostic exploration distinct from the evidence used for the primary decision.

## Separate safe exposure from credible inference

A staged rollout limits harm; randomization supports causal inference. Assign at the level where the experience is shared. Account-level assignment prevents teammates from seeing incompatible setup flows.

This standard-library Python example makes a stable assignment from an immutable experiment ID and account ID:

```python
from hashlib import sha256

def variant(account_id: str, experiment_id: str) -> str:
    key = f"{experiment_id}:{account_id}".encode()
    bucket = int.from_bytes(sha256(key).digest()[:8], "big") % 10_000
    return "treatment" if bucket < 1_000 else "control"

print(variant("acct-42", "permission-recovery-v1") ==
      variant("acct-42", "permission-recovery-v1"))  # True
```

The threshold allocates approximately 10% to treatment over many distinct accounts. Keep identifiers and the threshold fixed for an analysis cohort; changing the threshold reassigns accounts. This is assignment plumbing, not a security boundary or evidence that the sample is sufficient. Check allocation ratios and unequal telemetry loss before interpreting results.

Predeclare the minimum useful effect, analysis method, and duration. Account-level correlation, baseline variance, delayed outcomes, and usage cycles affect power. Monitor continuously for harm; repeated significance checks need an appropriate sequential method. Microsoft's [experimentation guidance](https://www.microsoft.com/en-us/research/articles/patterns-of-trustworthy-experimentation-during-experiment-stage/) covers these interpretation risks. Sparse traffic may justify qualitative evidence or a smaller reversible commitment, with narrower claims.

## Make the next decision and retire the temporary work

Expand when benefit matters, guardrails hold, and the evidence applies to the next population. Iterate when a specific obstacle remains. Stop when benefit is too small for its cost or harm outweighs it. Inconclusive evidence does not establish equivalence.

Record confidence and the cost of waiting for slower outcomes. Remove stale flags, finish migrations, and assign ongoing ownership after the decision. For platform work, measure adoption, integration effort, and reliability directly; connect those to enabled product bets without claiming business outcomes the evidence cannot support.
