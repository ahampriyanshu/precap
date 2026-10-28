# 0/1 knapsack

The 0/1 knapsack problem chooses a subset of items to maximize total value without exceeding a weight capacity. “0/1” means an item is either excluded or included once. It does not mean weights or values are binary. Common uses include bounded resource allocation and selecting independent features or tasks under a budget, when integer weights are a useful model.

Selecting by largest value or best value-to-weight ratio is not generally correct. Those rules ignore the indivisibility of items and the way remaining capacity can become unusable. A direct baseline enumerates every subset, costing exponential time: there are `2^n` subsets for `n` items.

## Keep track of which items are available

Define a state as the best value using the first `i` items within capacity `c`. For the next item `(weight, value)`, either skip it or take it and use a solution built from **earlier items** at capacity `c-weight`.

The two-row formulation makes the earlier-item dependency literal for one item:

```python
previous = [0] * 6
weight, value = 2, 3
current = previous.copy()
for capacity in range(weight, len(current)):
    current[capacity] = max(previous[capacity], previous[capacity - weight] + value)
print(current)
```

This prints `[0, 0, 3, 3, 3, 3]`. Every read comes from `previous`, so the item cannot reuse itself.

With items `(2,3)` and `(3,4)` and capacity `5`, rows for capacities `0..5` are:

| Items available | Best values |
|---|---|
| None | `[0, 0, 0, 0, 0, 0]` |
| First item | `[0, 0, 3, 3, 3, 3]` |
| Both items | `[0, 0, 3, 4, 4, 7]` |

At capacity `5`, taking the second item adds `4` to the earlier row's capacity-`2` value `3`, giving `7`. At capacity `4`, taking that item leaves capacity `1`, giving only `4`.

A one-dimensional table can replace the rows if capacities are updated from largest to smallest. Then `dp[c-weight]` still belongs to the earlier-item state. Updating upward would allow the same item to feed its own later update: one `(2,3)` item could incorrectly contribute value `6` at capacity `4`.

Descending capacities preserve that earlier row inside a single array:

```python
items, limit = [(2, 3), (3, 4)], 5
dp = [0] * (limit + 1)
for weight, value in items:
    for capacity in range(limit, weight - 1, -1):
        dp[capacity] = max(dp[capacity], dp[capacity - weight] + value)
print(dp)
```

The output `[0, 0, 3, 4, 4, 7]` matches the table. The source capacity is smaller and has not yet changed for this item.

The table takes O(nC) time and O(C) space for capacity `C`. As with coin change, this is pseudo-polynomial in a numeric bound. The value-only API does not require reconstructing selected items; reconstructing a subset needs additional decisions or a careful recomputation strategy.

Use this DP for manageable integer capacities and independent items. Fractional knapsack, where items may be split, permits a ratio-based greedy approach. Unlimited reuse is a different DP, and dependencies between items require additional state. With huge capacities and few items, subset enumeration or meet-in-the-middle may be preferable. The option to select nothing means the initial best value is zero, not an unreachable marker for every unused capacity.

## Practice

Implement `prototype(items: list[tuple[int, int]], capacity: int) -> int` and `solve` with the same signature. Each tuple is `(weight, value)` with positive integer weight and nonnegative integer value. Capacity is a nonnegative integer. Return the maximum total value with each item used at most once; unused capacity and an empty selection are allowed. Duplicate tuples represent separate items.

Examples: `([(2,3),(3,4),(4,5)], 6)` returns `8`; `([(2,3)], 4)` returns `3`.

Raise `ValueError` for negative capacity, nonpositive weight, or negative value. Prototype: enumerate subsets. Final: use O(nC) DP time and O(C) auxiliary space with dependency-safe updates. Preserve inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
