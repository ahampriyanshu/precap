# Evaluate, launch, and operate it

Operate the complete support outcome: a grounded explanation and, when authorized, the correct request state. A model response is one intermediate artifact; retrieval, tools, approvals, and recovery can fail independently.

## Measure the complete outcome

Version evaluation cases with account state, permissions, policy snapshots, expected outcomes, and grading criteria. Include refusals, missing evidence, revoked access, policy exceptions, and retries. Keep difficult strata visible: many good explanations cannot compensate for a cross-account disclosure.

Use deterministic checks for amounts, scope, and duplicate effects. This standalone Python example grades observed execution results from three fixtures; a real harness obtains these from the execution service, not the model's claimed result:

```python
cases = [
    {"same_account": True, "effects": 1, "expected_effects": 1},
    {"same_account": True, "effects": 0, "expected_effects": 0},
    {"same_account": False, "effects": 1, "expected_effects": 0},
]
hard_failures = sum(not c["same_account"] or c["effects"] > 1
                    for c in cases)
successes = sum(c["same_account"] and
                c["effects"] == c["expected_effects"] for c in cases)
print(successes, hard_failures)  # 2 1
```

Report the hard failure separately from the aggregate success rate; it can block release. Add crash, timeout, and duplicate-request tests against durable state. Repeat consequential cases to expose model variability. [Anthropic's evaluation guidance](https://www.anthropic.com/research/demystifying-evals-for-ai-agents) distinguishes transcript quality from actual outcomes.

Measure retrieval recall against permitted current evidence, then assess answer support and tool correctness. Use calibrated model judges for explanation quality, with expert-reviewed examples and disagreement checks. Maintain a holdout outside prompt iteration and a regression set of observed failures. Positive user feedback supplies candidates, not ground truth about policy correctness.

## Spend latency and cost deliberately

Budget p95 completion time and cost per successful outcome across queues, retrieval, tools, model calls, and retries. Time to first token measures responsiveness; it does not measure when a refund request finishes. Long serial tool chains can dominate an otherwise fast model.

This YAML is an illustrative application budget, not a provider configuration. The orchestrator must enforce each field and propagate the remaining deadline to dependencies:

```yaml
workflow: refund-assistance
budget:
  deadline_ms: 8000
  model_calls: 2
  tool_calls: 4
  output_tokens_per_call: 600
  retryable_read_attempts: 2
on_budget_exhausted: save_draft_and_escalate
mutations: reconcile_status_before_any_retry
```

Tune numbers from observed quality and latency. Canceling a local request does not cancel an accepted external mutation. Bound concurrency, reserve quota headroom, and avoid retries that amplify throttling. Parallelize independent lookups only when their authorization boundaries allow it.

Cache stable prompt prefixes where the provider supports it; measure real hit rates. Answer caches need user scope, account state, policy version, and expiry in their correctness model. Provider caching has specific lifetimes and constraints, as [Anthropic's documentation](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) shows.

## Release a versioned system

A prompt hash alone cannot reproduce a result. Record the other moving parts in the release manifest; these identifiers illustrate artifacts owned by the application:

```yaml
release: support-assistant-17
model_revision: provider-approved-revision
prompt_sha256: recorded-at-build
policy_snapshot: policies-2026-10-20
retrieval: {index: policy-v8, embedding: embedding-v3, top_k: 6}
tool_contract: refund-api-v4
evaluation: {dataset: support-holdout-v5, grader: rubric-v3}
```

Pin exact versions where available; otherwise record the provider alias and the uncertainty it introduces. Compare on identical cases, inspect changed strata, then stage exposure with rollback criteria. Index refreshes need evaluation because they change behavior without an application deploy.

Shadow runs must suppress mutations. Keep a degraded path—policy search, a deterministic eligibility result, a saved draft, or human support—and evaluate any model fallback before use. Reconcile ambiguous mutation timeouts rather than blindly repeating them. [NIST's generative AI profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) includes supplier monitoring and managed fallbacks.

## Watch the product and its data boundary

Track spend, latency, quotas, retrieval misses, stale sources, abstentions, tool denials, duplicate suppression, and overrides by release. A quality regression may come from a connector, policy change, new user behavior, or the model; traces must distinguish these paths.

Minimize personal data in prompts and traces, restrict transcript access, and define deletion across logs, indexes, caches, and evaluation copies. Verify retention, training use, residency, and subprocessors against the actual provider contract and enabled features. Assign ownership to these controls alongside quality and availability. Expand scope when the evidence and recovery behavior support its error cost.
