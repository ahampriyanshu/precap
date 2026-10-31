# Streams and lazy evaluation

## A stream describes traversal

A Stream is not a collection. Intermediate map/filter operations build a lazy pipeline; a terminal operation drives it. Without a terminal operation, a side effect inside map may never execute. Terminal operations can short-circuit, and optimizations may skip work that is irrelevant to the result. Use peek for diagnostics, not required business effects. A stream is single-use: consuming it and then running another terminal operation raises IllegalStateException.

```java
var seen = new java.util.concurrent.atomic.AtomicInteger();
var pipeline = Stream.of(1, 2, 3).filter(x -> { seen.incrementAndGet(); return x > 1; });
assert seen.get() == 0;
assert pipeline.findFirst().orElseThrow() == 2;
assert seen.get() == 2;
```

Encounter order and sorted order differ. findFirst preserves an ordered source's first match; findAny permits another result, especially in parallel execution. sorted and distinct can retain significant state, so a lazy pipeline is not automatically constant-memory. Primitive streams avoid boxing when manipulating numeric values. A collector's mutable result container must not be shared improperly across parallel workers.

## Parallelism needs a valid reduction

A reduction must have an identity and associative combination compatible with its accumulation. Subtraction is not associative, and mutating one shared ArrayList from parallel forEach is a race. Parallel streams use an execution facility with its own contention and scheduling behavior; they are not a universal throughput improvement, especially for blocking work or small inputs. Measure the full workload before changing execution mode.

Streams backed by resources need explicit closure. A terminal operation does not itself guarantee close; try-with-resources does. onClose handlers run when the stream is closed, including after predicate failure if the owner closes correctly. This exercise requires sequential ordered traversal so the exact predicate call count is part of its contract.

## Practice

**Prototype:** `firstPositive(List<Integer>) -> OptionalInt` returns the first value >0 in encounter order or empty. Preserve list.

**Final:** `firstMatching(Stream<Integer>,Predicate<Integer>) -> OptionalInt` takes ownership of an ordered stream, forces sequential processing, and returns the first matching integer. Invoke the predicate exactly once on each visited value and never on values after the first match. Close the stream exactly once on success, exhaustion, or predicate failure. Propagate predicate exceptions unchanged; do not materialize the full stream. Null values outside domain.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
