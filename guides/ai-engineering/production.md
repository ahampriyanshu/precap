# Production architecture, releases, and worked designs

A deployed AI feature is a versioned system of model, instructions, evidence, tools, validators, and delivery behavior. Production engineering connects its quality contract to resource budgets, observability, release decisions, and recovery. The same model can be useful or unreliable depending on those surrounding boundaries.

## Define an outcome SLO and resource budgets

Availability of a model endpoint is only one dependency signal. A user needs a valid useful result within a deadline. Track accepted task outcomes, support/grounding, critical boundary failures, time to useful completion, and cost. Distinguish model errors from retrieval, tool, validation, and delivery failures.

Budget the workflow before adding retries. For a three-second interactive target, retrieval, reranking, queueing, generation, validation, and network time compete for the same deadline. Pass a decreasing remaining budget to dependencies rather than giving each an independent three seconds.

```python
# Standalone deadline arithmetic; values are illustrative measured phase durations.
deadline_ms = 3000
spent = {"retrieval": 180, "reranking": 120, "queue": 250, "prefill": 350}
remaining = deadline_ms - sum(spent.values())
output_tokens = 60
estimated_decode_ms = output_tokens * 25
print(remaining, estimated_decode_ms)
assert estimated_decode_ms <= remaining
```

This leaves 2,100 ms before decode and predicts 1,500 ms of decode under the stated estimate. Tail latency, tool calls, and validation may consume the remainder. Use measured distributions and abort/degrade policies; an average arithmetic budget is not a p99 guarantee.

## Trace the first failed boundary

A trace should connect task/request identity to retrieval, evidence selection, model calls, tool proposals, policy checks, effects, and validation. Record versions, lengths, durations, termination reasons, and outcome categories. Raw prompts and tool payloads often contain sensitive data; collect approved fields and protect any replay artifacts separately.

```json
{
  "task_id": "task-203",
  "system_revision": "answer-service-r18",
  "model_revision": "approved-model-r4",
  "prompt_revision": "evidence-answer-r7",
  "index_revision": "docs-r14",
  "phase": "evidence-validation",
  "outcome": "unsupported-claim",
  "input_tokens": 6400,
  "output_tokens": 320,
  "latency_ms": 2840,
  "source_ids": ["policy-v4", "exception-v2"]
}
```

These are illustrative metadata fields. Keep metric labels bounded; task IDs and arbitrary prompt text belong in controlled traces, not high-cardinality metric dimensions. Monitor queues, cache occupancy, rate limits, cancellations, retries, and dependency health alongside quality signals. A rising unsupported-answer rate with stable model latency suggests a different investigation from a saturated inference queue.

## Release the entire system identity

An AI release includes model/adapter, tokenizer/template, prompt, tool schemas, retrieval/index/chunker, serving precision, validation, and routing configuration. Change one major component at a time when causal understanding matters; otherwise record the bundle and test it as a bundle.

Run component diagnostics and end-to-end evaluations, including important strata and critical failures. Shadow read-only traffic where policy permits. An agent shadow must not execute duplicate writes. Canary by controlled exposure, compare useful outcomes and latency/cost, and keep rollback compatible with data/schema state.

A model rollback does not necessarily restore an old embedding space or tool schema. Store compatibility constraints. For index migration, switch query encoder and matching index together. For tool changes, support in-flight durable tasks or migrate their state explicitly. Treat a broken compatibility boundary as a release failure even if the model weights are unchanged.

## Worked design: a private engineering knowledge assistant

Assume 200,000 versioned documents, 50 peak questions/s, an authenticated workforce, and a five-second p95 target for a supported answer or explicit abstention. Documents contain tenant/project restrictions, source updates arrive continuously, and some questions require exact service ownership or configuration values.

Begin with authorized lexical search, bounded passages, a generation call, and support validation. Add dense retrieval when labeled paraphrase queries miss relevant evidence; add reranking when the candidate set contains useful passages but ordering wastes context. Do not start by indexing every source into an agent with arbitrary tools.

```text
source changes → extraction/version ledger → chunks → lexical + vector indexes
                                                    ↓
user → auth/scope → hybrid candidates → rerank → evidence pack → generate
                                                             ↓
                     answer/abstain ← source/claim checks ← structured result
```

