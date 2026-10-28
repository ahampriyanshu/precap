# Rate Limiter

## The problem

A rate limiter decides whether a client may perform another operation. In this lesson, each client may receive at most a configured number of accepted requests in a moving time window. Different clients have independent allowances. Rejected requests do not consume allowance.

Time is part of the interface rather than a hidden call to the system clock. Every request supplies an integer timestamp. That choice makes boundary behavior reproducible and makes tests fast: no sleeping is needed to demonstrate expiration.

## Naive approach

A simple counter resets at fixed boundaries, such as every ten seconds. It uses little state and is easy to implement. However, allowing two requests just before a boundary and two just after it permits four requests in a very short interval, even if the intended limit is two per moving ten seconds.

A fixed-window bucket grants independent budgets on either side of a boundary:

```python
window = 10
accepted = [9, 9, 10, 10]
buckets = [timestamp // window for timestamp in accepted]
print(buckets)
assert buckets == [0, 0, 1, 1]
assert len([t for t in accepted if 0 < t <= 10]) == 4
```

Each fixed bucket obeys a limit of two, but the moving interval ending at 10 contains four accepted requests. The two policies are observably different.

A better prototype filters a list of accepted timestamps, discards expired ones, and checks its length before appending the current request. That function explains the policy clearly. A complete object must also own histories per client and enforce consistent time progression across calls.

## Where the naive approach breaks

One global history makes one client's traffic block everyone else. Counting rejected requests extends a penalty each time the client retries, which is a different policy. Retaining timestamps exactly on the expiration boundary creates an off-by-one error in when the next request may succeed.

Backward timestamps are another problem. If history was already expired at time 20, accepting a later call labeled time 5 cannot reconstruct the earlier state. Sorting the new timestamp into the list hides the inconsistent clock instead of resolving it. A method that returns the internal history can also let a caller restore expired allowance or manufacture accepted requests.

## A better design

Give `SlidingWindowLimiter` ownership of a history and latest observed timestamp for each client. Define the active interval precisely as `(now - window, now]`: timestamps equal to the left boundary are expired. Reject invalid arguments and time moving backward for that client before changing state. Equal timestamps are valid because several requests can arrive in one tick.

The expiration boundary can be expressed independently of client bookkeeping:

```python
from collections import deque

history = deque([0, 0, 9])
now, window = 10, 10
while history and history[0] <= now - window:
    history.popleft()
print(list(history))
assert list(history) == [9]
```

Only 9 remains in `(0, 10]`. The example isolates expiration; accepting a request still requires the per-client limit check and monotonic-time validation in the same serialized operation.

On a valid call, discard expired accepted timestamps. Accept only if fewer than `limit` remain, appending `now` on success. A denial records the observed time and performs expiration housekeeping, but adds no request. The invariant is that retained timestamps are ordered, lie within that client's current active window, and number at most `limit`.

A deque supports appending and expiring timestamps efficiently. One call may remove up to `limit` timestamps, but each accepted timestamp is appended and removed once, so housekeeping is amortized O(1) per call for a client. Storage is O(limit) per remembered client. A snapshot requires copying that client's retained history.

## Real-world usage

Sliding windows are useful for request quotas, retry limits, and protecting costly operations. They preserve bursts up to the configured limit; they do not evenly space requests. A token bucket expresses different refill and burst behavior. A distributed service also needs agreement across workers, a trustworthy time source, and atomic updates. Idle-client cleanup matters because remembered clients can grow without bound. This exercise models serialized local decisions, without network communication or automatic client eviction.

## Practice

All timestamps and numeric settings are integers excluding booleans. `limit` and `window` must be positive; `now` must be nonnegative. Invalid values raise `ValueError` before mutation. Time units are arbitrary but must be consistent.

**Prototype:** implement `allow_request(recent, limit, window, now)`. `recent` is a list of previously accepted nonnegative timestamps, in nondecreasing order and no later than `now`; duplicates are valid. Invalid histories raise `ValueError`. Return `(allowed, new_history)`, filtering to timestamps strictly greater than `now - window`, then appending `now` only when the filtered length is less than `limit`. Do not mutate `recent`; it may contain more than `limit` entries, in which case deny while retaining all unexpired entries.

**Final:** implement `SlidingWindowLimiter(limit, window)`. `allow(client_id, now)` returns a boolean using the same active interval. Client identifiers are nonempty strings; invalid identifiers raise `ValueError`. A client's timestamps must never move backward, including after a denial; backward calls raise `ValueError` and leave history and observed time unchanged. Different clients may supply unrelated timestamps. Denials add no accepted timestamp but advance that client's observed time. `history(client_id)` returns a fresh list of accepted timestamps retained after the client's most recent valid `allow` call; it does not advance time or expire anything. An unseen valid client returns `[]`. Keep instances independent.

Run `python main.py --stage prototype`, then `python main.py --stage final`. Default stage is `final`. Edit `exercise.py`; leave `main.py` unchanged.
