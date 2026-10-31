# Control flow and arrays

## Make the loop's state explicit

Conditions require boolean expressions; Java does not convert numbers or references to truth values. `&&` and `||` short-circuit, so a guard can protect a dereference or array access. `&` and `|` on booleans evaluate both sides. `switch` expressions yield a value and must cover every possible input through cases or a default; statements can still be useful when dispatch performs effects.

```java
String text = null;
boolean nonempty = text != null && !text.isEmpty();
assert !nonempty;
```

A useful loop invariant describes the prefix already processed. In a scan for contiguous runs, the active start is either absent or the beginning of a run whose every element satisfies the predicate. End that run once when the predicate fails, then handle a final run at the array boundary. Treating boundaries as half-open [start,end) makes run length end-start and allows end==array.length.

## Arrays and ownership

Arrays have fixed length and reified component types; primitive arrays store primitives without boxing. ArrayList grows and stores references. An enhanced for loop gives values, so assigning its loop variable does not replace an array cell. Use an index loop when position is part of the result. `Arrays.copyOf` or clone copies a one-dimensional primitive array; copying an array of object references does not clone those objects.

```java
long[] original = {3, 5};
long[] snapshot = original.clone();
snapshot[0] = 99;
assert original[0] == 3;
```

Array bounds failures are exceptions, not sentinel values. A common off-by-one bug reads values[end] after the last valid index. Another records a run at every matching element, producing overlapping fragments instead of maximal runs. Prefer a small amount of explicit state over flags that can contradict one another. A single scan should cost O(n) with workspace proportional to returned runs.

## Practice

**Prototype:** `countAbove(long[] values,long threshold) -> int` counts values strictly greater than threshold without mutation.

**Final:** `runsAbove(long[] values,long threshold) -> List<Range>` returns maximal nonempty contiguous runs strictly above threshold as Range(start,end) with half-open indices, in order. Empty input yields empty, equality to threshold ends a run, and a run reaching the final cell has end==length. Return fresh results and preserve values.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
