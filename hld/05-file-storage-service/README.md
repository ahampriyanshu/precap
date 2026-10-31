# File Storage Service

## The problem

Design a service that accepts large files, stores them durably, and serves authorized downloads. Large uploads should survive a failed connection without restarting every byte. A partially uploaded file must remain invisible to ordinary readers, and a successful completion must have a precise meaning.

Assume a hypothetical workload of 100,000 uploads per day averaging 100 MB. That adds about 10 TB daily before replication and retention policies. A 1 GB upload split into 10 MB parts needs roughly 100 part transfers; retrying one failed part transfers about 10 MB again instead of 1 GB. Smaller parts improve retry granularity but increase request count, metadata, and coordination. Upload throughput, retained capacity, and download egress need separate budgets.

## Naive approach

Proxying a whole upload through an application worker is simple but consumes its connections and bandwidth. Publishing directly under the final object key risks exposing partial bytes. Parallel parts make arrival order especially misleading:

```pseudocode
receive(upload_id, part_number=2, bytes=second_part)
receive(upload_id, part_number=1, bytes=first_part)
append_in_arrival_order(second_part)
append_in_arrival_order(first_part)
# Correct bytes arrived; the reconstructed file is still wrong.
```

An upload identity plus numbered parts establishes which transfer is being resumed and how bytes are assembled. Retrying the whole request cannot recover that identity implicitly.

## Where the naive approach breaks

A client sends 900 MB of a 1 GB file, loses connectivity, and retries. Without an upload identity and numbered parts, the service either restarts the transfer or appends duplicate bytes. Arrival order cannot establish file order once transfers are parallel.

Another failure crosses metadata and byte storage. All bytes arrive, but the service crashes before marking the row ready. The file exists yet remains inaccessible. Reversing those writes creates a worse gap: metadata becomes visible before the bytes are durable. Completion replies can also disappear after publication, so a retry must distinguish an already completed upload from a new request attempting to overwrite the same key.

## A better design

Separate the control plane for authorization and manifests from the data plane carrying bytes. Initiation creates an upload ID and staging manifest; scoped capabilities let clients transfer numbered parts directly to storage.

```text
Client -> Metadata API -> Upload manifest / ready metadata
   |                           | completion validation
   v                           v
Staging byte storage -> Published object -> Download client
```

Use `POST /uploads`, numbered part writes, completion, and abort. The manifest records owner, target key, expected size or part count, checksums, and state. Completion validates part identity, order, size, and assembled integrity. A checksum detects corruption, not authorization or safe content.

Once immutable bytes are finalized and verified, a relational metadata variant can publish their exact version:

```sql
UPDATE uploads
SET state = 'ready', object_version = $2
WHERE upload_id = $1
  AND owner_id = $3
  AND state = 'uploading'
RETURNING upload_id, object_version;
```

This statement assumes the caller has already verified the finalized object and binds its immutable version. It omits schema, manifest validation, and authorization middleware. One successful state transition publishes the metadata; zero returned rows requires inspecting the existing row to distinguish a matching retry, abort, or conflict. Never treat every zero-row result as success.

There is no transaction spanning metadata and object storage. Finalize durable bytes first, then publish ready metadata. A crash between them leaves an orphan, recoverable by retried completion or reconciliation. Publishing metadata first can advertise unavailable bytes. Downloads resolve only ready metadata and obtain a short-lived capability for the exact object version; object keys alone are not access permission.

Create-only names need a conditional ownership claim so two uploads cannot silently overwrite each other. An overwrite service instead needs version-selection rules. Reclaim incomplete parts and unreferenced finalized objects only after a safe retention policy; cleanup must not race an in-progress completion. Bound active uploads and byte quotas per tenant.

Direct transfer reduces application bandwidth but adds capability expiry and lifecycle work. Replication or erasure coding changes durability, repair traffic, and retained cost; delivery caches reduce repeated egress at the cost of access and freshness policy. Measure part retries, checksum failures, completion latency, orphan bytes, and ready-record/object mismatches.

## Real-world usage

Multipart storage suits backups, video assets, and large exports. Measure part retries, checksum failures, completion latency, ready-record/object mismatches, orphan bytes, and cleanup age. Apply per-tenant byte quotas and limits on active uploads, not just request counts. Never treat a user-provided filename as a trusted filesystem path.

Multipart uploads need independent part transfers, ordered completion, integrity checking, and cleanup of abandoned transfers.

## Practice

### Design brief

Design authorized large-file storage for 100,000 daily uploads averaging 100 MB, adding about 10 TB per day before replication and retention. A 1 GB upload should resume after a failed transfer without sending every byte again. Ordinary readers must never see incomplete content. Define completion, overwrite policy, retention, and download-demand assumptions before estimating capacity.

### Draw and explain

Use Excalidraw to separate metadata operations from byte transfer. Label upload identity, part ordering and integrity metadata, authorization boundaries, staging bytes, and the owner of publication state. Trace initiation, parallel part transfer, completion, and an authorized download. Mark the point where success can be acknowledged and show which durable evidence permits a client to retry or resume.

### Stress the design

A client loses connectivity after transferring 900 MB of a 1 GB file. Explain how it discovers remaining work and avoids duplicated bytes. Then crash the service after durable bytes are finalized but before visible metadata changes. Draw how retry or reconciliation completes publication, and how abandoned objects are eventually distinguished from live ones.

### Review your design

Compare part sizes using transfer retries, request count, and metadata cost. Check capability expiry, tenant byte quotas, and conflicting publications to one target key. Explain the tradeoff between direct transfers and application-proxied traffic. Choose metrics for orphan bytes, checksum failures, completion delay, and metadata/object disagreement.
