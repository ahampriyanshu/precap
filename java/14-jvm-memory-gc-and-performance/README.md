# JVM memory, GC, and performance

## Reachability decides retention

The JVM stores objects and arrays in the managed heap. Thread stacks hold frames/local values; compiled code, metadata, native buffers, and thread stacks also contribute to process memory outside ordinary heap usage. A reference reachable from a GC root can keep a large graph alive. An old map entry, listener, ThreadLocal, or executor queue can therefore retain memory even when application code considers the work finished.

Garbage collectors reclaim unreachable objects; they do not enforce an application cache budget. A strong cache retains its keys/values until eviction or clearing. Weak references allow reclamation when no strong path remains, but make presence depend on GC timing and are unsuitable when predictable cache capacity matters. Memory leaks in managed code are often unwanted reachability, rather than a missing free call.

```java
byte[] original = {1, 2};
byte[] snapshot = original.clone();
original[0] = 9;
assert snapshot[0] == 1;
```

Copying mutable buffers enforces ownership but adds allocation and copy cost. Sharing immutable data can avoid those copies when the API can establish immutability. List/map object overhead, boxing, alignment, and retained subgraphs mean payload byte counts are not total JVM footprint. This exercise budgets payload bytes explicitly; it does not pretend to estimate exact heap size.

## Diagnose before changing representation

Allocation rate and retained heap are different measurements: a short-lived allocation burst can increase GC work without retaining much, while a slowly growing cache can retain more every hour. Inspect heap histograms/dumps and allocation profiles, using tools such as jcmd/JFR available with the JDK, to identify owners and lifetimes. Do not use System.gc as a correctness mechanism or assert that GC ran at a particular time.

JIT compilation, warmup, dead-code elimination, constant folding, and escape analysis can distort ad hoc timing loops. Use a proper microbenchmark harness such as JMH when measuring a small operation, then validate end-to-end effects under realistic load. Report latency distributions, throughput, allocation, and GC behavior as appropriate. An optimization that lowers allocations by exposing writable internals may violate a more important ownership contract.

## Practice

**Prototype:** `copyBuffer(byte[] input) -> byte[]` returns an independent array with identical bytes, including empty input.

**Final:** implement nested ByteCache(long byteBudget), requiring budget>=0, with get/put/remove/usage/clear. Keys are nonnull nonempty strings, values nonnull byte arrays; invalid key raises IllegalArgumentException before mutation. `put(key,value)` returns false unchanged when value.length>budget. Otherwise clone value, replace existing entry, refresh recency, and evict least-recent entries until payload usage<=budget; return true. Zero-length arrays are valid even at budget zero. `get(key)` returns null on miss, otherwise a new buffer copy and refreshes recency. `remove(key)` returns whether present and releases bytes once. `usage()` sums retained payload lengths; clear empties all entries and sets usage zero. Each instance owns its entries; payload budget excludes object overhead.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
