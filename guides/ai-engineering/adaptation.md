# Data, fine-tuning, and adaptation

Prompting supplies a task at request time; retrieval supplies changing evidence. Fine-tuning changes model parameters to improve a repeated behavior. It became attractive because a general pretrained model often needs a narrower output convention, domain skill, or cost profile. The central decision is whether the failure comes from missing information, weak behavior, inadequate capability, or an incorrect application contract.

## Diagnose the adaptation target

A model that cannot find the latest policy needs a data-access correction. A model that repeatedly ignores a stable categorization rule despite sufficient evidence may benefit from training. A model unable to perform the underlying task may require a more capable base model, a deterministic tool, or a redesigned workflow.

| Observed failure | First intervention | Why training alone may disappoint |
| --- | --- | --- |
| Outdated product facts | Versioned retrieval/tool access | Weights do not update when a document changes |
| Inconsistent stable format | Clear contract, constrained output, then SFT if needed | Schema can often enforce shape directly |
| Domain-specific repeated judgment | Labeled data and task evaluation | Ambiguous labels teach inconsistent behavior |
| Too expensive at acceptable quality | Smaller model adaptation/distillation | A student may lose rare but important skills |
| Unauthorized disclosure | Access control and isolation | Training cannot replace enforcement |

Compare against the best economical prompt/retrieval baseline. Include dataset creation, training, hosting adapters, evaluation, and retraining in total cost. A custom model is a continuing release responsibility.

## Training examples define the behavior learned

Supervised fine-tuning, or SFT, optimizes likelihood of desired completions. Good examples preserve the deployment inputs: relevant evidence, message templates, available tools, and realistic ambiguity. A polished target response paired with evidence that will never exist at inference creates a false training advantage.

A training record should retain provenance and intended supervision:

```json
{
  "case_id": "classify-019",
  "source_group": "exports-family-4",
  "input": {"message": "Export finishes but the download is empty"},
  "target": {"category": "export-data", "needs_clarification": false},
  "label_revision": "taxonomy-6",
  "review": {"status": "adjudicated", "reason": "empty output, no auth failure"}
}
```

Remove sensitive data according to an explicit policy, deduplicate, verify rights to use the data, and retain lineage for deletion. Split related users/documents/tasks together. Balance important strata deliberately; duplicating rare examples can help their training weight while also increasing memorization.

In conversation training, decide which tokens contribute to loss. Training on assistant outputs only is common for instruction behavior. Tool observations should match actual tool semantics, including errors. Never teach a trace to claim a mutation succeeded when no corresponding final-state evidence exists.

## LoRA restricts the trainable update

Full fine-tuning updates all selected base weights. Low-Rank Adaptation freezes a base matrix `W` and learns an update `ΔW = (α/r)BA`, where `A` has shape `[r, input_width]` and `B` has shape `[output_width, r]`. The rank `r` limits the update's rank; `α` sets scaling under this convention.

For a 4,096-by-4,096 matrix, full adaptation trains 16,777,216 values. Rank 16 trains `16×4096 + 4096×16 = 131,072`, about 0.78% as many for that matrix. Total training memory does not fall by the same ratio because the base model, activations, and runtime overhead remain.

```python
input_width = output_width = 4096
rank = 16
full = input_width * output_width
adapter = rank * input_width + output_width * rank
print(full, adapter, round(100 * adapter / full, 2))
assert adapter == 131072
```

This standalone calculation describes parameter count, not a quality prediction. Targeting attention projections versus feed-forward layers changes the adaptation space. Rank, data volume, learning rate, and target modules need evaluation. Adapters can sometimes merge into compatible base weights for inference; multi-adapter serving introduces identity, scheduling, cache, and compatibility concerns.

QLoRA combines a quantized frozen base with trainable low-rank updates and specific memory-saving techniques. It reduces some training memory requirements; it does not mean every intermediate or optimizer state is four-bit. Check supported kernels, compute dtypes, and the exported artifact rather than inferring the whole training format from a label.

## Preferences optimize relative behavior

Preference datasets pair a chosen and rejected response for a common input. They are useful when multiple answers are valid but some are more useful, honest, or aligned with the task. The comparison must describe the actual desired preference; “longer wins” or “more confident wins” creates predictable distortions.

Direct Preference Optimization, or DPO, compares the policy's chosen/rejected log-probability difference against a reference policy. A common loss is `-log σ(β[(log π(y+|x)-log πref(y+|x)) - (log π(y-|x)-log πref(y-|x))])`.

This standalone scalar example isolates that margin:

```python
import math

policy_chosen, policy_rejected = -4.0, -7.0
reference_chosen, reference_rejected = -5.0, -6.0
beta = 0.1
margin = beta * ((policy_chosen - reference_chosen)
                 - (policy_rejected - reference_rejected))
loss = math.log1p(math.exp(-margin))
print(round(margin, 3), round(loss, 3))
assert margin > 0
```

Actual training sums conditional token log probabilities under a defined masking/normalization policy and differentiates through the trainable model. Preference learning improves the measured preference objective; it does not prove truthfulness or preserve every prior capability. Evaluate refusal calibration, task success, minority strata, and regressions alongside preference wins.

## Distillation transfers behavior under a smaller budget

A teacher can supply target responses, labels, rankings, or probability distributions. A student learns from those signals, often to reduce cost or latency. The teacher's errors and blind spots propagate unless filtered or independently checked.

For verifiable tasks, retain teacher outputs only after deterministic validation. For open-ended tasks, use calibrated review and diverse difficult cases. A small student may reproduce the surface style of a reasoning answer without the teacher's underlying robustness. Evaluate held-out variations, not only the teacher-generated dataset.

Temperature-scaled soft targets can carry relative information about alternatives; sequence-only distillation supplies less of that distribution. Data quality, student capacity, training objective, and deployment prompts all affect the transfer. Store teacher revision and generation policy so training data remains reproducible.

## Release an adaptation as a complete artifact

A usable release includes base revision, tokenizer/template, adapter or merged weights, training configuration, dataset lineage, evaluation results, licenses, and serving compatibility. Versioning only the adapter file loses assumptions required to reproduce behavior.

Canary the adapted model on representative traffic. Compare accepted task outcomes, latency, safety boundaries, and cost—not just loss or a few pleasant examples. Keep rollback to a compatible base and serving configuration. If the underlying policy or schema changes, update the evaluation contract before deciding whether retraining is required.
