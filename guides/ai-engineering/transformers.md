# Inside a transformer

Recurrent networks process sequence positions through a recurrent dependency, making long-range relationships and parallel training difficult. Attention allowed a position to combine relevant information from other positions directly. The transformer organized attention and feature transformations into repeatable blocks, enabling efficient parallel training and the decoder architectures used by many language models.

The important engineering distinction is between the mathematical operation, the architecture around it, and the implementation serving it. A faster attention kernel changes execution; a different attention visibility rule changes what information a token can use.

## Follow shapes through the forward pass

A decoder starts with token IDs of shape `[B,T]`, where `B` is batch size and `T` sequence length. An embedding lookup produces `[B,T,D]` hidden states. Repeated blocks preserve that outer shape while changing the features. A final projection produces vocabulary logits.

![A decoder block sends normalized hidden states through causal attention and a feed-forward network, each with a residual addition; final hidden states project to vocabulary logits.](/diagrams/ai-transformer.svg)

A common pre-normalization block can be expressed as:

```text
x = x + Attention(Norm(x), positions, causal_mask)
x = x + FeedForward(Norm(x))
logits = OutputProjection(FinalNorm(x))
```

This is an architecture sketch, not a universal implementation. LayerNorm and RMSNorm normalize differently; gated feed-forward layers differ from a simple two-layer MLP; some models vary attention scope. Residual paths allow each sublayer to learn a change to existing features and improve gradient flow. Normalization controls activation scale, but does not make all training configurations stable automatically.

During training, logits are needed at supervised positions. During ordinary next-token generation, an implementation can project only the required last position rather than materializing every position's full vocabulary distribution.

## Queries, keys, and values are learned projections

For each head, linear projections create queries `Q`, keys `K`, and values `V`. Queries and keys determine mixing weights; values carry the features being mixed. For head width `d`, attention is `softmax(QKᵀ / sqrt(d) + mask)V`.

This standalone example computes one query over two visible positions:

```python
import math

query = [1.0, 0.0]
keys = [[1.0, 0.0], [0.0, 1.0]]
values = [[2.0, 0.0], [0.0, 4.0]]
scores = [sum(q * k for q, k in zip(query, key, strict=True))
          / math.sqrt(len(query)) for key in keys]
unnormalized = [math.exp(score - max(scores)) for score in scores]
weights = [value / sum(unnormalized) for value in unnormalized]
context = [sum(weight * value[column]
               for weight, value in zip(weights, values, strict=True))
           for column in range(len(values[0]))]
print([round(value, 3) for value in weights])
print([round(value, 3) for value in context])
assert abs(sum(weights) - 1) < 1e-12
```

The weights are approximately `[0.67, 0.33]`. Attention combines both value vectors; it does not return a verified fact from a database. Multiple heads use different projections, then concatenate or otherwise combine their outputs before projection back to hidden width. Attention weights alone do not fully explain a prediction because information also travels through value projections, residuals, feed-forward layers, and later blocks.

## Causal masking makes training compatible with generation

For causal prediction, position `i` can read positions up to and including `i`, whose hidden state predicts the following token. It cannot inspect later targets. The mask adds an effectively negative-infinite score to forbidden entries before softmax.

```text
               key 0   key 1   key 2
query 0          ✓       —       —
query 1          ✓       ✓       —
query 2          ✓       ✓       ✓
```

Without this restriction, training could solve next-token prediction by reading the answer directly. A padding mask excludes artificial batch padding and serves a separate purpose. Sliding-window attention excludes distant positions, while some architectures combine local and global patterns. A large advertised context length does not mean every layer performs unrestricted full attention over it.

Encoder models often use bidirectional attention and are useful for representations and classification. Encoder-decoder models add cross-attention from generated states to an encoded input. Decoder-only models condition generation on a preceding sequence. These are architectural choices, not different names for the same mask.

## Position information supplies order

Content comparison alone does not encode sequence order. Some transformers add positional vectors; many decoders use Rotary Position Embedding, or RoPE, on query/key dimension pairs. Relative position then affects their dot products through relative rotations.

```python
import math

def rotate(pair, angle):
    x, y = pair
    return (x * math.cos(angle) - y * math.sin(angle),
            x * math.sin(angle) + y * math.cos(angle))

result = rotate((1.0, 0.0), math.pi / 2)
assert abs(result[0]) < 1e-12 and abs(result[1] - 1) < 1e-12
print(tuple(round(value, 3) for value in result))
```

This isolates one rotation; actual RoPE applies position-dependent rotations at multiple frequencies. Extending position ranges or changing scaling can affect quality and must be tested. Allocating enough memory for a longer prompt does not establish reliable retrieval, arithmetic, or reasoning across that prompt.

## Feed-forward layers transform features at each position

Attention moves information across positions. A feed-forward network transforms each position's feature vector, commonly expanding hidden width and projecting back. Nonlinear or gated activations let the block represent interactions a single linear transformation cannot.

Mixture-of-experts models replace some dense feed-forward computation with a router choosing a small set of experts for each token. Sparse activation can increase total parameter capacity without activating every expert on every token. Total model weights still consume storage and often device memory; routing imbalance, expert placement, and cross-device communication affect latency. “Active parameters” alone is insufficient for estimating deployment requirements.

The router must also avoid concentrating all traffic on a few experts. Training may use balancing objectives; serving must handle uneven routing and realistic batches. A model with fewer active parameters can still have expensive expert transfers or a large resident weight footprint.

## Prefill and decode stress different resources

Prefill processes the known prompt, producing hidden states and key/value tensors. Decode appends a token at a time. A KV cache reuses earlier keys and values rather than recomputing them for every generated token.

For full attention, naive prefill forms an attention score matrix growing quadratically with sequence length. Tiled exact attention kernels reduce memory traffic and avoid storing that entire matrix; they do not remove the underlying full-attention interactions. Cached decode computes the new token's projections and reads retained KV state. At small batch sizes, weight and cache movement can dominate arithmetic.

| Phase | Known input | Reused state | Typical pressure |
| --- | --- | --- | --- |
| Prefill | All prompt tokens | Existing prefix cache if eligible | Compute, prompt length, attention work |
| Decode | Current token plus retained context | Earlier key/value tensors | Memory bandwidth, active cache, sequential steps |

This explains why shortening output, reducing prompt size, changing batching, and improving kernels solve different bottlenecks. Measure the phase that violates the workload's latency or throughput goal before choosing an optimization.
