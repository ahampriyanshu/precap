# Dynamic programming: minimum coins — Java

## Problem and baseline

Find the fewest unlimited positive sizes that sum exactly to a target. A locally large denomination can leave a remainder requiring more pieces or make an otherwise reachable target appear impossible.

Greedy choice is not correct for arbitrary sizes, while uncached recursion recomputes the same remainder repeatedly. Dynamic programming names each exact smaller amount and distinguishes unreachable from a reachable cost of zero.

## A focused Java step

The recurrence needs an explicit unreachable value that cannot masquerade as a free solution:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        int amount = 6;
        int unreachable = amount + 1;
        int[] best = new int[amount + 1];
        Arrays.fill(best, unreachable);
        best[0] = 0;
        assert best[0] == 0;
        assert best[3] == unreachable;
    }
}
```

The zero state means no pieces are needed to make zero; the other initialized states mean not yet reachable. A complete DP still has to consider every eligible size and convert the final sentinel to -1. Nonpositive sizes would destroy the smaller-state dependency.

## Where the idea is useful

Exact-amount dynamic programming appears in change-making, bounded-size packaging variants, and combinational resource planning. Its cost depends on the numeric target, so O(amount) memory is pseudo-polynomial rather than a claim about input bit length.

## Mechanism

Greedy choices fail for sizes 1,3,4 and amount 6: choosing 4 needs three units while 3+3 needs two. A DP state records the best count for an exact smaller amount, with an unreachable sentinel that cannot be mistaken for zero. Final O(amount*numberOfSizes) time and O(amount) space.

## Java representation

Sizes are unlimited positive integers. Return minimum count summing exactly to amount or -1 when impossible. Zero amount returns zero, even for empty sizes. Reject negative amount and all nonpositive sizes before computing.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(long[] sizes, int amount)` returning `int` with a direct baseline.

**Final:** implement `solve(long[] sizes, int amount)` with the mechanism and bounds described above. Sizes are unlimited positive integers. Return minimum count summing exactly to amount or -1 when impossible. Zero amount returns zero, even for empty sizes. Reject negative amount and all nonpositive sizes before computing. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
