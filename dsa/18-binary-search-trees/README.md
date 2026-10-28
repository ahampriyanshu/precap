# Binary search trees

A binary search tree (BST) stores keys so that every key in a node's left subtree is smaller and every key in its right subtree is larger. This invariant makes a comparison eliminate an entire subtree. The tree in this lesson represents a set, so duplicate keys do not create additional nodes.

An ordered set supports more than equality lookup. A **floor** query returns the largest stored key less than or equal to a target. It is useful for finding the latest event no later than a timestamp, the preceding version, or a lower boundary in an ordered index. A hash set handles membership well but has no direct ordered-neighbor operation.

A full scan gives a floor baseline without relying on any tree ordering:

```python
keys, target = [8, 3, 12, 6], 7
candidate = None
for key in keys:
    if key <= target and (candidate is None or key > candidate):
        candidate = key
print(candidate)
```

It prints `6`, but must inspect every key because the list has no search invariant.

## Search while keeping a candidate

Suppose a BST contains root `8`, left child `3`, right child `12`, and node `6` as the right child of `3`. To find floor `7`:

1. At `8`, the key is too large. Search left; `8` cannot be a candidate.
2. At `3`, record candidate `3`, then search right for a closer legal value.
3. At `6`, update the candidate to `6`, then search right.
4. The next child is empty, so return `6`.

For floor `2`, every visited key is too large and no candidate is recorded, producing `None`. Finding exact equality can finish immediately.

Here `(key, left, right)` tuples expose the two decisions; whole subtrees are skipped:

```python
root = (8, (3, None, (6, None, None)), (12, None, None))
node, target, candidate = root, 7, None
while node is not None:
    key, left, right = node
    if key > target:
        node = left
    else:
        candidate = key
        if key == target:
            break
        node = right
print(candidate)
```

The output is `6`. Taking a right branch retains a legal candidate; taking a left branch discards a key and right subtree that are all too large.

Deletion must preserve the same ordering invariant. A leaf can be detached. A node with one child can be replaced by that child. For two children, use the inorder successor, the smallest key in the right subtree, or the predecessor from the left; then remove the moved key from its former position. Be careful when the successor itself has a child or is the immediate right child.

An unsorted-list baseline scans up to O(n) keys per command. BST operations cost O(h), where `h` is tree height. A balanced tree has logarithmic height; an ordinary BST receiving sorted insertions can become a chain with O(n) height. This lesson does not automatically provide balancing. Recursion on a degenerate tree can also exceed Python's recursion limit.

Use a hash set when equality lookup dominates and order is irrelevant. A sorted array with binary search is attractive for mostly static data, although insertions shift elements. Production ordered maps often use balanced trees or other indexes. Passing behavior tests proves the returned answers, not that your implementation actually uses a BST or has logarithmic height; inspect the structure and explain the input-dependent bound.

## Practice

Implement `prototype(commands: list[tuple[str, int]]) -> list[bool | int | None]` and `solve` with the same signature. Start with an empty set and process commands in order. `('add', key)` and `('remove', key)` return `bool` indicating whether the set changed. `('contains', key)` returns `bool`. `('floor', key)` returns the largest stored integer `<= key`, or `None`. Return one result per command; `[]` returns `[]`.

Example: `[('add',3), ('add',3), ('floor',4), ('remove',9)]` returns `[True, False, 3, False]`. Unknown operations raise `ValueError`.

Prototype: use an unsorted unique-key list. Final: implement a BST with correct deletion and floor search. Preserve commands. Return actual booleans for boolean operations, not integer substitutes.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
