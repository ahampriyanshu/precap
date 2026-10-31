# Monotonic deques — Java

## Problem and baseline

Produce a maximum for every full fixed-width window. Old maxima must expire when their indices leave the window, even when equal-valued peaks remain.

Rescanning each window costs O(n*width). A monotonic deque retains only candidates that can still become a future maximum. Storing values alone cannot tell which equal occurrence has expired.

## A focused Java step

The candidate needs position as well as value. Equal peaks at different indices have different lifetimes:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long[] values = {4, 4, 1};
        Deque<Integer> candidates = new ArrayDeque<>();
        candidates.addLast(0);
        candidates.addLast(1);
        int newLeft = 1;
        assert candidates.peekFirst() < newLeft;
        assert values[candidates.peekLast()] == 4;
    }
}
```

Index zero must expire even though its value equals a later surviving maximum. A complete deque implementation also discards dominated back candidates and emits only full windows; neither rule is replaced by a heap of bare values.

## Where the idea is useful

Monotonic frontiers support rolling extrema and similar online summaries. Their linear bound comes from each index entering and leaving at most once, not from a claim that every individual loop iteration does constant work.

## Mechanism

The deque holds candidate indices in increasing time order and decreasing value order. Expire out-of-window indices at the front, discard dominated values at the back, then read the front. Storing only values loses which repeated maximum has expired. Each index is pushed/popped at most once: O(n) time and O(width) space.

## Java representation

Return each full window maximum in start order. Negative values and repeated maxima are valid. Empty input or width greater than length yields an empty list. Width <= 0 always raises `IllegalArgumentException`, even on empty input.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(long[] loads, int width)` returning `List<Long>` with a direct baseline.

**Final:** implement `solve(long[] loads, int width)` with the mechanism and bounds described above. Return each full window maximum in start order. Negative values and repeated maxima are valid. Empty input or width greater than length yields an empty list. Width <= 0 always raises `IllegalArgumentException`, even on empty input. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
