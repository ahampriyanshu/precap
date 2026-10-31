# Deadlines, retries, and idempotent operations

Networks fail ambiguously. A caller may stop waiting while the receiver continues and commits. Reliability mechanisms were introduced to make useful progress despite that uncertainty: deadlines bound waiting, retries handle selected transient failures, and idempotency ties repeated attempts to one logical operation.

These mechanisms work together. Retrying without limits amplifies overload; a deadline without cancellation wastes resources; deduplicating a request without checking its meaning can replay the wrong result.

## Budget the whole operation

A timeout usually limits one wait. A deadline states when the entire operation stops being useful. Allocate time for admission, connections, dependency calls, serialization, and a response margin. A 500 ms user budget cannot safely contain three serial calls each allowed 500 ms.

```text
End-to-end budget: 600 ms
Admission/connect allowance: up to 80 ms
Dependency interval:         remaining time minus response margin
Response margin:             40 ms

At t=350 ms, only 250 ms remains. A retry cannot receive a fresh 600 ms.
```

Use monotonic time for local elapsed budgets. Propagate remaining deadlines in a supported protocol rather than assuming identical wall clocks. Configure separate connection and response/read limits where the client distinguishes them. A streaming read timeout can be an idle interval, not a total operation timeout; understand the library's actual contract.

Cancellation reduces useless work but does not roll back a committed remote effect. A timed-out charge needs outcome reconciliation, not an assumption that no money moved.

## Retry only when another attempt can help

Retry selected transient failures under an operation's safety contract. Validation errors, denied access, and insufficient stock normally need a different request. A network reset may be transient but leaves mutation outcome uncertain.

This executable example demonstrates a bounded retry budget for a deliberately idempotent operation:

```python
import asyncio
import random
import time

class TransientFailure(Exception):
    pass

async def retry_idempotent(operation, budget=0.4, attempts=3):
    deadline = time.monotonic() + budget
    for attempt in range(attempts):
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise TimeoutError("operation budget exhausted")
        try:
            async with asyncio.timeout(remaining):
                return await operation()
        except TransientFailure:
            if attempt + 1 == attempts:
                raise
            delay = random.uniform(0, min(0.02 * 2**attempt, 0.10))
            if delay >= deadline - time.monotonic():
                raise TimeoutError("no budget for another attempt")
            await asyncio.sleep(delay)

async def main():
    async def read_value():
        return 42
    assert await retry_idempotent(read_value) == 42

asyncio.run(main())
```

The example intentionally does not retry every exception. Real client adapters must map eligible statuses and transport failures, honor meaningful server retry hints within the remaining budget, and record attempts separately from logical operations. Jitter reduces synchronized retries; it does not create capacity.

Choose one retry owner where possible. Three attempts at three nested layers can generate 27 calls to the deepest dependency. Limit retry traffic as a proportion of useful initial traffic. Hedged reads can reduce tail latency for selected read workloads, but duplicate work and require independent capacity; they can worsen overload.

## A receipt must commit with the mutation

For order creation, an idempotency key names one operation within an explicit scope and retention window. The server stores a request digest and replayable result under a unique key. Concurrent attempts coordinate through storage, not a preliminary cache check.

```sql
CREATE TABLE operation_receipts (
    tenant_id bigint NOT NULL,
    actor_id bigint NOT NULL,
    operation text NOT NULL,
    key text NOT NULL,
    request_digest text NOT NULL,
    response jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, actor_id, operation, key)
);
```

This is a schema fragment; the response may need status, selected headers, and a durable resource identifier. Normalize permitted input before hashing, including defaults and relevant operation version. The same key with a different digest is a conflict, not another operation.

```pseudocode
authenticate and authorize the command
BEGIN
  claim a unique scoped receipt as part of this transaction
  if another committed receipt owns the key:
    compare the digest; reject mismatch; otherwise load its result
  else:
    perform the local business mutation
    complete the receipt with its replayable result
COMMIT
return the result
```

The claim and completed result need a transaction design consistent with the schema; a separate permanently committed placeholder needs explicit lease and recovery rules. A unique conflict can wait for an in-flight transaction, which then commits or aborts. After a competing commit, load its result with the database's defined snapshot behavior. Do not return success before the business transaction commits.

Keep receipt retention longer than the supported retry window. Expiry permits the same key to become a new operation, so clients and operators must understand that boundary. A replay should still enforce current access to the result. Large response bodies, personal data retention, and key abuse need limits.

## External effects need their own operation identity

Writing an order and a receipt in one database does not make an external payment atomic. Persist a durable intent, call the provider using a stable operation key, and reconcile uncertain outcomes. A provider callback can arrive before the synchronous response or arrive more than once. Model payment state transitions so both paths converge safely.

If the remote system offers no idempotency or outcome lookup, automatic retries may be unsafe. Escalate ambiguous operations to reconciliation instead of pretending local bookkeeping establishes exactly-once execution remotely.

## Breakers and bulkheads protect recovery

A circuit breaker stops repeatedly calling a failing dependency for a bounded interval, then probes recovery. Its thresholds should reflect an appropriate population and avoid mixing unrelated tenants or operations. It reduces wasted calls but cannot replace admission control.

A bulkhead allocates separate concurrency or pools to workloads so a slow export or optional recommendation service does not consume all checkout capacity. Fallbacks must preserve meaning: an unavailable recommendation can disappear; an unavailable authorization service must not grant access.

Measure logical success, attempt amplification, deadline exhaustion, uncertain outcomes, and time spent waiting for a breaker or pool. Reliability is useful completion under failure, not merely a higher retry count.
