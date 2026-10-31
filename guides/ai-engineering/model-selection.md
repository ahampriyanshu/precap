# Model selection and serving economics

“Best model” is incomplete without a task distribution, quality threshold, latency target, data policy, and cost model. Model selection became a systems decision as teams combined classifiers, encoders, rerankers, generative models, and tool-using workflows. The useful comparison is cost per accepted outcome under the actual workload.

## Compare complete candidates on the same contract

A candidate includes model revision, prompt/template, retrieval, tool configuration, decoding limits, serving precision, and fallback policy. Changing several at once can improve the system while making the reason unclear. Keep a baseline and run paired fixtures before optimizing expensive traffic experiments.

| Constraint | Measurement to require |
| --- | --- |
| Answer quality | Accepted outcomes and failures by task stratum |
| Interactive experience | TTFT, complete useful-result latency, p95/p99 |
| Structured/tool behavior | Schema failures, incorrect arguments, wrong effects |
| Data policy | Retention, processing region, training use, deletion controls |
| Operations | Quotas, outage behavior, version stability, support burden |
| Cost | Entire workflow cost divided by accepted outcomes |

A small model may be excellent for extraction and poor at reconciling conflicting policies. A large model may improve difficult decisions while adding no value to exact lookups. Test realistic ambiguity, long context, languages, and failures rather than selecting from a single public score.

## Count the complete workflow

Input and output tokens can have different prices. Cached input, batch processing, storage, retrieval, reranking, repeated calls, tool use, human review, and failed attempts add cost. Use measured distributions; a mean prompt length can conceal a long expensive tail.

This standalone calculation uses invented prices and workload values, not a provider quote:

```python
requests = 10000
input_tokens, output_tokens = 4000, 500
input_per_million, output_per_million = 1.0, 4.0
model_cost = requests * ((input_tokens / 1_000_000) * input_per_million
                         + (output_tokens / 1_000_000) * output_per_million)
other_cost = 15.0
accepted = 8700
print(round(model_cost, 2), round((model_cost + other_cost) / accepted, 4))
assert model_cost == 60.0
```

The example yields 60 currency units of model cost and about 0.0086 total units per accepted outcome. If retries double spend without changing accepted outcomes, the apparent per-call price stays attractive while the product economics worsen. Include denied, abandoned, and failed requests in the numerator where they incurred cost.

## Routing trades average cost for an extra decision

A router can send easy tasks to a cheaper model and difficult tasks to a stronger model. It may use deterministic task types, input features, a classifier, or a first model's result plus a verifier. The router itself can misclassify difficulty; confidence from a weak model is not automatically a reliable escalation signal.

A cascade pays the cheap stage for every request and the expensive stage for escalations. If the first stage costs 0.002 and the second 0.012, escalating 25% costs `0.002 + 0.25×0.012 = 0.005` per request before router overhead. It also adds sequential latency to escalated tasks. Compare final quality and p95 latency with directly using the stronger model.

Route by observable failure conditions where possible: invalid schema, failed deterministic checks, missing evidence, or a known difficult task family. Missing evidence should not be “fixed” by asking a more fluent model to guess. Keep critical policy checks invariant across every route.

## Hosted and self-hosted capacity have different costs

Hosted inference reduces model-serving work but adds provider quotas, network dependency, version lifecycle, and contractual data constraints. Self-hosting offers control over weights, region, precision, and scheduling while making capacity planning, patching, model licensing, and incidents your responsibility.

A rough self-hosting comparison starts with provisioned accelerator hours, effective utilization, useful tokens/tasks delivered, redundancy, and operational labor. A GPU at 15% utilization still has its full provisioned cost. Batch-friendly background jobs may improve utilization, but should not violate interactive latency or data isolation.

Do not compare a fully utilized theoretical GPU throughput with a metered API bill. Benchmark the chosen hardware, model, length distribution, concurrency, and SLO. Include spare capacity, rollout overlap, model load time, autoscaling lag, storage, networking, and engineering ownership.

## Context, caching, and outputs change economics differently

Prompt-prefix caching can reduce repeated prefill when exact compatible prefixes recur. Semantic answer caching reuses prior results and therefore needs correctness, freshness, personalization, and authorization checks. They are different mechanisms with different risks.

Shorter outputs often reduce sequential decode time and cost. Removing essential explanation or evidence can lower acceptance, making the cheaper response more expensive per useful outcome. Measure the smallest output that satisfies the contract rather than enforcing a universal word limit.

A retrieval improvement can reduce context size while improving evidence density. It can also add reranking cost. Evaluate the entire change: retrieval latency plus smaller prefill plus answer quality. Optimize the binding constraint, not whichever token number is easiest to reduce.

## Keep exit and degradation paths credible

Pin or record model revisions where supported, retain evaluation fixtures, and periodically test fallback compatibility. Different models may interpret tool schemas, templates, refusal behavior, or output limits differently. A nominally compatible endpoint is not evidence of interchangeable application behavior.

Define degradation by task: serve a deterministic result, return a cached version with age, defer a background job, provide evidence without synthesis, or fail clearly. Switching to a weaker model during an outage is acceptable only for tasks where its measured behavior still meets the degraded contract. A fallback should preserve authorization and effect safety even when answer quality is reduced.
