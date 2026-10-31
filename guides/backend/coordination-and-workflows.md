# Coordination, leases, and durable workflows

Some operations need an exclusive authority: one scheduler should advance a job, one writer should own a partition, or one checkout workflow should transition a payment. Coordination systems make that authority explicit despite crashes and network delays. A lock name is only the beginning; the system must also prevent a former owner from continuing after its ownership expires.

Durable workflows address a related problem at a longer timescale: remembering progress and recovering a multi-step operation whose dependencies do not share one transaction.

## A lease can expire while its owner is alive

A lease grants ownership for a limited interval. The owner may pause for garbage collection, lose network access, or stall in the kernel. Another worker acquires the lease after expiry. When the first worker resumes, both processes may believe they should write.

```text
A acquires lease, token 41
A pauses longer than the lease duration
B acquires lease, token 42 and writes
A resumes and attempts its delayed write with token 41
```

Renewal does not eliminate the pause between checking a lease and performing an external effect. A distributed lock is therefore insufficient when stale owners can damage authoritative state.

## Fencing makes ownership enforceable

A fencing token increases for each new owner. The protected resource stores the newest accepted token and rejects writes carrying an older one. The resource must participate; a token attached to logs or held only in the client protects nothing.

This runnable model shows stale-owner rejection after a newer owner has reached storage:

```python
class FencedValue:
    def __init__(self):
        self.highest_token = 0
        self.value = None

    def write(self, token, value):
        if token < self.highest_token:
            raise ValueError("stale owner")
        self.highest_token = token
        self.value = value

resource = FencedValue()
resource.write(42, "new owner's result")
try:
    resource.write(41, "delayed old result")
except ValueError:
    pass
assert resource.value == "new owner's result"
```

The real update of token and value must be atomic. Equal tokens here allow multiple writes by the current owner; if individual operations also need deduplication, add operation IDs or versions. A newer lease being issued does not by itself update a remote resource's fence: the storage design must establish the intended ownership barrier.

When the protected system is a relational database, a conditional row update or local transaction is often simpler than a separate distributed lock. Use a coordination service when several machines truly need shared membership, leader election, or lease ownership, and understand its quorum and session semantics.

## Consensus establishes one ordered authority

Consensus protocols allow a group to agree on a sequence of decisions despite supported failures. A leader commonly coordinates proposals, and a quorum establishes commitment. A node that cannot contact a quorum may need to stop accepting writes to preserve the guarantee.

This is not a promise that every application action becomes strongly consistent automatically. The application must route decisions through the consensus-backed state and enforce those decisions at downstream resources. Slow disks, election churn, and overloaded control planes can affect availability even when data-plane workers are healthy.

Avoid placing high-volume business data in a coordination store merely because it supports reliable compare-and-set. Keep its workload bounded and use it for the control decisions it was sized to handle.

## A workflow persists decisions between steps

Consider checkout: reserve inventory, authorize payment, confirm the order, and send a receipt. A process can crash between any two steps. A durable workflow records state transitions and stable activity identities so another worker can resume or reconcile.

```text
created → stock_reserved → payment_authorized → confirmed
                    ↘ payment_declined → stock_release_pending → cancelled
                    ↘ payment_unknown  → reconciliation_pending
```

Unknown is a necessary state. A payment timeout is not the same as a decline. Retrying with a fresh operation ID can charge again; releasing inventory immediately may conflict with a charge that already succeeded. Resolve provider state under the original operation ID and continue from evidence.

Store the workflow transition and its next durable intent together:

```sql
BEGIN;
UPDATE checkouts
SET state = 'payment_authorization_pending', version = version + 1
WHERE tenant_id = $1 AND id = $2
  AND state = 'stock_reserved' AND version = $3
RETURNING version;
-- Require one returned row before adding the next intent.
INSERT INTO outbox (event_id, tenant_id, aggregate_id, event_type, payload)
VALUES ($4, $1, $2, 'payment.authorize.v1', $5);
COMMIT;
```

This integration fragment assumes the workflow and outbox schemas. A production implementation must not insert the intent when the conditional transition returned no row. A stored procedure or application transaction can enforce that control flow.

## Compensation is a new operation

A saga coordinates local transactions using compensating actions when later steps fail. Compensation is not time travel: refunding a captured payment leaves an audit trail, may incur fees, and may itself fail. Sending a cancellation email cannot make the recipient forget a previous confirmation.

Define which steps are reversible, which require human review, how long recovery may take, and who owns the terminal state. Compensations need their own idempotency keys and retries. A workflow stuck between “refund requested” and “refund confirmed” must remain visible to operators.

Two-phase commit can provide atomic commitment across supported participants but introduces coordinator recovery, blocking and availability considerations, and operational coupling. Choose it when the systems and invariant justify that contract; do not simulate it with a series of HTTP calls and a boolean flag.

Test workflow history replay, duplicate callbacks, expired leases, workers resuming after long pauses, and manual repair. The design is trustworthy when a new worker can explain exactly what is known and what must be reconciled after every crash boundary.
