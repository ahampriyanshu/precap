# Heaps and k-way merge

K-way merge combines already sorted feeds while preserving duplicates. Concatenating and numerically sorting all values is a straightforward baseline, but it discards the useful fact that each feed already reveals its cheapest remaining value.

Keep one candidate from each nonempty feed in a min-heap. The global next value must be among those candidates: every hidden value lies behind a feed's current head and cannot be smaller than that head.

## State and reasoning

Represent a candidate with its value, feed index and position within that feed. Extracting it emits the value, then replaces only that feed's candidate with its next value. Never discard equal values: duplicate output values may belong to the same or different feeds.

A heap is a partially ordered array, not a fully sorted collection. For a zero-based binary heap, parent index is floor((i-1)/2) and children are 2i+1 and 2i+2. Insertion bubbles a candidate up; removing the root moves the last candidate to the root and repairs downward. JavaScript has no built-in standard priority queue, so implementing that small heap is part of the final stage.

Tie-breaking by feed and position makes internal behavior deterministic without requiring objects to be implicitly comparable. Array comparison in JavaScript is not a lexicographic numeric comparator; compare the fields explicitly. Read input by positions rather than destructively shifting feeds.

```javascript
const feed = [1, 4, 8];
const candidate = {value: feed[0], feedIndex: 2, position: 0};
console.log(candidate.value, feed[candidate.position + 1]); // 1 4
console.log(feed); // [1, 4, 8]: candidate tracking leaves input intact
```

## Cost and use

For N values across K feeds, inspect all K feeds and then perform O(N log(K+1)) heap work; the frontier has at most K candidates. A heapify build can initialize in O(K), while repeated insertion costs O(K log(K+1)) for active candidates. Returned values take O(N) output storage. This is useful for sorted logs and sorted shard results; unsorted feeds violate the invariant and need sorting first.

## Practice

Implement `prototype(feeds)` and `solve(feeds)`. Every inner array is already sorted nondecreasing. Return all Number values in one nondecreasing array, retaining every duplicate. Empty inner and outer arrays are valid. For `[[], [1, 4], [1, 2, 8]]`, return `[1, 1, 2, 4, 8]`.

Prototype: concatenate and numerically sort. Final: use one heap candidate per active feed. Preserve the outer array and every inner array. No sortedness or other extra validation is required. Include inspecting every feed when explaining runtime.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
