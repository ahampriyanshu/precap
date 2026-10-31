# Ticket Booking System

## The problem

A ticketing system lets users browse an event, hold a set of seats briefly, and pay without selling the same seat twice. Assume an event has 50,000 seats and one million visitors arrive within five minutes. That is about 3,333 visitors per second before refreshes and retries. If each visitor makes four availability reads, read traffic exceeds 13,000 requests per second, while no more than 50,000 seats can ultimately be sold. Protecting scarce inventory matters more than accepting every request immediately.

Requirements include all-or-nothing holds for a requested seat bundle, explicit expiry, retry-safe payment handling, and a clear outcome when payment succeeds after expiry. Browsing can tolerate slightly stale availability; ownership cannot. The design should remain understandable when the payment provider is slow, callbacks are duplicated, or the booking process crashes between steps.

## Naive approach

A read-then-charge-then-update flow lets multiple workers observe the same availability. Reserving a bundle one seat at a time can also leave a partial hold:

```pseudocode
read seat A -> available
read seat B -> available
charge_payment()
mark seat A sold
# Another transaction already claimed B; this update fails.
mark seat B sold
```

The customer may be charged while owning only part of the request. An application timer does not repair this atomicity problem, and restart can erase in-memory expiry state.

## Where the naive approach breaks

Suppose a hold expires at 10:05. Another customer holds the seats at 10:05:01, and the first customer's successful payment callback arrives at 10:05:02. A callback that blindly sets the original booking to confirmed steals the new customer's inventory. Ignoring the callback loses track of money that must be refunded or otherwise reconciled.

A client timeout does not prove that a payment failed. Retrying with a fresh provider request can charge twice. Even a provider that supports idempotency can deliver the same callback repeatedly. At the database boundary, locking one seat and then another in inconsistent order can deadlock competing bundle requests. Slow payment calls made while database locks are held turn a provider slowdown into inventory exhaustion.

## A better design

Establish a temporary owner in a short inventory transaction; coordinate payment separately.

```text
Client -> Waiting room / Booking API -> Inventory database
Booking API -> Payment provider -> Verified callback handler
Inventory database -> Outbox / reconciliation workers
```

Partition inventory by event so bundles share one transaction boundary. Seat rows contain owner, state, expiry, and version; holds bind user, seats, price, and status. Cross-event bundles need different coordination.

A PostgreSQL transaction locks the bundle:

```sql
BEGIN;
SELECT seat_id, state, owner_hold_id, expires_at
FROM seats
WHERE event_id = $1 AND seat_id = ANY($2)
ORDER BY seat_id
FOR UPDATE;
-- Application verifies every requested row and its current eligibility.
-- ROLLBACK on any missing/ineligible seat; otherwise continue below.
UPDATE seats SET state = 'held', owner_hold_id = $3, expires_at = $4
WHERE event_id = $1 AND seat_id = ANY($2);
COMMIT;
```

Bind an event and deduplicated seat-ID array. Seat IDs are immutable; every inventory writer follows this locking protocol. After locks are acquired, compare expiry using the authoritative clock and calculate the new hold boundary. Validation, hold creation, and request-key deduplication must remain in this transaction; they are omitted from the fragment. Never run a provider call while these locks are held. Handle aborted transactions with bounded retries.

`POST /events/{id}/holds` includes a stable request key. Matching retries return the original hold without extending expiry. Browsing may use caches or replicas with freshness indicators; successful ownership comes from the inventory authority. A sweeper accelerates expiry cleanup, but ownership-changing operations must check expiry themselves.

Payment uses a stable provider idempotency key. A verified callback records a unique provider event, validates amount and hold association, then conditionally confirms only an unexpired hold still owning every seat. If payment succeeds after expiry or lost ownership, record a compensation obligation and enqueue a refund through an outbox. Duplicate callbacks cannot confirm or refund twice.

The provider cannot share the inventory transaction. Reconciliation recovers unknown charge outcomes, missing callbacks, and failed refunds; refund commands need their own retry identity. A waiting room bounds hot-launch load. Authenticate holders and callbacks, cap active holds, and measure contention, expiry lag, callback delay, refund backlog, and reconciliation discrepancies.

## Real-world usage

Concert seating, travel reservations, and appointment slots share temporary ownership followed by an external confirmation step. Their cancellation and payment rules differ, so those policies belong in explicit state transitions.

## Practice

### Design brief

Design booking for a 50,000-seat event receiving one million visitors in five minutes. Four availability reads per visitor imply more than 13,000 reads per second. Require all-or-nothing temporary holds for seat bundles, explicit expiry, and retry-safe payment handling. Browsing may be slightly stale; seat ownership cannot conflict. Define hold duration, admission policy, and the outcome of payment arriving after expiry.

### Draw and explain

Use Excalidraw to label browsing, authoritative inventory, hold ownership, payment records, provider boundaries, and reconciliation. Draw a hold-to-confirmation state diagram and the associated request flows. Mark transaction and acknowledgement boundaries, trusted expiry time, request identities, and compensation obligations. Explain which work scales with visitors and which work contends on the hot event's scarce seats.

### Stress the design

Two users request overlapping multi-seat bundles. Trace how each gets a complete result without holding inventory locks while waiting on payment. Then let a hold expire, another user acquire its seats, and the original payment succeed late. Draw the recorded outcome, duplicate callback handling, and recovery if the process crashes before refund work is scheduled.

### Review your design

Compare short holds with checkout tolerance and compensation volume. Explain waiting-room fairness, stale seat maps, and event partitioning. Check callback authenticity, stable payment identity, cleanup lag, and uncertain provider outcomes. Choose signals for contention, conversion, callback delay, refund backlog, and money/inventory disagreement.
