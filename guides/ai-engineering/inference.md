# GPU inference, memory, and scheduling

A model that fits on a GPU may still fail under realistic traffic. Weights, activations, KV state, memory bandwidth, kernels, and request scheduling determine useful serving capacity. Inference optimization arose from an imbalance: accelerators can perform enormous arithmetic while still spending significant time moving data or waiting for sequential generation.

## Measure the request phases separately

Time to first token includes admission, queueing, prompt processing, and the first generation step. Inter-token latency measures ongoing decode responsiveness. End-to-end latency includes the complete output and any retrieval/tool workflow. Tokens per second alone hides whether users wait too long for the first useful response.

![A request moves through queueing, prefill, first token, and repeated decode steps. Prefill emphasizes prompt computation, decode emphasizes retained KV and weight traffic, and cancellation stops remaining work.](/diagrams/ai-inference.svg)

Benchmark the actual input/output length distribution, concurrency, cold/warm behavior, and burst shape. A 100-token prompt with an idle GPU says little about a service mixing 30,000-token inputs and long-running agents. Report p50/p95/p99 latency, useful completion rate, cancellation, errors, and cost alongside throughput.

For decode, a simplified bandwidth bound divides model bytes read by available memory bandwidth. If a pass reads 14 GB of weights over 2 TB/s, the idealized transfer time alone is about 7 ms. Real execution adds KV reads, compute, kernel launch, communication, and imperfect utilization; batching can amortize weight reads across sequences. This is a diagnostic lower bound, not a throughput promise.

## Budget all major memory consumers

Weights require roughly parameter count times bytes per stored parameter, plus format-specific scales and metadata. Activations and workspaces depend on kernels, shapes, and parallelism. KV cache grows with retained sequence length and active sequences.

For a uniform full-retention decoder, an approximate cache size is `2 × layers × KV_heads × head_width × bytes × sequences × tokens`. The factor two represents keys and values.

```python
layers, kv_heads, head_width = 32, 8, 128
bytes_per_element, sequences, tokens = 2, 16, 8192
cache_bytes = (2 * layers * kv_heads * head_width * bytes_per_element
               * sequences * tokens)
print(cache_bytes / 1024**3, "GiB")
assert cache_bytes == 16 * 1024**3
```

This standalone estimate gives 16 GiB before weights and other allocations. Grouped-query attention uses fewer KV heads than query heads; multi-query attention reduces that further. Sliding windows, alternative architectures, cache quantization, offloading, and prefix sharing change the model. Confirm actual allocation and preemption behavior under load.

## Kernels and cache managers solve different problems

FlashAttention computes exact attention with tiling and online softmax, reducing high-bandwidth-memory traffic and avoiding materialization of the full attention matrix. It improves implementation efficiency without making dense attention interactions disappear.

PagedAttention-style management stores KV blocks in noncontiguous physical pages mapped from logical token positions. This reduces waste from reserving large contiguous buffers and can support sharing. It is a cache-layout/scheduling mechanism, distinct from the attention arithmetic kernel.

| Mechanism | Main resource addressed | What it does not guarantee |
| --- | --- | --- |
| Fused/tiled kernels | Memory traffic and launch overhead | Faster execution for every shape/hardware |
| KV paging | Fragmentation and dynamic allocation | More physical memory than the device has |
| Prefix caching | Repeated compatible prompt computation | Safe cross-user reuse without isolation |
| Continuous batching | Device utilization as requests arrive/finish | Low interactive tail latency without a policy |
| Tensor parallelism | Per-device model footprint and compute | Scaling without communication overhead |

Measure the bottleneck before combining optimizations. A faster prefill kernel will not remove a long admission queue caused by unconstrained output lengths.

## Continuous batching needs admission control

A fixed batch waits for its members to finish; short sequences waste capacity while a long sequence continues. Continuous batching admits and retires sequences between scheduling steps. Chunked prefill can interleave large prompts with ongoing decode rather than monopolizing an iteration.

The scheduler must balance total tokens per iteration, active KV capacity, fairness, and latency classes. A flood of large prompts can delay existing decode; overly aggressive decode priority can starve new requests. Track queues and deadlines by class, cap input/output sizes, and reject or defer work before the GPU thrashes.

Little's law relates average active work to arrival rate and average time in system. At 20 completed requests/s and 8 seconds average residence, about 160 requests are present on average under a stable workload. That does not mean all 160 should occupy GPU KV at once: admission and queues decide where they wait. As utilization approaches saturation, queueing can grow sharply.

## Quantization changes numerical representation

Quantization stores values with fewer bits using scales, zero points, or grouped representations. Weight-only quantization primarily reduces weight storage/traffic; activation or KV quantization affects other resources. Supported efficient kernels determine whether a smaller representation is faster in the deployed workload.

```python
weights = [-0.8, 0.0, 0.3, 1.1]
scale = max(abs(value) for value in weights) / 127
encoded = [max(-127, min(127, round(value / scale))) for value in weights]
reconstructed = [value * scale for value in encoded]
max_error = max(abs(a - b) for a, b in zip(weights, reconstructed, strict=True))
print(encoded, round(max_error, 4))
assert max_error <= scale / 2 + 1e-12
```

This standalone symmetric int8 example omits per-channel/group calibration and real matrix kernels. Outliers and sensitive layers can make naive quantization damaging. Evaluate long context, structured output, tools, multilingual tasks, and difficult reasoning after quantization; a generic benchmark average can hide deployment-specific degradation.

## Speculative decoding spends cheap work to avoid expensive steps

A draft model proposes several tokens. The target model scores that continuation in a more parallel operation. Exact speculative sampling uses an acceptance/correction procedure designed to preserve the target distribution under its assumptions; simply accepting any plausible draft is not the same algorithm.

Speedup depends on draft cost, accepted-prefix length, target batch efficiency, communication, and overhead. A fast draft poorly matched to the target can add work. Measure accepted tokens per verification and end-to-end latency, including the fallback path. Speculation is most useful when target decode is expensive enough to amortize verification overhead.

## Parallelism trades memory for communication

Tensor parallelism divides operations and often communicates within layers; it benefits from a fast interconnect. Pipeline parallelism divides layers but introduces stage scheduling and bubbles. Data parallel inference runs independent replicas and scales throughput when each replica fits. Expert parallelism distributes MoE experts and moves token activations to their selected experts.

Choose the simplest layout meeting memory and latency needs. Cross-node distribution can turn an arithmetic bottleneck into a network bottleneck. A model fitting on one device may have better latency there even if a larger distributed setup advertises more total compute.

## Cache reuse needs a complete identity

A reusable prefix depends on exact token sequence, model/adapter revision, position configuration, and serving compatibility. Semantic similarity is insufficient for exact KV reuse. Include tenant/security scope where isolation requires it; avoid exposing cross-user timing or content information through shared cache behavior.

Canceling a browser stream should propagate cancellation to queued work and generation where possible. Otherwise a pleasant interface can hide expensive abandoned GPU jobs. Optimize useful completed tasks at the required latency, not the maximum number of tokens emitted by a saturated server.
