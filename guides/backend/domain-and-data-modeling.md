# Domain rules, data models, and ownership

A backend protects business facts from invalid transitions. An order can be paid once, a reservation cannot consume unavailable stock, and an invoice must retain the price that was actually agreed. Domain modeling makes those facts and their owners explicit before a transport framework or database schema hides them.

Relational modeling arose to represent facts independently of a particular traversal through records. Constraints and transactions then let multiple applications safely share that model. Document and key-value models optimize other access patterns; the engineering task is to choose which facts belong together and which guarantees their updates need.

## Start with invariants and state transitions

An invariant must hold across every writer, including batch jobs and administrative scripts. Write it precisely enough to test. “Orders should be correct” is not useful; “a paid order's line prices and currency cannot be changed” is actionable.

This runnable state machine rejects unsupported transitions:

```python
TRANSITIONS = {
    "draft": {"submitted", "cancelled"},
    "submitted": {"paid", "cancelled"},
    "paid": {"refunded"},
    "cancelled": set(),
    "refunded": set(),
}

def transition(current, target):
    if current not in TRANSITIONS or target not in TRANSITIONS[current]:
        raise ValueError(f"invalid transition: {current} -> {target}")
    return target

assert transition("submitted", "paid") == "paid"
```

The function expresses policy, but concurrent callers can both pass a check against stale state. Persist the transition with an atomic condition on the observed state or version. Pure domain code and database concurrency control protect different parts of the same rule.

## Separate facts that change for different reasons

A catalog price describes what is offered now. An order line price describes an accepted transaction. A customer address book entry changes over time; an invoice's billing address is a historical record. Referencing only the current catalog or address record can silently rewrite history.

```sql
CREATE TABLE order_lines (
    tenant_id bigint NOT NULL,
    order_id bigint NOT NULL,
    line_no integer NOT NULL CHECK (line_no > 0),
    sku text NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price_minor bigint NOT NULL CHECK (unit_price_minor >= 0),
    currency text NOT NULL,
    PRIMARY KEY (tenant_id, order_id, line_no),
    FOREIGN KEY (tenant_id, order_id) REFERENCES orders (tenant_id, id)
);
```

This PostgreSQL fragment assumes an existing `orders` table with the referenced composite key. Storing agreed price here is intentional denormalization of a historical fact, not an accidental duplicate of current price. Store money with an explicit currency and rounding rule; integer minor units fit many payment domains, but instruments with variable precision may need a fixed-precision decimal model instead.

Normalization prevents update anomalies when several rows accidentally own the same mutable fact. Denormalization can reduce read work, but give each derived field an owner, update mechanism, and reconciliation path. A stored order total must be updated transactionally with its lines or rebuilt from them under a defined policy.

## Put constraints where every writer must obey them

Application validation gives good errors; database constraints prevent invalid committed states. Use `NOT NULL`, checks, unique keys, and foreign keys to encode what the database can enforce locally.

```sql
CREATE UNIQUE INDEX one_active_subscription
ON subscriptions (tenant_id, customer_id, product_id)
WHERE ended_at IS NULL;
```

The partial unique index prevents two active subscriptions even if requests race. Checking `SELECT ... WHERE ended_at IS NULL` before an unrestricted insert does not. Translate the known uniqueness conflict into a domain error rather than exposing an internal index name.

Not every invariant fits a row check. A limit across many rows, temporal overlap, or cross-service balance may need stronger transaction isolation, an exclusion constraint, explicit serialization, or a different ownership boundary. A check constraint that invokes mutable external behavior is not a substitute for a properly modeled relationship.

## Choose storage from access and correctness needs

Relational storage suits relationships, constraints, flexible queries, and atomic local changes. A document model can keep one aggregate together and tolerate evolving optional fields, but updating several documents may require additional transaction support or compensation. A key-value store is effective when access is dominated by known keys and the consistency contract fits. Object storage handles large immutable blobs economically; keep searchable metadata and lifecycle state elsewhere.

```text
Authoritative order state     → transactional relational store
Uploaded invoice PDF         → object store with stable object identity
Searchable order projection  → search index rebuilt from authoritative facts
Frequently read public price → cache with an explicit freshness policy
```

These are roles, not a requirement to introduce four systems on day one. PostgreSQL plus object storage often covers the initial workload. Adding a specialized system creates synchronization, backup, deletion, access-control, and on-call responsibilities.

## Ownership determines the transaction boundary

One owner should decide whether a business transition is valid. Other modules consume that decision or maintain projections. A shared database does not justify allowing every service to update every table. Conversely, splitting an invariant across services before understanding its transaction boundary makes correctness harder for little benefit.

A handler should parse the request and translate errors. A use-case function coordinates the transition and transaction. Queries should remain visible enough to reason about locking and performance. An abstraction that conceals five database round trips behind `order.save()` can make an apparently clean architecture operationally opaque.

Choose boundaries by changes and invariants: who owns the fact, who may mutate it, what must commit together, and how others learn about it. Those answers remain useful when the implementation grows from one process to several services.
