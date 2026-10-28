# Linked lists and node identity

A singly linked list consists of nodes, each storing a value and a reference to the next node. The head references the first node; `None` marks the end. Unlike an array, the list has no constant-time indexed access: reaching the tenth node means following nine links.

Linked structures matter when other code holds references to individual objects, or when insertion and deletion occur at already-known positions. Producing an equal list of values is not enough if surviving nodes must keep their identity. This is the difference between an object being equal and being the same object (`is` in Python).

## Delete through the predecessor

Consider three objects `A(value=2) -> B(value=5) -> C(value=7) -> None`. To remove `B`, change `A.next` from `B` to `C`. Objects `A` and `C` remain the same objects; no replacement node is necessary.

These small node objects make the identity distinction visible:

```python
from types import SimpleNamespace as Node
c = Node(value=7, next=None)
b = Node(value=5, next=c)
a = Node(value=2, next=b)
a.next = b.next
print(a.next is c, b.next is c)
```

Both results are `True`: bypassing `b` changes the chain from `a`, without copying `c` or necessarily clearing the detached node.

Removing the head is awkward because it has no predecessor. A temporary **sentinel** node can point to the original head, giving every candidate a predecessor. The sentinel is an implementation aid and must not appear in the returned list.

For values `2 -> 5 -> 5 -> 7`, removing `5` proceeds like this:

1. Keep the predecessor at the node containing `2`.
2. Bypass the first `5`; its next candidate is another `5`.
3. Bypass that `5` too, still without advancing the predecessor.
4. The next node is `7`, which survives, so the predecessor may advance.

Advancing after a removal skips adjacent matches. Losing the next reference before reconnecting can drop the rest of the chain. Accidentally pointing backward can create a cycle that prevents traversal from terminating.

For this concrete chain, advance the predecessor only when its next node survives:

```python
from types import SimpleNamespace as Node
tail = Node(value=7, next=None)
head = Node(value=2, next=Node(value=5, next=Node(value=5, next=tail)))
sentinel = Node(next=head)
predecessor = sentinel
while predecessor.next is not None:
    if predecessor.next.value == 5:
        predecessor.next = predecessor.next.next
    else:
        predecessor = predecessor.next
print(sentinel.next is head, head.next is tail)
```

The two `True` values confirm that both consecutive matches were bypassed and both surviving node identities remain intact.

Membership in a blocked-value set costs expected O(1). Removing matches takes O(n) pointer work, while building that set from `b` input values costs O(b) time and space. The actual link-editing operation needs O(1) auxiliary pointer state once the set exists. Converting between value lists and nodes adds O(n) wrapper storage; keep that cost distinct from the pointer algorithm.

Use a Python list for most simple sequences: it is compact, supports indexing, and often has better iteration locality. A linked list does not make “delete by value” constant-time, because finding that value still requires a search. It is useful here because identity preservation is an explicit requirement. Decide ownership before relinking: the pointer API intentionally mutates links, while the value-list API must leave caller lists unchanged.

## Practice

Implement `prototype(values: list[int], blocked: list[int]) -> list[int]` and `solve` with the same signature. Return surviving values in original order, omitting every value present in `blocked`. Example: `([1, 2, 3, 2, 4], [1, 2])` returns `[3, 4]`. Empty inputs are valid; do not mutate either list.

Prototype: filter values into a new list. For the final linked-list exercise, also implement `detach(head: Node | None, blocked: set[int]) -> Node | None` using the provided `Node(value, next)` class. Relink existing nodes; every surviving object must retain its identity and order, and the result must end without a cycle. `None` or complete removal returns `None`. A temporary sentinel is allowed. Do not mutate `blocked`. `PointerTests` run in both stages.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
