# Greedy interval scheduling

Interval scheduling chooses the largest number of nonoverlapping jobs sharing one resource. A job has a start and an end; jobs have equal value here, so the objective is a count. Meeting-room booking and single-resource reservations are common examples.

A **greedy algorithm** makes one locally chosen decision at a time and does not revisit it. Greedy decisions need a proof specific to their objective. Choosing the earliest start, shortest duration, or smallest identifier does not generally maximize the count. Choosing the earliest finishing compatible job does.

Inspect the ordering difference on a counterexample; each tuple is `(start, end, id)`:

```python
jobs = [(0, 8, "long"), (1, 3, "a"), (3, 5, "b"), (5, 7, "c")]
by_start = sorted(jobs)
by_finish = sorted(jobs, key=lambda job: (job[1], job[0], job[2]))
print([job[2] for job in by_start])
print([job[2] for job in by_finish])
```

The orders are `['long', 'a', 'b', 'c']` and `['a', 'b', 'c', 'long']`; the selection rule, not sorting alone, determines compatibility.

## See the decision, then justify it

Suppose the jobs are `long=[0,8)`, `a=[1,3)`, `b=[3,5)`, and `c=[5,7)`. The brackets mean half-open intervals: the end is excluded, so `a` and `b` may touch at time `3`.

Sorting by finish time puts `a`, `b`, `c`, then `long` first. Select `a`; the resource is next free at `3`. Select `b`, then `c`, producing three jobs. Earliest-start selection chooses `long` and accepts only one.

The compatible-prefix invariant needs just one finish boundary:

```python
jobs = [(0, 8, "long"), (1, 3, "a"), (3, 5, "b"), (5, 7, "c")]
finish, selected = float("-inf"), []
for start, end, name in sorted(jobs, key=lambda job: (job[1], job[0], job[2])):
    if start >= finish:
        selected.append(name)
        finish = end
print(selected)
```

This prints `['a', 'b', 'c']`. The `>=` comparison permits touching half-open intervals; negative infinity permits negative start times.

Why is earliest finish safe? Take an optimal schedule and compare its first job with the earliest-finishing job. Replace its first job with the greedy choice. The replacement finishes no later, so every later job still fits. The number of accepted jobs stays the same. Repeating this exchange argument on the remaining jobs shows that a full greedy schedule achieves the optimum count.

Sorting dominates the implementation at O(n log n) time; the scan is O(n). A sorted copy costs O(n) space and protects input order. A brute-force prototype enumerates up to `2^n` subsets and checks compatibility, which provides a useful small-input baseline but scales poorly. Multiple optimal schedules can exist. The exercise defines a deterministic sorting rule so that prototypes and final implementations return exactly the same selected IDs.

Do not extend this proof to unequal rewards: one high-value long job may be better than several short jobs, and weighted interval scheduling needs a different recurrence. Assigning all jobs to the fewest rooms is also a different problem, often solved with a heap. Dependencies, setup costs, or multiple resources may invalidate the exchange argument.

The maintained state is simply the finish time of the last accepted job. Use a boundary that accommodates negative start times rather than assuming schedules start at zero. Reject invalid intervals before selection, including an invalid job that would otherwise be skipped. Treat tie-breaking as part of the observable contract, not an accidental property of sort stability.

## Practice

Implement `prototype(jobs: list[tuple[str, int, int]]) -> list[str]` and `solve` with the same signature. Jobs are `(unique_id, start, end)` with integer times and `end > start`; otherwise raise `ValueError`.

Return IDs in the order selected by sorting jobs by `(end, start, id)` and accepting each job whose start is at least the last accepted end. Empty input returns `[]`. Touching jobs are compatible. Example: `[('b',0,2), ('a',0,2), ('c',2,3)]` returns `['a','c']`.

Prototype: explore subsets but reproduce this canonical optimum. Final: implement earliest-finish selection in O(n log n) time. Preserve inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
