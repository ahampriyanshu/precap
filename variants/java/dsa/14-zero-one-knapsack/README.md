# 0/1 knapsack — Java

## Problem and baseline

Choose a subset under a capacity limit with each input item available once. Duplicate item records represent two separate opportunities, not unlimited reuse of one item.

Enumerating subsets gives a baseline, while choosing by value/weight ratio is not generally correct for indivisible items. Compressing DP to one array saves space only if updates read the previous-item state.

## A focused Java step

Ascending updates can reuse the current item. This deliberately small counterexample shows the dependency error:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long[] unsafe = new long[5];
        int weight = 2;
        long value = 3;
        for (int capacity = weight; capacity < unsafe.length; capacity++) {
            unsafe[capacity] = Math.max(unsafe[capacity], unsafe[capacity - weight] + value);
        }
        assert unsafe[4] == 6; // one item was incorrectly used twice
    }
}
```

The result violates the 0/1 contract for one item. A dependency-safe final implementation must prevent a state updated by the current item from being read again for that item. This snippet is a failure demonstration, not a valid knapsack solution.

## Where the idea is useful

0/1 resource selection is useful when work units, features, or assets cannot be divided or reused. Changing availability to unlimited copies changes the dependency direction and the underlying problem.

## Mechanism

In a one-dimensional 0/1 table, capacities must be updated in descending order. Ascending updates would read the same item's new state and allow reuse. Each duplicate record is still a separate item. Prototype enumerates subsets; final O(nC) time and O(C) auxiliary space.

## Java representation

Each item has weight > 0 and value >= 0; capacity must be >= 0, otherwise `IllegalArgumentException`. Return the maximum total value with each item used at most once. Empty selection and unused capacity are allowed.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(List<Item> items, int capacity)` returning `long` with a direct baseline.

**Final:** implement `solve(List<Item> items, int capacity)` with the mechanism and bounds described above. Each item has weight > 0 and value >= 0; capacity must be >= 0, otherwise `IllegalArgumentException`. Return the maximum total value with each item used at most once. Empty selection and unused capacity are allowed. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
