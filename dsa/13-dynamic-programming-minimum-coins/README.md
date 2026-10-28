# Dynamic programming: minimum coins

Dynamic programming stores answers to overlapping subproblems so each is solved once. It applies when a larger answer can be built from smaller answers and many possible choices revisit the same smaller state. The key design work is defining the state, its base cases, and its dependencies.

In minimum coin change, you may use unlimited copies of positive denominations and want an exact amount with as few coins as possible. The same structure appears in choosing reusable package sizes or discrete units. Choosing the largest available denomination is tempting, but it is not valid for arbitrary sizes.

The greedy mechanism fails on a six-unit target even though it reaches the exact amount:

```python
remaining, chosen = 6, []
for coin in [4, 3, 1]:
    count, remaining = divmod(remaining, coin)
    chosen.extend([coin] * count)
print(chosen)
print(remaining)
```

It prints `[4, 1, 1]` and `0`: a valid three-coin representation, but `3+3` uses two coins.

## Build a table with a meaning

For sizes `[1, 3, 4]`, define `best[x]` as the minimum number of coins totaling exactly `x`. Start with `best[0]=0`; unreachable amounts begin with an infinity-like sentinel.

| Amount x | Best count | One reason |
|---|---:|---|
| 0 | 0 | No coins |
| 1 | 1 | 1 |
| 2 | 2 | 1+1 |
| 3 | 1 | 3 |
| 4 | 1 | 4 |
| 5 | 2 | 4+1 |
| 6 | 2 | 3+3 |

For amount `6`, try each possible final coin. Ending with `1` uses `best[5]+1=3` coins. Ending with `3` uses `best[3]+1=2`. Ending with `4` uses `best[2]+1=3`. The minimum is two, while largest-first gives `4+1+1`, or three coins.

The reason the recurrence works is that removing the last coin from an optimal solution must leave an optimal solution for the remaining amount; otherwise replacing that remainder would improve the supposedly optimal result. Fill `x` in increasing order, from `1` through `amount`. At each `x`, consider only sizes `s <= x` and compare candidates `best[x-s]+1`, ignoring unreachable remainders. Each required smaller state is therefore already available. Positive sizes ensure dependencies go to smaller amounts. A zero-size coin breaks that progress rule.

This small table computes the optimal count for every amount through six:

```python
coins, amount = [1, 3, 4], 6
best = [0] + [float("inf")] * amount
for subtotal in range(1, amount + 1):
    for coin in coins:
        if coin <= subtotal:
            best[subtotal] = min(best[subtotal], best[subtotal - coin] + 1)
print(best)
```

It prints `[0, 1, 2, 1, 1, 2, 2]`. Infinity survives if no predecessor is reachable; it must not be reported as a valid coin count.

Uncached recursion explores many choice sequences and can be exponential. A table has `amount+1` states, each considering `d` denominations: O(amount*d) time and O(amount) space. This is **pseudo-polynomial**: the numeric amount may be huge even though its binary or decimal representation is short. A table indexed up to a trillion is not practical simply because the number fits in an integer.

Use DP when the amount bound is manageable and denominations are arbitrary. Greedy is suitable only when its correctness is established for the particular denomination system. Different questions need different states: counting combinations is not minimizing coin count, and limiting each coin to one copy changes the dependencies. Keep unreachable separate from zero; zero means a valid solution requiring no coins.

## Practice

Implement `prototype(sizes: list[int], amount: int) -> int` and `solve` with the same signature. Unlimited copies of each positive integer size are available. Return the minimum number needed to total `amount` exactly, or `-1` when impossible. `amount=0` returns `0`, including with `sizes=[]`.

Examples: `([1, 3, 4], 6)` returns `2`; `([4, 6], 5)` returns `-1`. Negative amounts or any nonpositive size raise `ValueError`.

Prototype: recursively explore choices without caching. Final: reuse smaller-amount results in O(amount*len(sizes)) time and O(amount) space. Preserve inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
