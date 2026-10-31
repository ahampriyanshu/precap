# Service boundaries and safe evolution

A modular monolith keeps deployment, local calls, and transactions simple while separating business responsibilities in code. Services add independent deployment and operational boundaries, but every extracted call gains network latency, partial failure, contract evolution, and observability requirements.

Service decomposition became valuable when teams and workloads needed independent ownership or scaling. It is useful when those benefits exceed the cost of distributing state and coordination. A large codebase alone does not identify the right service boundary.

## Find a boundary around a decision owner

Inventory owns available stock and reservations. Billing owns payment attempts and financial state. A checkout workflow coordinates them without directly editing both databases. The ownership model should be understandable before separate processes exist.

```text
HTTP adapter → checkout use case → inventory module
                              → billing module
                              → order repository

Initially: local module interfaces and one deployment.
Later: extract a boundary only when independence is valuable.
```

Local interfaces need not pretend every call is already remote. Premature network-style abstractions can make simple transactions cumbersome without delivering isolation. Keep business ownership explicit and query costs visible; introduce transport contracts at actual process boundaries.

Extract a service when it has an identifiable owner, a coherent state model, independent capacity or release needs, and a plan for failure. If every request requires ten serial synchronous calls and every release requires all services to change together, the deployment count has increased faster than autonomy.

## Independent ownership changes data access

Reading another service's tables directly bypasses its contract and couples callers to internal migrations. A shared database can be a pragmatic transitional arrangement, but permissions and ownership must make the coupling explicit.

```text
Service needs current authoritative decision → call owner within a budget
Service needs a local searchable/read model  → consume owned events/projection
Service needs cross-domain historical report → analytical integration boundary
```

A projection is not a license to make a stale authoritative decision. For example, a cached permission projection may serve navigation, while a sensitive mutation needs the permission owner's current decision. Define freshness and failure behavior per operation.

## Deployment is a mixed-version interval

Old and new workers coexist. Browser tabs remain open. Queued events and stored jobs can outlive the deployment that created them. Compatibility therefore includes database rows, messages, caches, and rollback code.

An expand-and-contract migration separates those concerns:

```text
Expand   → add a compatible new field/schema path
Migrate  → deploy writers/readers with an explicit truth rule; backfill safely
Observe  → verify completeness, old usage, query impact, and replication lag
Contract → remove old behavior after consumers and rollback windows expire
```

A column rename in one migration skips the overlap needed by old workers. An additive column with two unsynchronized writers also fails; define which representation is authoritative and whether synchronization is atomic or derived.

## Backfills must not overwrite newer user changes

Suppose a new normalized email column is derived from the existing email. A batch that reads an old value, pauses, and later writes its normalization can overwrite a newer user edit unless the update checks the version or computes from the current row atomically.

```sql
UPDATE customers
SET normalized_email = lower(email)
WHERE tenant_id = $1 AND id > $2 AND id <= $3
  AND normalized_email IS NULL;
```

This fragment computes from each current row during the update. It still needs a compatible write policy: every live email change must maintain `normalized_email`, and `lower()` must match the domain's actual normalization rule. Email identity rules are more subtle than lowercasing all possible addresses. The example illustrates safe write timing, not a universal email canonicalization policy.

Run batches with checkpoints, small transaction lifetimes, rate limits, and verification. A migration that executes in seconds on an empty development database may lock or rewrite a production table for much longer. Watch disk headroom and replica lag as well as request latency.

## Events and caches also evolve

An event should state a fact with stable meaning. Adding a field is easier than repurposing an existing one. Consumers need a strategy for unknown fields and enum values. A replay can expose old payloads years after their original publication if retention or archival allows it.

```json
{
  "event_id": "evt_91_paid",
  "event_type": "order.paid.v1",
  "aggregate_id": "91",
  "aggregate_version": 8,
  "data": {"total_minor": 25800, "currency": "USD"}
}
```

If a new representation changes cached value shape, include a schema revision in the key or implement tolerant readers. Do not deploy new code that assumes every existing cache entry already matches the new structure.

Rollback is safe only when old code can interpret data written by new code. Feature flags can separate release from activation, but a flag cannot undo an incompatible persisted mutation. Test rollback after representative new writes, not only immediately after boot.

## Cut over with observable evidence

A strangler migration can route a bounded set of operations to a new implementation while the old path remains available. Shadow reads compare results without making the new path authoritative. Shadow writes are much more dangerous because duplicate external effects can escape; use isolated or deliberately non-effecting evaluation.

Define correctness checks, latency and error thresholds, traffic cohorts, and the exact reversal procedure. Compare monetary totals, permissions, and ordering rather than only response schemas. Keep one write authority during cutover unless a carefully designed replication protocol establishes otherwise.

Good architecture preserves the ability to change safely. The review question is not how many services exist, but whether ownership, invariants, compatibility, and recovery remain clear when implementations overlap.
