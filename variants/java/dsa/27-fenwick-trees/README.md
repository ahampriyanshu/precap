# Fenwick trees — Java

## Problem and baseline

Process point additions and range-sum queries on internal state without mutating the caller array. A one-time prefix table becomes stale as soon as the first update is applied.

Copy-and-scan is a good correctness baseline but long ranges remain linear per query. Fenwick nodes summarize binary-sized blocks so both point additions and prefix sums visit logarithmically many nodes.

## A focused Java step

The lowest set bit describes a node block length; one-based storage avoids a zero-step update:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        int index = 12; // binary 1100
        int blockLength = index & -index;
        assert blockLength == 4;
        assert index - blockLength == 8;
        assert (0 & -0) == 0;
    }
}
```

A prefix query can jump to the preceding block by subtracting this value. An update uses the corresponding forward jumps. Starting that update at index zero would never advance; translate zero-based public indices deliberately.

## Where the idea is useful

Fenwick trees suit running counts, cumulative totals, and frequency tables with point increments. They trade a compact specialized representation for less flexibility than a general segment tree.

## Mechanism

A Fenwick node summarizes a block whose size is its lowest set bit. Prefix queries clear that bit; point additions advance by that bit. Translate zero-based input indices to one-based internal storage to avoid a zero-step loop. Range sums subtract two prefixes. Final O(n log n) simple construction and O(log n) operations, O(n) space; linear construction is optional.

## Java representation

`Update("add", index, delta)` changes internal state; `Update("sum", left, right)` queries [left,right). Return only query totals in order. Negative values/deltas and empty ranges are valid. Reject unknown operations, out-of-bounds add indices, and ranges unless 0 <= left <= right <= n. Preserve original values and commands.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(long[] values, List<Update> commands)` returning `List<Long>` with a direct baseline.

**Final:** implement `solve(long[] values, List<Update> commands)` with the mechanism and bounds described above. `Update("add", index, delta)` changes internal state; `Update("sum", left, right)` queries [left,right). Return only query totals in order. Negative values/deltas and empty ranges are valid. Reject unknown operations, out-of-bounds add indices, and ranges unless 0 <= left <= right <= n. Preserve original values and commands. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
