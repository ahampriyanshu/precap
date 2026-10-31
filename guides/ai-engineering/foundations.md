# Language models, tokens, and generation

A language model estimates what token could follow a sequence. Modern language models became useful application components because large-scale training produced representations that transfer across tasks: the same model can classify, extract, explain, or generate code through different inputs. Those capabilities still operate through a probabilistic continuation mechanism. An application must supply the right evidence, define acceptable behavior, and verify consequential results.

## Choose the computation the product needs

An exact lookup, a classifier, a search engine, and a generative model solve different problems. Asking a language model for an account balance replaces a database query with an unreliable memory test. Asking it to explain a balance supplied by the ledger is a better separation of responsibilities.

| Required outcome | Useful starting component | What establishes correctness |
| --- | --- | --- |
| Retrieve a known resource | Authorized database query | Identity, resource scope, current state |
| Assign stable categories | Rules or trained classifier | Per-class precision/recall and abstention |
| Find semantically related passages | Embedding retrieval | Relevant evidence in retrieved candidates |
| Order a small candidate set | Reranker | Task-specific ranking judgments |
| Synthesize several sources | Generative model with evidence | Supported claims, completeness, uncertainty |
| Modify business state | Deterministic service with a proposed action | Authorization, invariants, persisted outcome |

A model may be capable of several rows without being the cheapest or most reliable implementation of every row. Start with a measurable task contract: accepted output, forbidden effects, latency, and cost per accepted outcome. This determines which model behavior matters before model size or framework choice.

## Tokenization defines the actual input

A tokenizer maps text into vocabulary IDs. Tokens may represent subwords, bytes, spaces, punctuation, or combinations. Token count varies across languages, code, formatting, and numeric strings; word count is an unreliable capacity estimate.

Byte-pair encoding builds reusable pieces by learning frequent merges. A simplified merge trace makes the mechanism visible:

```text
start:          l  o  w  e  s  t
merge l + o:    lo    w  e  s  t
merge lo + w:   low      e  s  t
merge e + s:    low      es    t
merge es + t:   low      est
result:         [id("low"), id("est")]
```

Real tokenizers add trained merge ranks, normalization, special tokens, and often byte-level handling. Unigram tokenization uses a different segmentation objective. Use the model's actual tokenizer and chat template: two tokenizers accepting the same string do not assign equivalent IDs or length. A vocabulary mismatch can produce nonsense even though every value is an integer in range.

Chat messages are serialized into a sequence with role markers, boundaries, and sometimes tool-call structures. These tokens consume capacity too. Hand-building a conversational format that differs from training can undermine instruction following or confuse a tool result with a user instruction.

## IDs become vectors, then context-dependent features

An integer token ID selects a row in an embedding matrix. Its numeric value has no semantic distance: IDs 900 and 901 need not describe related concepts. Layers subsequently transform these vectors using the surrounding permitted tokens.

This standalone Python example isolates lookup from contextual computation:

```python
vocabulary = {"cache": 0, "miss": 1, "hit": 2}
embedding_table = [[0.8, -0.1], [0.2, 0.7], [0.5, 0.4]]
ids = [vocabulary[word] for word in ["cache", "miss"]]
vectors = [embedding_table[token_id] for token_id in ids]
print(ids, vectors)
assert vectors[0] == [0.8, -0.1]
```

The invented two-dimensional vectors illustrate indexing; they have no trained meaning. In a real model, the final representation of “bank” differs between a river description and a loan application. Contextual features explain why changing earlier instructions or examples can alter a later answer even when the question text is unchanged.

## Next-token prediction produces a distribution

The output projection produces one logit per vocabulary item. Softmax converts logits to probabilities. For next-token training, cross-entropy penalizes low probability on the observed target token; generation selects from the predicted distribution, appends the selected token, and repeats.

```python
import math

logits = [2.0, 1.0, -1.0]
temperature = 0.7
scaled = [value / temperature for value in logits]
weights = [math.exp(value - max(scaled)) for value in scaled]
probabilities = [weight / sum(weights) for weight in weights]
print([round(value, 3) for value in probabilities])
assert abs(sum(probabilities) - 1.0) < 1e-12
```

Subtracting the maximum preserves softmax while improving numerical stability. Lower positive temperature sharpens this distribution; higher temperature flattens it. Greedy decoding chooses the maximum directly. Top-k retains a fixed number of candidates; top-p retains a smallest probability-ranked prefix meeting a cumulative threshold. Sampling policy changes output variability, not whether facts are grounded.

A token's probability measures the model's preference among continuations under this input. It is not a calibrated probability that a business claim is true. A confident wrong fact can be a high-probability continuation. Temperature zero also does not guarantee bitwise reproducibility across hardware, batching, kernels, or model revisions.

## Context is working input, not persistent learning

The context window bounds the tokens a request can retain. Supplying a document changes the current computation without updating model weights. Fine-tuning changes weights; retrieval selects external information; persistent application memory stores state outside a single request. These mechanisms have different update and deletion semantics.

For a 32,768-token total limit, reserving 4,096 for output and 2,048 for instructions, history, and tools leaves 26,624 for evidence. The precise accounting depends on the model/API contract, including any additional generated-token accounting. Reserve output before packing passages. Otherwise a request may be rejected, silently truncated by application code, or stop before completing a structured result.

```python
limit, output_reserve, envelope = 32768, 4096, 2048
passage_lengths = [9000, 7000, 6500, 6000]
remaining = limit - output_reserve - envelope
selected = []
for size in passage_lengths:
    if size <= remaining:
        selected.append(size)
        remaining -= size
print(selected, remaining)
assert selected == [9000, 7000, 6500]
```

This is only budget arithmetic. A production packer also considers relevance, duplication, source diversity, and whether a passage can be understood without its heading or table header. A large accepted context does not establish reliable use of every position within it.

## Generation needs an explicit completion contract

Completion can end because of an end token, stop sequence, output limit, cancellation, safety refusal, tool request, or error. Treat these as distinct outcomes. A JSON prefix streamed to the browser is not yet a valid object, and a sentence saying “done” is not evidence that an external mutation succeeded.

Streaming improves perceived latency by exposing partial output; it does not reduce the number of decode steps. Keep temporary presentation separate from accepted output. Buffer structured results until validation, allow cancellation to stop downstream work, and record why generation ended.

The practical boundary is precise: the model proposes a continuation; the application decides whether that continuation satisfies the task. This distinction carries through retrieval, tools, evaluation, and production delivery.
