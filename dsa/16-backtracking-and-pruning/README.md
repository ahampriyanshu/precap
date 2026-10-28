# Backtracking and pruning

Backtracking searches a decision tree one choice at a time. When a partial choice violates a constraint or cannot be completed, abandon that branch and try another. Unlike a greedy method, an early choice is provisional. This pattern appears in constraint puzzles, configuration search, combinations, and small scheduling problems.

Here each position has a list of allowed names, and every chosen name must be distinct. A complete assignment must preserve position order. This is a useful small model of assigning different resources to different tasks.

A Cartesian-product baseline generates complete candidates before filtering:

```python
from itertools import product
choices = [["A", "B"], ["A"]]
valid = []
for candidate in product(*choices):
    if len(set(candidate)) == len(candidate):
        valid.append(candidate)
print(valid)
```

It prints `[('B', 'A')]`. The repeated-name candidate `A,A` was still constructed.

## State must be restored on every failed branch

For allowed choices `[['A', 'B'], ['A']]`, lexicographic exploration begins with `A` at position `0`:

1. Current path `['A']`, used names `{'A'}`.
2. Position `1` allows only `A`, but it is already used. This branch fails.
3. Undo the first choice: path `[]`, used names `{}`.
4. Try `B`: path `['B']`, used names `{'B'}`.
5. Position `1` can now use `A`; return `['B', 'A']`.

If `A` remains in the used set after rollback, the second branch fails incorrectly. If a successful result points directly to a mutable work list, later unwinding can erase it. Either copy the completed path or use immutable/persistent state appropriately.

This one-level branch expansion exposes choose, reject, and rollback without hiding them inside a solver:

```python
path, used, viable_prefixes = [], set(), []
next_options = {"A"}
for name in ["A", "B"]:
    path.append(name)
    used.add(name)
    if next_options - used:
        viable_prefixes.append(path.copy())
    used.remove(name)
    path.pop()
print(viable_prefixes)
print(path, used)
```

It prints `[['B']]` then `[] set()`. Only the prefix with an available next name survives, and sibling exploration starts from clean state.

The search invariant is that the path assigns exactly the already-processed positions and its names are distinct. Visiting each position's unique options in sorted order makes complete assignments appear in lexicographic order. The first successful leaf is therefore the smallest valid result. Trying “most constrained position first” can improve some searches, but changes this easy ordering guarantee and needs additional care when returning a canonical result.

A baseline enumerates the full Cartesian product of choice lists, then rejects assignments with repeated names. With branching counts `b1, b2, ...`, that can generate their product in candidates. Backtracking rejects repetitions immediately, saving work below invalid partial paths. The worst case is still exponential; pruning is not a general polynomial-time guarantee. Working path, used set, and recursion stack scale with the number of positions, apart from storage for sorted candidate lists.

Use backtracking for small combinatorial spaces and constraints that can reject prefixes early. For large one-to-one assignment feasibility, bipartite matching is a better specialized method; weighted assignment has further algorithms. An empty outer list is a completed assignment, whereas an empty choices list at any required position makes completion impossible. Keep those two cases distinct.

## Practice

Implement `prototype(allowed: list[list[str]]) -> list[str] | None` and `solve` with the same signature. Choose one string per inner list, using no string twice. Return the lexicographically smallest complete assignment in input-position order, or `None` if impossible. Duplicate choices within one list add no alternatives. Matching and ordering use Python strings exactly.

Examples: `[['A','B'], ['A']]` returns `['B','A']`; `[['A'], ['A']]` returns `None`; `[]` returns `[]`; `[[]]` returns `None`.

Prototype: enumerate complete combinations. Final: search sorted unique options with early rejection and rollback. Preserve every input list. No additional validation errors are required; worst-case work remains exponential.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
