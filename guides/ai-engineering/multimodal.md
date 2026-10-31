# Images, audio, and realtime interaction

Text-only interfaces discard information users already have in screenshots, documents, speech, and video. Multimodal models connect representations across these inputs so a task can use visual or acoustic evidence directly. The application still has to preserve timing, resolution, identity, and trust boundaries that a plain string does not express.

## Images become representations, not perfect transcripts

A vision-language pipeline often encodes image patches or visual features and connects them to a language model through a projector, adapter, or cross-attention mechanism. Architectures vary; some use unified token streams. Resolution, crops, aspect ratio, and preprocessing affect both useful evidence and resource use.

A screenshot question may require reading a small label, understanding layout, and associating a value with the right control. Downsampling can erase the label; OCR can recover characters while losing spatial relationships. Use OCR, layout extraction, or a vision model according to the task, and preserve page coordinates or bounding boxes when location matters.

```json
{
  "document_revision": "invoice-scan-r2",
  "field": "total_due",
  "value_minor": 15500,
  "currency": "USD",
  "evidence": {"page": 2, "box": [0.62, 0.81, 0.92, 0.89]},
  "validation": {"arithmetic_matches_lines": true}
}
```

This is an illustrative extraction result with normalized page coordinates. The bounding box aids inspection; it does not prove the value is correct. Validate arithmetic, currency, page identity, and domain constraints independently. Treat visible instructions inside an image as untrusted content, just like retrieved text.

## Video requires temporal sampling

A video model may consume sampled frames, audio, timestamps, and other features. Sampling every few seconds can miss a brief event; dense sampling raises cost and context use. A summary of isolated frames may reverse event order or invent a causal connection.

For event detection, define the required temporal resolution and keep timestamps attached to evidence. Use a coarse pass to find candidate intervals, then a finer pass for the relevant segment when appropriate. Evaluate short events, repeated similar scenes, occlusion, and audio/visual disagreement. “Understands video” is too broad to establish a particular safety or inspection task.

## Speech systems trade modularity against joint modeling

A modular voice pipeline performs speech recognition, text reasoning/tool use, and speech synthesis. It exposes inspectable text and allows components to be evaluated or replaced separately. Errors can cascade: a wrong entity in transcription leads to the wrong lookup, then a fluent spoken answer.

Native audio or speech-to-speech models can preserve prosody, timing, and acoustic cues that a transcript omits. They may reduce some pipeline overhead while making intermediate behavior less visible. Choose based on measured task quality, latency, control, language support, and privacy requirements rather than assuming one architecture is universally superior.

![A voice session receives timestamped audio, detects turn boundaries, interprets the request, checks tools, and streams speech. A new user turn cancels outstanding output and playback, while committed external effects remain separately reconciled.](/diagrams/ai-voice.svg)

A useful latency budget might allocate 250 ms to endpointing, 200 ms to transcription/encoding, 400 ms to first useful reasoning output, and 150 ms to initial synthesis/playback: about one second before network and tool delays. These are illustrative allocations. Measure the actual critical path and overlap; summing independently measured averages can misrepresent a streaming pipeline.

## Realtime interaction needs a turn state machine

Voice activity detection identifies speech-like activity. Endpointing decides when an utterance is complete. Aggressive endpointing cuts off slow speakers; conservative endpointing adds silence. Barge-in means a user begins speaking while output is playing. The system should stop obsolete generation and playback, then attach new input to the correct turn.

This standalone example illustrates rejecting stale events after a turn changes:

```python
active_turn = 8
incoming_events = [
    {"turn": 7, "kind": "audio-chunk", "data": "old output"},
    {"turn": 8, "kind": "audio-chunk", "data": "current output"},
]
playable = [event for event in incoming_events if event["turn"] == active_turn]
assert len(playable) == 1
print(playable[0]["data"])
```

A production stream also needs sequence numbers, buffering, acknowledgement/cancellation semantics, reconnect handling, and a record of what audio was actually played. Truncating conversation state to the generated transcript can falsely assume the user heard audio that was canceled before playback.

Cancellation must not imply rollback of an external action. A spoken “cancel” arriving after a booking committed requires a separate cancellation operation and its own authorization. Bind tools to durable task/operation identities rather than a transient audio chunk.

## Audio format is part of the integration contract

Sample rate, channel count, sample encoding, frame duration, and codec must agree across capture, transport, model input, and playback. Incorrect interpretation can change speed or corrupt audio. Resampling has compute/quality costs, and packet loss or jitter affects perceived continuity.

For uncompressed mono 16-bit PCM at 24 kHz, one second is `24,000 × 2 = 48,000` bytes before framing. Ten thousand concurrent streams would carry about 480 MB/s of raw one-direction payload. Compression and duty cycle change this substantially; real capacity planning must use the selected codec and traffic pattern.

```python
sample_rate, channels, bytes_per_sample = 24000, 1, 2
seconds, concurrent_streams = 1, 10000
payload = sample_rate * channels * bytes_per_sample * seconds
print(payload, payload * concurrent_streams / 1_000_000, "MB per second")
assert payload == 48000
```

Use jitter buffers and backpressure deliberately. Growing a buffer indefinitely preserves every chunk while destroying interactivity. Track capture-to-playback latency, underruns, dropped/canceled chunks, and reconnects.

## Image generation uses a different computation

Diffusion-style generation learns to reverse a corruption/noising process, often in a compressed latent space rather than raw pixels. At inference, a sampler iteratively refines a noisy representation conditioned on text or other inputs; a decoder turns the latent into an image. Flow-based variants and autoregressive image models use different formulations, so “image model” does not imply one universal sampling algorithm.

Guidance strength, sampling steps, resolution, and seed influence the result and compute. More steps can improve some outputs with diminishing returns; strong guidance can harm diversity or introduce artifacts. An image-editing application must preserve identity, geometry, and intended unchanged regions, not merely produce an attractive new image.

Evaluate content fidelity, text rendering, localization, consistency, and applicable policy separately. Aesthetic preference alone is insufficient for a product mockup containing required labels or a document extraction task requiring exact values.

## Evaluate each modality and the whole interaction

Speech word error rate measures transcription edits but can underweight a single wrong account ID. Add task-specific entity accuracy, successful disambiguation, speaker/turn handling, latency, and final outcomes. For vision, include small text, rotation, low contrast, charts, tables, and misleading spatial context. For realtime, test interruptions, overlapping speech, silence, reconnects, and tool delays.

Consent and retention apply to raw media as well as derived transcripts, embeddings, thumbnails, and traces. Avoid collecting continuous audio/video when a bounded clip suffices. Multimodal capability increases useful evidence; it also creates more places where meaning, timing, or private information can be lost.