Preserve document revision and permission provenance on every chunk. Derive scope from authentication, filter before private text reaches models, and revalidate source visibility for cached answers. Store an index publication checkpoint so “freshness” has a measurable lag rather than meaning “the job ran.”

At 50 questions/s with two seconds average complete-work residence, about 100 requests are in the system on average under stable traffic. That is a workflow concurrency estimate, not a GPU batch size. If each prompt packs 8,000 tokens and output averages 300, a naive budget is 400,000 input tokens/s and 15,000 output tokens/s at peak, before retries. This immediately motivates realistic serving benchmarks, admission limits, and avoiding redundant context.

Define quality gates by query family: exact identifiers, paraphrases, multi-document comparisons, no-answer, conflicting revisions, and revoked permissions. Failure traces tell you which change to make. Missing updated policy requires ingestion repair; evidence present but ignored requires prompt/model/packing work; unauthorized evidence is an access-control defect.

For a model outage, return authorized search results with source versions if that degraded experience is useful. For stale indexing, disclose the known checkpoint or refuse freshness-sensitive claims. A fallback that answers confidently from memory violates the same contract the normal path was built to satisfy.

## Worked design: an operations assistant with limited effects

Assume engineers ask an assistant to inspect a failing deployment and prepare a rollback. Read tools expose approved telemetry and deployment metadata. A separate mutation service can execute only a validated rollback to a known artifact after the required authorization. The model never receives general cluster credentials.

The assistant first resolves service/environment, reads current revision and health, gathers evidence, then creates a typed proposal. That proposal names the exact target artifact, affected environment, current deployment revision, expected effect, and expiry. The UI can show a concrete reviewable change. Execution checks that authorization matches the unchanged proposal and revalidates current state.

```yaml
proposal_id: rollback-91
service: exports-api
environment: production
observed_revision: deploy-208
restore_artifact: sha256:approved-previous-artifact
preconditions:
  - deployment revision still equals deploy-208
  - target artifact is approved for this environment
  - no incompatible database migration blocks rollback
execution:
  operation_id: task-203/rollback-1
  deadline_seconds: 120
```

This is a domain contract fragment, not a complete deployment manifest. The service checks preconditions and permissions independently of the model's explanation. If the process crashes after dispatch, recovery reconciles `operation_id` rather than issuing a new rollback blindly. If a newer deploy appears, the old proposal expires and needs reevaluation.

A rollout can partially complete or reveal that the old binary is incompatible with a migrated schema. Define stop/hold/recovery states and preserve the authoritative deployment result. The assistant's final statement should report observed state and unresolved uncertainty. It should not infer success from a tool timeout or from having generated a command.

Evaluate injected log text, misleading telemetry, missing metrics, permission denial, duplicate dispatch, process loss, stale approval, incompatible migrations, and a user canceling during execution. The success measure is a correct authorized outcome with an auditable trajectory, not a plausible incident narrative.

## Feedback must distinguish evidence from preference

User ratings, edited answers, abandoned tasks, and support reports are useful signals, but not automatic training labels. A user may approve an agreeable wrong answer or reject a correct warning. Triage feedback into reproducible cases with environment state and a grading rationale.

Track distribution changes: new languages, product versions, larger documents, unfamiliar tool errors, or changed task mix. Drift can occur in data, retrieval, behavior, or demand even with fixed weights. Refresh fixtures intentionally and retain regression cases; silently replacing old failures with new easy examples destroys comparison.

Human review should focus on consequential uncertainty and new failure modes. Sampling only low-confidence outputs misses confidently wrong behavior, so include random and risk-based samples. Record who can view sensitive replay material and when it expires.

## Reliability includes graceful incompleteness

A useful system can return an abstention, a scoped partial result, a deferred job, or a request for missing input. Define those outcomes so monitoring does not reward fabrication as success. Retry only failures whose semantics justify retrying, bound total work, and propagate cancellation to dependencies.

Operate the system around explicit invariants: permitted evidence, supported claims, authorized effects, compatible versions, and bounded resources. Then model upgrades, new retrieval methods, and more flexible agents can improve capability without making basic correctness depend on persuasive text.
