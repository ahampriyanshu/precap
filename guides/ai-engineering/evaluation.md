# Evaluation that supports engineering decisions

An AI system can produce many plausible outputs for the same input. Conventional exact-output tests cover only part of that behavior. Evaluation adds task-specific measurements for quality, uncertainty, effects, and variability so a team can decide whether a change improves the deployed outcome.

The unit of evaluation is the complete task under a defined environment, not merely the final text. A convincing answer that used another tenant's document or duplicated a payment must fail.

## Define outcomes and failure severity first

Write the task contract before assembling a large benchmark. Specify what must be true, what may vary, what is forbidden, and what a correct abstention looks like. Separate critical boundaries from ordinary quality dimensions; an average cannot offset a disclosure or unauthorized mutation.

```yaml
case_id: export-setting-017
group: export-policy-family
input_revision: question-3
fixture:
  identity: tenant-a-reader
  source_snapshot: docs-r8
  index_revision: search-r12
expected:
  outcome: supported-answer
  permitted_sources: [export-policy-v4]
  forbidden_effects: [cross-tenant-read, external-mutation]
grader_revision: evidence-rubric-5
```

This fixture uses illustrative identifiers. Preserve enough source and environment state to replay the case; today's documentation is not the same fixture as last month's. Keep related documents, paraphrases, users, and repositories together across splits to reduce leakage. Maintain a development set, a less frequently inspected holdout, and incident regressions.

## Use component metrics to diagnose, outcome metrics to release

Retrieval recall measures whether relevant evidence is in a candidate set. MRR emphasizes the rank of the first relevant result. nDCG can account for graded relevance across positions. They answer different questions from whether the generated answer is supported and useful.

```python
relevant = {"policy", "exception"}
ranking = ["overview", "policy", "example", "exception"]
k = 3
recall_at_k = len(relevant.intersection(ranking[:k])) / len(relevant)
first_relevant = next((rank for rank, item in enumerate(ranking, 1)
                       if item in relevant), None)
reciprocal_rank = 0 if first_relevant is None else 1 / first_relevant
print(recall_at_k, reciprocal_rank)
assert recall_at_k == 0.5 and reciprocal_rank == 0.5
```

This standalone example shows why finding one useful result can still leave half the required evidence missing. For classification, inspect per-class precision/recall and confusion matrices. For extraction, distinguish exact normalized fields from semantically acceptable phrasing. For agents, verify final external state, duplicate effects, forbidden operations, and useful completion time.

A release decision combines end-to-end accepted outcomes with critical failure gates, latency, and cost. Component scores locate the problem but should not substitute for this contract.

## Graders need validation too

Use deterministic checks for schemas, amounts, resource scope, compilation, tests, and persisted state. Open-ended factual support and usefulness may need rubric-based human or model grading. Define separate dimensions such as support, coverage, uncertainty, and behavior before aggregating.

Model judges can favor verbosity, answer position, familiar wording, or their own model family. Randomize answer order for pairwise grading, blind irrelevant identity, use stable anchor examples, and calibrate against qualified human review. Inspect disagreements, not just aggregate agreement. A judge with 95% agreement on easy examples may fail exactly where the release decision is difficult.

Known-negative controls reveal broken graders: an answer citing an absent source, a duplicate write, a fabricated success, or a correct-looking explanation of the wrong tenant. Store grader version and evidence sufficient to reproduce its judgment. If a grader prompt changes, rerun the relevant comparisons rather than merging incomparable scores.

## Account for sample uncertainty

An observed rate estimates behavior on a sampled distribution. Report numerator, denominator, strata, and uncertainty. For independent Bernoulli trials, a Wilson interval is more informative than a raw percentage near zero or one.

```python
import math

def wilson(successes, total, z=1.96):
    if total <= 0:
        raise ValueError("positive sample size required")
    p = successes / total
    denominator = 1 + z*z/total
    center = (p + z*z/(2*total)) / denominator
    half = z * math.sqrt(p*(1-p)/total + z*z/(4*total*total)) / denominator
    return center - half, center + half

print(tuple(round(value, 3) for value in wilson(95, 100)))
assert wilson(95, 100)[0] < 0.95 < wilson(95, 100)[1]
```

The interval assumes an appropriate sampling model. Closely related paraphrases are not independent evidence of generalization. For clustered tasks, use cluster-aware resampling or report group-level results. A clean run of 100 cases cannot establish that a catastrophic event occurs less than once per million tasks.

With zero observed failures, the approximate “rule of three” gives an upper 95% failure-rate bound of `3/n` under independent trials. Zero failures in 300 trials therefore supports roughly an upper bound of 1%, not zero risk. Use targeted adversarial testing and enforced boundaries for rare critical failures rather than hoping an ordinary benchmark will sample them.

## Compare changes on paired cases

Run old and new versions on the same fixtures. Record wins, losses, ties, and critical regressions. Paired comparisons reduce noise from case difficulty and expose changes hidden by equal overall averages.

For stochastic outputs, repeat meaningful strata or tasks. “Pass at least once in five attempts” measures opportunity under multiple trials; it does not mean a user gets that success rate on one attempt. Conversely, requiring every run to pass measures robustness and can be useful for consequential workflows. State which quantity is being reported.

When testing many prompt/model variants, repeated selection can overfit a development benchmark. Keep a held-out decision set, predefine important metrics, and re-evaluate finalists rather than treating the best noisy score as a reliable gain.

## Evaluate changes outside the model call

Changes to chunking, retrieval filters, tool schemas, retries, context compaction, and serving quantization can alter outcomes even with unchanged weights. Include these versions in the evaluated system identity. Test timeout, cancellation, tool failure, process crash, and permission changes where the application can encounter them.

A useful regression record contains the input, environment snapshot, full relevant trace, expected invariant, and minimal reason for failure. Avoid retaining sensitive raw transcripts by default; store redacted fixtures with access-controlled originals only where policy permits.

Online experiments then test whether offline gains survive real traffic and user behavior. Monitor exposure, task mix, guardrails, latency, and abandonment. An increase in thumbs-up can reflect novelty or presentation while task completion worsens. Match the metric to the product outcome and use the same critical boundaries in offline and online gates.
