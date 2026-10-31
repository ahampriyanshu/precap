# Threads, locks, and visibility

## A race is a missing ordering guarantee

Threads share heap objects. A read-modify-write such as count++ reads, adds, then writes; two workers may read the same old value and lose one update. Declaring count volatile makes individual reads/writes visible but does not make that compound operation atomic. An AtomicLong increment or a lock around the full invariant is required. A lock protecting one field is insufficient when multiple fields must change together.

```java
var count = new AtomicLong();
count.incrementAndGet();
assert count.get() == 1;
```

The Java Memory Model defines happens-before relationships. Actions before Thread.start happen before that worker begins, and a worker's actions happen before another thread successfully returns from join. Unlocking a monitor happens before a later lock of that monitor; volatile publication also creates ordering. Timing, sleep, and observing a value once are not substitutes for those guarantees. Safely published immutable data can often avoid further locking.

## Lock ownership is a protocol

`synchronized` acquires an object's monitor, releasing it on normal return and exceptions. ReentrantLock supports features such as interruptible acquisition, but requires unlock in finally. Choose a stable private lock instead of a public value that unrelated code might also synchronize on. Acquire multiple locks in one consistent order to avoid deadlock, and avoid holding a lock while calling unknown or blocking code.

Thread.join is coordination: the caller must wait for completion before reporting the shared result. Child-thread exceptions do not automatically propagate to the parent; designs that run arbitrary work need an explicit error channel or futures. Interruption is cooperative cancellation, not forced termination. A method declaring InterruptedException should normally propagate it; code that cannot propagate should restore the interrupt flag when handing cancellation upward. The tests use bounded worker counts and no sleeps, so correctness cannot depend on a lucky scheduler.

## Practice

**Prototype:** `incrementSequential(int increments) -> long` starts a local counter at zero and increments it increments times. Negative increments raise IllegalArgumentException; zero returns zero.

**Final:** `incrementConcurrent(int workers,int increments) -> long throws InterruptedException` requires workers>0 and increments>=0 before starting threads. Start workers platform threads, each performing increments increments on one shared counter using a correct atomic or locking protocol, join all, and return the exact product. No global state, sleeps, or busy waiting; zero increments is valid. Inputs in tests are small enough to finish promptly. If the caller is interrupted, interrupt and join started workers before propagating InterruptedException.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
