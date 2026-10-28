# Binary search on the answer

Binary search is useful beyond finding a value in a sorted list. It can find the smallest numeric answer for which a yes/no check succeeds. The essential requirement is a **monotone predicate**: after the answer becomes feasible, every larger candidate must also be feasible.

Consider splitting positive weights into contiguous groups, each with a maximum allowed total. You must preserve order, but may choose boundaries. This models ordered batch processing and capacity planning. If capacity `C` permits at most `d` groups, then every larger capacity also permits them. That creates a false-then-true search space.

## Separate checking from searching

For weights `[2, 3, 4]` and two groups, the lower bound is `4`, the largest single item. The upper bound is `9`, the total.

The feasibility scan fills each group until the next value would exceed capacity, then starts another.

Separate one capacity check from the outer search:

```python
weights, capacity = [2, 3, 4], 4
groups, load = 1, 0
for weight in weights:
    if load + weight > capacity:
        groups += 1
        load = 0
    load += weight
print(groups)
```

Capacity `4` requires `3` groups, so it fails a two-group limit. The established lower bound ensures every item fits individually.

Greedy filling produces the fewest groups for that capacity: ending a group earlier cannot allow its successor to start farther ahead. Positive weights and fixed order are part of that argument.

With that check, the outer search proceeds:

- Try `6`: greedy grouping gives `[2,3] | [4]`, so it is feasible.
- Restrict the search to `[4,6]`. Try `5`: the same two groups fit.
- Restrict to `[4,5]`. Try `4`: grouping becomes `[2] | [3] | [4]`, so it fails.
- The smallest feasible capacity is `5`.

Maintain a closed interval containing the first feasible answer. A successful midpoint remains a candidate, while an unsuccessful midpoint and everything below it can be discarded. Choosing updates that strictly shorten the interval prevents infinite loops. On termination, both boundaries identify the minimum, not merely some feasible value.

To isolate the boundary updates, this tiny example supplies already-computed predicate results:

```python
# Feasibility for capacities 4 through 9 for weights [2, 3, 4].
feasible = {4: False, 5: True, 6: True, 7: True, 8: True, 9: True}
low, high = 4, 9
while low < high:
    middle = (low + high) // 2
    if feasible[middle]:
        high = middle
    else:
        low = middle + 1
print(low)
```

The output is `5`. In a real search the dictionary lookup is replaced by the O(n) grouping scan, not by materializing the numeric search space.

A direct prototype tries every integer capacity between the bounds, costing O(nR), where `R = sum(weights)-max(weights)+1`. Binary search cuts that to O(n log(R+1)) time and O(1) auxiliary space. With trillion-sized weights, reducing the number of candidate checks matters even for a short list. The logarithm concerns the numeric range, not simply the number of items.

Use this technique when verification is cheaper than constructing the optimum and feasibility is monotone: thresholds, deadlines, batch sizes, and rates often fit. It cannot repair a nonmonotone predicate. If you may reorder values, split individual values, or attach costs to the group boundaries, the feasibility problem changes. Establish correct bounds and prove the predicate before writing the search loop.

## Practice

Implement `prototype(weights: list[int], days: int) -> int` and `solve` with the same signature. Return the smallest integer capacity that partitions positive integer weights, in their given order, into at most `days` nonempty contiguous groups. Extra days need not be used. Empty weights return `0` for positive `days`.

Example: `([1, 2, 3, 4, 5], 3)` returns `6`.

Raise `ValueError` for `days <= 0` or any nonpositive weight. Prototype: test capacities with the feasibility scan. Final: binary search the capacity bound, using O(1) auxiliary space. Preserve inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
