# Concept illustrations

Eleven original SVG plates give the core path and supplementary playlists and worked examples a visual identity. The direction follows the custom subject-specific line illustrations in `supertrips`; no artwork was copied. All illustrations are authored in code, hosted locally, and contain no third-party resources or animation.

| Plate                | Mechanism illustrated                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Machine coding       | Binary search for 21 in a sorted seven-element array; candidates shrink to three, then one.                        |
| System design basics | An asynchronous replica has applied entry 103 while the primary has committed 104. A replica read may be stale.    |
| Low-level design     | Checkout depends on the Payment contract; Card and Wallet implement it.                                            |
| High-level design    | Interchangeable API instances share cache, data, and queued work dependencies. The worker handles background work. |
| Frontend             | DOM and CSSOM feed the render tree, followed by layout and paint.                                                  |
| Backend              | A transfer debits 30 and credits 30 in one atomic transaction. Total funds remain 120.                             |
| AI engineering       | Retrieved evidence joins the question in context. Cited model output still needs evaluation.                       |
| DevOps               | One immutable build artifact is rolled out gradually across pods.                                                  |
| Observability        | Overlapping child spans explain one request; a histogram shows the broader latency distribution.                   |
| Product management   | An illustrative retention comparison is judged alongside an error-rate guardrail.                                  |

The combined Last Mile Prep cover connects release, audience, telemetry, and triage decisions. The former observability and product plates now illustrate the trace and experiment lessons within that playlist. A dedicated pipeline diagram explains collection and separate signal stores.

## Editing

Edit `scripts/generate-concept-art.mjs`, then run `node scripts/generate-concept-art.mjs` from the repository root. Covers live in `public/illustrations/`; the trace and experiment teaching plates export into `public/diagrams/`. Text alternatives and captions live in `lib/concept-art.ts`. `ConceptIllustration` reserves image dimensions and lazy-loads each plate. Search results omit covers to keep results compact.

The images are conceptual examples rather than complete implementation diagrams. Keep labels, connections, captions, and alternatives consistent when changing them. Preserve the 600 × 340 viewbox and review both desktop and narrow mobile layouts after regeneration.
