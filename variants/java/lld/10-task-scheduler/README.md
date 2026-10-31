# Task Scheduler — Java

## Ownership and transitions

Priority order and lease ownership are distinct. A task returns to pending exactly at expiry; every reassignment receives a new token, so an old completion cannot finish a newer lease. Valid timed calls expire leases before answering even when the requested action fails. Validate duration before advancing time. A simple scan costs O(tasks) per dispatch/expiry; heaps can improve selection but require stale-entry checks.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

A task ID identifies work; a lease token identifies one assignment of that work. Reusing the task ID does not authorize an old completion:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        record Lease(long taskId, long token, long expiresAt) {}
        Lease first = new Lease(1, 7, 3);
        Lease reassigned = new Lease(1, 8, 6);
        assert first.taskId() == reassigned.taskId();
        assert first.token() != reassigned.token();
        assert first.expiresAt() <= 3;
    }
}
```

At timestamp 3 the first lease is expired, and its token cannot finish the reassigned task. Expiration reclaims worker capacity before the next valid timed operation is answered.

## Design boundary

Priority ties use numeric IDs rather than lexically sorted ID strings. Unknown-worker dispatch is still a valid timed call and advances time; invalid lease duration does not. This scheduler records ownership and completion, but does not execute task code or provide distributed fencing outside its own state.

## Practice

**Prototype:** PriorityQueue.add(name,priority) returns increasing IDs starting 1; pop removes highest priority then smallest ID as TaskItem, or null. Duplicate names/negative priorities are valid.

**Final:** TaskScheduler.addTask uses the same IDs/order. addWorker requires positive capacity and preserves existing capacity on duplicate. dispatch(ts,worker,lease) requires positive lease before time validation, expires leases, enforces worker quota, and returns Task or null. Successful global lease tokens start 1, failures consume none. complete(ts,id,token) succeeds only for the current unexpired running lease, then clears metadata and marks done. getTask/active also expire first; active is ID sorted. All timed methods require nonnegative nondecreasing ts; valid failures advance time, invalid requests do not. Expiry is `expiresAt <= ts`; pending/done metadata is null.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
