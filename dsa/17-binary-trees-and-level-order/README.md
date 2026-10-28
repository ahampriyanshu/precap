# Binary trees and level-order traversal

A tree is a hierarchy with a root and no cycles. Every non-root node has one parent. A binary tree permits up to two children per node, conventionally called left and right. It does not require values to be ordered; that additional rule belongs to a binary search tree.

A traversal chooses the order in which nodes are visited. Depth-first traversal follows a branch before returning to siblings. Breadth-first, or level-order, traversal visits every node at depth zero, then depth one, and so on. It is useful when grouping a hierarchy by distance from its root, or finding the shallowest matching node.

## A queue represents the next frontier

Consider the nested tree `('a', ('b', None, ('d', None, None)), ('c', None, None))`. Here each tuple is `(name, left, right)`, and `None` means no child.

For one existing frontier, a snapshot keeps children out of their parents’ level:

```python
from collections import deque
b = ("b", None, ("d", None, None))
c = ("c", None, None)
queue, level = deque([b, c]), []
for _ in range(len(queue)):
    name, left, right = queue.popleft()
    level.append(name)
    queue.extend(child for child in (left, right) if child is not None)
print(level, [node[0] for node in queue])
```

This prints `['b', 'c'] ['d']`: the new child remains queued for the next depth.

- Begin with queue `[a]`. Process one node and append its children left before right. Emit level `['a']`; queue becomes `[b, c]`.
- Snapshot the queue length as `2`. Process exactly those two nodes, adding `d` after processing `b`. Emit `['b', 'c']`; queue becomes `[d]`.
- Process the final frontier and emit `['d']`.

The result is `[['a'], ['b', 'c'], ['d']]`. The queue is first-in, first-out: older frontier nodes leave before newly discovered children. Capturing its length at the beginning of a level prevents those new children from being included in the same level.

Repeat that frontier transition until the concrete tree is exhausted:

```python
from collections import deque
root = ("a", ("b", None, ("d", None, None)), ("c", None, None))
queue, levels = deque([root]), []
while queue:
    level = []
    for _ in range(len(queue)):
        name, left, right = queue.popleft()
        level.append(name)
        queue.extend(child for child in (left, right) if child is not None)
    levels.append(level)
print(levels)
```

It prints `[['a'], ['b', 'c'], ['d']]`. This kernel starts with a real root; the empty-tree case belongs before queue initialization.

A direct baseline calculates height, then walks from the root again to collect each requested depth. On a long chain, those repeated traversals cost O(n²). A queue-based traversal touches each node once, costing O(n) time. Its working queue uses O(w) space where `w` is maximum tree width, while the returned levels themselves store O(n) names. A very wide tree can therefore require substantial queue memory.

Python's `collections.deque` supports efficient `popleft()`. Repeatedly removing index zero from a list shifts remaining entries and can spoil the intended bound. An iterative traversal also avoids relying on Python's recursion depth for a long chain.

Use depth-first traversal when you need subtree results, postorder computations, or a smaller frontier on a wide tree. Use a graph traversal with a visited set when nodes may be shared or cycles may exist: this tree contract deliberately excludes those cases. Do not confuse traversal order with sorting names; left-to-right order comes from structure. A missing left child does not reserve an empty output slot.

## Practice

Implement `prototype(tree: tuple | None) -> list[list[str]]` and `solve` with the same signature. Input is `None` or a recursively nested `(name: str, left, right)` tuple. Names are unique and the structure is a tree without cycles or shared child nodes.

Return one list per depth, preserving left-to-right structural order. `None` returns `[]`. Example: `('a', ('b', None, None), ('c', None, None))` returns `[['a'], ['b', 'c']]`.

Prototype: rescan the tree for each depth. Final: process one queue frontier at a time in O(n) time and O(w) auxiliary space, excluding output. Do not modify the tree. No additional validation errors are required.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
