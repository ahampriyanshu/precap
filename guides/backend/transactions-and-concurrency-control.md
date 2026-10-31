# Transactions, MVCC, and concurrency control

A transaction makes a group of changes atomic. Isolation determines how concurrent transactions interact. These are separate properties: wrapping a read and a later write in a transaction does not automatically make the read-current-and-write-later pattern safe.

Concurrency control exists because the validity of a decision depends on what other writers can do between observation and commit. Choose a mechanism from the invariant, then test the conflicting schedule explicitly.

## The last-unit race

Suppose stock is one and two buyers each request one unit. Both handlers read `available = 1`, both approve, and both write a new order. Writing `available = 0` afterward does not reveal that two units were sold. The issue is a decision based on an observation that did not reserve anything.

![Two transactions read the same stock value; a conditional database update serializes reservation and prevents the second buyer from consuming unavailable stock.](/diagrams/backend-transactions.svg)

For a single-row bound, combine condition and mutation:

```sql
BEGIN;
UPDATE inventory
SET available = available - $3
WHERE tenant_id = $1 AND sku = $2
  AND $3 > 0 AND available >= $3
RETURNING available;
-- Continue only if exactly one row was returned.
-- Insert the order and reservation in this same transaction.
COMMIT;
```

At PostgreSQL Read Committed, an updating statement can wait for a concurrent updater, then re-evaluate its condition against the updated row. The second buyer finds no matching row after stock reaches zero. A missing SKU and insufficient stock both return zero rows; distinguish them only if the API needs that information and the distinction is authorized.

This guarantee is local to the affected row and transaction. Reserving several SKUs requires consistent lock order or transaction retries. Do not reserve stock and then make a slow payment-network call while holding those row locks. A reservation state with expiry and reconciliation is usually a better boundary.

## MVCC gives readers a snapshot

Multiversion concurrency control retains versions so a reader can observe a consistent view without blocking every writer. PostgreSQL Read Committed uses a new snapshot for each ordinary statement. Two SELECTs in one transaction can therefore observe different committed states. Repeatable Read keeps a snapshot from the first non-control statement, while still allowing changes from the transaction itself to be seen.

Snapshot consistency does not prove business serializability. Consider two doctors, at least one of whom must stay on call:

```text
Initial: A=on, B=on
T1 reads both on; plans A=off
T2 reads both on; plans B=off
T1 writes A=off and commits
T2 writes B=off and commits
Result: nobody is on call
```

The writers updated different rows. Snapshot isolation can allow this write skew even when it prevents lost updates to one row. PostgreSQL Serializable detects dangerous dependency structures and can abort a transaction. Applications must retry the whole transaction using a new snapshot; retrying only the failed statement does not recreate the original decision safely.

## Pick the smallest reliable mechanism

Use an atomic conditional update when the invariant fits one update. Use uniqueness or exclusion constraints when the database can express the prohibited state. Use explicit locks when a known set of records must be read and changed consistently. Use Serializable when correctness spans predicates or several records and the retry cost is acceptable.

```sql
SELECT id, available
FROM inventory
WHERE tenant_id = $1 AND sku = ANY($2)
ORDER BY sku
FOR UPDATE;
```

All code paths must follow the same lock ordering to reduce deadlocks. A deadlock victim still needs bounded whole-transaction retry. Locking existing rows does not lock an absent row; use a unique constraint or appropriate isolation when preventing two concurrent creations.

PostgreSQL Serializable's predicate locks track dependencies rather than acting as ordinary blocking range locks. Do not infer its behavior from a different database's isolation-level name. Isolation labels do not guarantee identical implementations across engines.

## Optimistic version checks protect stale edits

A user can keep a form open while another user changes the same record. Holding a database transaction open throughout the form session is impractical. Compare the submitted observed version atomically:

```sql
UPDATE projects
SET name = $4, version = version + 1
WHERE tenant_id = $1 AND id = $2 AND version = $3
RETURNING id, name, version;
```

No returned row means missing, unauthorized, or a stale version depending on earlier scoped checks. Return a conflict or failed precondition and let the UI reconcile. Silently applying a stale representation can overwrite fields the first editor never intended to change.

Optimistic locking works well when conflicts are uncommon and retry or merge is meaningful. For a highly contended counter, repeated optimistic retries can waste work; a direct increment or redesigned hot state may be better.

## Commit uncertainty survives transactions

A database connection can fail after COMMIT reached the server but before the application received confirmation. The caller does not know whether the mutation happened. Treating every exception as a guaranteed rollback can duplicate an operation on retry.

```text
client sends mutation
database commits
network drops the commit response
caller times out

Local observation: unknown outcome
Database state: already changed
```

Use an operation identifier or idempotency receipt to resolve that ambiguity. A database transaction cannot atomically commit a remote email or payment request unless the external system participates in a suitable protocol. Persist intent with local data, then perform the remote effect with deduplication and reconciliation.

## Test schedules, not sleeps

Use separate database connections and explicit barriers: both transactions finish their initial reads before either writes. Assert final invariants, returned conflicts, and retry behavior. A test using one connection serializes work accidentally; a test using arbitrary sleeps can pass without hitting the race.

Also exercise serialization failures, deadlocks, connection loss around commit, cancelled statements, and a long-lived transaction holding old versions. Correctness depends on the complete lifetime of the transaction, including error cleanup and pool return.
