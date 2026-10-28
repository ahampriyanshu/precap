# Video Streaming Platform

## The problem

A video platform accepts uploads, prepares several playback qualities, and serves segments without forcing every viewer through the application servers. Assume 10,000 uploads per day, a 500 MB average source, and 100,000 simultaneous viewers at 3 Mbps. That is roughly 5 TB of new source data daily and 300 Gbps of playback traffic before overhead. Encoding and delivery therefore need different scaling plans.

An upload can take minutes to process; playback should start in seconds. A viewer must receive a manifest whose referenced segments exist and are authorized for that viewer. For this design, a newly uploaded version becomes playable only when every required rendition passes validation. Product metadata may be eventually consistent, while the publication decision needs a single authoritative version.

## Naive approach

One server can accept a file, transcode it synchronously, and stream the result from local disk. That couples long CPU work, publication, and playback traffic. A single readiness flag hides the dependency set:

```pseudocode
encode(low_quality)
upload(low_quality_segments)
set video.ready = true
# Worker crashes before encoding the remaining required quality.
player requests an advertised but missing segment
```

A successful partial encode is not a playable complete version. Adding web workers does not distribute their local files or establish an atomic publication boundary.

## Where the naive approach breaks

Suppose a worker finishes the low-quality rendition, writes `ready = true`, and then fails before producing the high-quality segments. The player sees an advertised quality that does not exist. Retrying work introduces another problem: an old worker can finish after its replacement and overwrite newer output or publish an obsolete upload version.

A queue also does not make completion exactly once. A worker can upload its output, crash before acknowledging its message, and receive the same job again. If the system appends results blindly, the manifest can contain duplicate or conflicting entries. Retrying the whole upload wastes encoding cost and makes the publication race larger.

## A better design

Separate control and media paths. Application servers authorize and coordinate; immutable object storage and a delivery layer carry large bytes.

```text
Uploader -> Upload API -> Object storage
                     -> Job queue -> Encoding workers
Viewer -> Playback API -> CDN -> Object storage
```

An upload creates `VideoVersion(video_id, version, source_key, state)`. Validated sources produce jobs keyed by `(video_id, version, rendition)`. Workers write immutable outputs under versioned keys. A metadata database owns job attempts and the current published manifest pointer; an outbox or recoverable scan schedules missing jobs.

Publication is a conditional workflow, shown as pseudocode rather than a claim that a local object can coordinate workers:

```pseudocode
output = verify_segments_and_checksums(attempt.output_keys)
transaction(metadata):
    job = lock_rendition(attempt.job_id)
    require job.current_token == attempt.token
    require job.video_version == attempt.video_version
    mark_complete(job, immutable_output=output)
    if all_required_renditions_complete(job.video_version):
        manifest = build_manifest_from_verified_outputs(job.video_version)
        publish_pointer_if_current(job.video_version, manifest)
```

Verification refers to the exact immutable outputs, not mutable filenames. The metadata transaction and conditional pointer update must be implemented by the chosen store. Output upload cannot join that transaction: a crash can leave unreferenced bytes, which reconciliation later reuses or reclaims. A late attempt fails the token check, and an obsolete video version cannot replace the current target. The example omits job claiming, manifest serialization, and storage adapters.

`POST /videos/{id}/versions` initiates work; processing reads expose state; playback returns a short-lived manifest URL after entitlement checks. The manifest names one version’s codecs, bitrates, and segments. Previous playable output stays available during reprocessing. A new version becomes playable only after every required rendition passes validation; a product wanting partial early playback needs a different explicit manifest policy.

Cache immutable segments for long periods, with shorter policies for manifests and entitlement responses. The edge must validate signed segment URLs or cookies on media requests, otherwise copying a private segment URL bypasses playback authorization. Cache misses and regional failures still reach origin, so budget that recovery traffic.

Separate queues and quotas stop large encodes from starving small uploads. Quarantine sources until validation, restrict source-object access, and bound upload size and processing budgets. Measure job age, encoding failures, publication delay, startup time, and rebuffering; those signals identify different bottlenecks.

## Real-world usage

Streaming and training platforms separate expensive preparation from interactive delivery. [Netflix Open Connect](https://openconnect.netflix.com/en/) illustrates the role of delivery infrastructure near viewers; it does not prescribe this hypothetical upload or publication workflow.

## Practice

### Design brief

Design video upload, preparation, and playback for 10,000 daily uploads averaging 500 MB and 100,000 concurrent viewers at 3 Mbps. That means roughly 5 TB of source data daily and 300 Gbps of playback traffic. Playback should start in seconds after preparation. Require each published version to contain every required validated rendition, while an earlier playable version remains available during reprocessing.

### Draw and explain

Use Excalidraw to separate upload control, media transfer, encoding work, publication ownership, and delivery. Label source and rendition versions, job identities, attempt ownership, immutable bytes, manifest pointers, and entitlement boundaries. Trace one upload through preparation to first playback, then a later version's publication. Mark acknowledgements and estimate encoding backlog, retained storage, and origin traffic separately from viewer bandwidth.

### Stress the design

A worker writes some output and crashes before acknowledging its job. A replacement completes, then the old worker returns late. Explain which output may be published and how unused objects are reclaimed. Next, fail a delivery region during a popular title's playback. Draw cache-miss pressure, authorization continuity, and expected viewer degradation.

### Review your design

Compare complete-version publication with earlier partial availability. Explain rendition choices, queue isolation, retry cost, and prewarming tradeoffs. Check that private segments cannot bypass entitlement by copied URLs. Choose signals for job age, publication delay, startup time, rebuffering, and origin saturation.
