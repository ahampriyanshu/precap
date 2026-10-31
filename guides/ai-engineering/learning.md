# How models learn

Handwritten rules work when the relevant distinctions can be enumerated. They become expensive when useful patterns depend on thousands of interacting signals: spelling variations, context, phrasing, images, or speech. Machine learning fits parameters from examples so those distinctions can generalize. Its failure modes follow from the same choice: the system learns the evidence and incentives present in the training process, including their gaps.

## Features, parameters, and the objective

A linear model computes a weighted combination of input features. A neural network composes learned transformations with nonlinearities. Parameters are the stored weights; activations are intermediate values produced for a particular input. Increasing parameters gives a model more representational capacity but does not supply missing data or a suitable objective.

Consider a classifier predicting whether a request belongs to an urgent queue. A logistic unit maps a score to a probability. This standalone example computes one training step on a single normalized feature:

```python
import math

x, target = 0.8, 1.0
weight, bias, learning_rate = 0.2, 0.0, 0.1
prediction = 1 / (1 + math.exp(-(weight * x + bias)))
loss = -(target * math.log(prediction)
         + (1 - target) * math.log(1 - prediction))
error = prediction - target
weight -= learning_rate * error * x
bias -= learning_rate * error
print(round(loss, 4), round(weight, 4), round(bias, 4))
assert weight > 0.2 and bias > 0
```

Cross-entropy assigns a large penalty to confidently wrong predictions. The gradient indicates how a small parameter change affects loss; the learning rate controls the update size. Backpropagation applies the chain rule through all layers to compute these gradients efficiently. It does not search all possible programs or attach an explanation to each weight.

A low training loss can mean useful learning, memorization, leaked targets, or an easy objective. The next question is what happens on examples the optimizer did not see.

## Generalization requires a credible split

Training data drives updates. A development set supports architecture and hyperparameter choices. A held-out test set estimates behavior after those choices. Repeatedly inspecting and optimizing against the test set turns it into development data, regardless of its filename.

Random row splits often leak structure. Paraphrases of the same document, multiple frames from the same video, or later events for the same user can occur on both sides. Split by the dependency the deployment must generalize across: document family, customer, repository, time, or another meaningful group.

```python
examples = [
    {"document_family": "billing-v1", "text": "invoice example"},
    {"document_family": "billing-v1", "text": "invoice paraphrase"},
    {"document_family": "exports-v2", "text": "export example"},
]
train_families = {"billing-v1"}
train = [row for row in examples if row["document_family"] in train_families]
test = [row for row in examples if row["document_family"] not in train_families]
assert {row["document_family"] for row in train}.isdisjoint(
    row["document_family"] for row in test)
print(len(train), len(test))
```

This only enforces one grouping rule. It cannot detect copied content across differently named families. Track provenance, deduplicate near-identical material, and retain a later-time slice when freshness matters. Report performance on deployment-relevant strata instead of allowing a large easy group to hide a small consequential failure group.

## Pretraining turns sequences into supervision

For a causal language model, a token sequence supplies many next-token targets. Given `A B C D`, the shifted targets are `B C D end`. A causal mask prevents a position from reading later target tokens. Training can compute losses across positions in parallel even though generation must append unknown tokens sequentially.

```text
input:          <start>   deploy    failed    because
next target:     deploy   failed    because   <next>
visible at failed: <start>, deploy, failed
not visible: because or its later continuation
```

A common objective minimizes mean negative log-likelihood, `L = -(1/N) Σ log p(target_i | prefix_i)`, over eligible tokens. Padding should not contribute as ordinary content. Instruction fine-tuning may mask prompt tokens and train only on the desired assistant completion; that is a training choice that must match the intended behavior.

Large corpora provide broad statistical structure. They also contain outdated facts, duplicated pages, personal information, contradictory claims, and errors. Deduplication, filtering, licensing, source mixture, and contamination checks influence the learned model. More tokens are useful only in relation to their quality, diversity, objective, and compute budget.

## Optimization has stability and memory costs

Minibatches estimate gradients from subsets of data. Small batches are noisy; very large batches change optimization behavior and hardware efficiency. Adam-style optimizers maintain additional state per trainable parameter. Training memory therefore includes much more than inference weights: gradients, optimizer state, activations retained for backward, and temporary workspaces.

Mixed precision reduces storage and accelerates supported operations. It requires numerical care because small ranges can underflow or overflow; some formats and training setups use loss scaling. Gradient clipping limits extreme update norms. Checkpointing activations trades recomputation for memory. Gradient accumulation combines several microbatches before an optimizer step; it does not make the intermediate forward passes free.

| Symptom | Possible cause | Evidence to inspect |
| --- | --- | --- |
| Training improves, held-out worsens | Overfitting, shifted data, leakage in the split | Curves by stratum, provenance, duplicate checks |
| Loss becomes nonfinite | Overflow, unstable update, invalid batch | Gradient norms, ranges, offending examples |
| Memory fails only in backward | Saved activations or optimizer state | Peak allocation by phase and sequence length |
| Throughput drops across devices | Communication or input bottleneck | Device utilization, collective time, data loader waits |

Changing a learning rate to hide a corrupt batch does not repair the batch. Diagnose data and numerical behavior before increasing training scale.

## Scaling training distributes different resources

Data parallelism runs replicas on different minibatches and aggregates gradients. Tensor parallelism divides individual operations across devices and needs fast communication. Pipeline parallelism assigns layers to stages and must schedule microbatches to reduce idle bubbles. State-sharding approaches distribute parameters, gradients, or optimizer states to fit larger training jobs.

The choice depends on what is constrained: model memory, activation memory, compute throughput, interconnect bandwidth, or data delivery. A second GPU on a slow link can add less useful capacity than expected. Track tokens processed, wall time, effective batch size, and loss at checkpoints; elapsed epochs alone hide very different token counts across sequence lengths.

Checkpoints need weights, optimizer/scheduler state, step counts, data progress, random-state information where relevant, and configuration. A weights-only export is often enough for inference but insufficient for a faithful training resume.

## Post-training changes behavior and incentives

Supervised fine-tuning learns from desired responses. Preference optimization learns relative desirability from comparisons. Reinforcement learning can optimize rewards from humans, models, or verifiable outcomes. These stages can improve task following and reasoning behavior, while creating incentives to exploit a weak reward or evaluator.

A reward for passing visible tests can encourage code that overfits those tests. A reward for user approval can favor agreeable falsehoods. A reward for long explanations can encourage verbosity. Use hidden tests, independent checks, and behavioral strata that distinguish useful work from superficial reward attainment.

For most product teams, the immediate training decision is narrower than pretraining a general model: improve data quality, use an existing model with evidence, or adapt a model for a stable repeated behavior. Establish the inference-time baseline and evaluation set first. Without them, a lower training loss cannot tell you whether adaptation improved the product.
