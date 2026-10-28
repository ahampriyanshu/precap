# Heaps and k-way merge

A min-heap is a priority queue that exposes its smallest element. Each parent is less than or equal to its children, so the root is the minimum; the internal array need not be globally sorted. For example, `[1, 4, 2]` is a valid min-heap. In Python's `heapq`, `heapq.heappush(heap, entry)` inserts an entry and `heapq.heappop(heap)` removes and returns the minimum. Both cost O(log k) for heap size `k`; reading `heap[0]` without removing it costs O(1).

A useful application is merging several already sorted sequences: timestamped logs, sorted query results, or runs produced by an external sort. Concatenating and sorting all `N` values costs O(N log N) and ignores the work already present in each input's ordering.

That baseline still provides a clear reference result:

```python
sequences = [[1, 7], [2, 4], [1, 8]]
combined = []
for sequence in sequences:
    combined.extend(sequence)
combined.sort()
print(combined)
```

It prints `[1, 1, 2, 4, 7, 8]`, preserving both copies of `1`.

## Only the head of each sequence can be next

Merge `[1, 7]`, `[2, 4]`, and `[1, 8]`. A heap entry can contain `(value, sequence_index, position)`. The extra indices locate the successor and provide a deterministic tie-breaker.

1. The frontier contains `(1,0,0)`, `(2,1,0)`, `(1,2,0)`.
2. Remove `(1,0,0)`, emit `1`, and offer its successor `(7,0,1)`.
3. Remove `(1,2,0)`, emit `1`, and offer `(8,2,1)`.
4. Remove `(2,1,0)`, emit `2`, and offer `(4,1,1)`.
5. Emit `4`, `7`, then `8` as the remaining sequences finish.

The result is `[1, 1, 2, 4, 7, 8]`. Every unconsumed value in a sequence is at least its head. Therefore the smallest head is the smallest remaining value overall. After emitting it, only that sequence needs a new candidate. This invariant explains why the heap holds at most one entry per nonempty sequence.

The frontier kernel advances only the sequence that supplied the minimum:

```python
import heapq
sequences = [[1, 7], [2, 4], [1, 8]]
frontier = [(seq[0], i, 0) for i, seq in enumerate(sequences) if seq]
heapq.heapify(frontier)
merged = []
while frontier:
    value, source, position = heapq.heappop(frontier)
    merged.append(value)
    position += 1
    if position < len(sequences[source]):
        heapq.heappush(frontier, (sequences[source][position], source, position))
print(merged)
```

The output matches the baseline. Integer tie fields prevent equal values from forcing a comparison between unrelated iterator or node objects.

With `k` sequences, heap construction can cost O(k), and the merge costs O(N log(k+1)) after inspecting the sequence headers. More explicitly, total time is O(k + N log(k+1)); the `k` term matters when many sequences are empty. Auxiliary frontier space is O(k), excluding the O(N) returned list. A streaming interface could yield values instead of storing all results.

Keep duplicates: equal priority does not mean duplicate data should be removed. Do not pop from the front of each Python list, which shifts elements; keep positions or iterators instead. The heap cannot compensate for an unsorted input sequence because a smaller value may be hidden behind its current head.

For two sequences, a simple two-pointer merge avoids heap overhead. For unsorted inputs, ordinary sorting may be the right baseline. Heaps are also useful for task priorities and shortest-path frontiers, but do not support efficient arbitrary ordered traversal.

## Practice

Implement `prototype(feeds: list[list[int]]) -> list[int]` and `solve` with the same signature. Each inner list is already sorted in nondecreasing order. Return all integers in one nondecreasing list, preserving duplicates. Empty feeds and an empty outer list are valid.

Example: `[[], [1, 4], [1, 2, 8]]` returns `[1, 1, 2, 4, 8]`.

Prototype: concatenate and sort. Final: use one heap candidate per active feed. Do not modify the outer list or any inner list. Inputs otherwise satisfy the contract; extra validation is not required. Account for inspecting all feeds as well as emitting all values.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
