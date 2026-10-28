from __future__ import annotations


def prototype(values: list[int], blocked: list[int]) -> list[int]:
    """Linked lists and node identity: implement the baseline described in README.md."""
    raise NotImplementedError("Implement this stage in exercise.py")


def solve(values: list[int], blocked: list[int]) -> list[int]:
    """Linked lists and node identity: implement the final approach described in README.md."""
    raise NotImplementedError("Implement this stage in exercise.py")


from dataclasses import dataclass

@dataclass(eq=False)
class Node:
    value: int
    next: Node | None = None

def detach(head: Node | None, blocked: set[int]) -> Node | None:
    """Relink existing nodes only; removing nodes may mutate next links."""
    raise NotImplementedError('Preserve the identity of every surviving node')
