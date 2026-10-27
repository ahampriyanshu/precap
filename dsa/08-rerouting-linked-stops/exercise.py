from __future__ import annotations


def prototype(values: list[int], blocked: list[int]) -> list[int]:
    """Detaching closed depots: direct baseline. See README.md."""
    raise NotImplementedError("Implement this stage in exercise.py")


def solve(values: list[int], blocked: list[int]) -> list[int]:
    """Detaching closed depots: production algorithm. See README.md."""
    raise NotImplementedError("Implement this stage in exercise.py")


from dataclasses import dataclass

@dataclass(eq=False)
class Node:
    value: int
    next: Node | None = None

def detach(head: Node | None, blocked: set[int]) -> Node | None:
    """Relink existing nodes only; removing nodes may mutate the route links."""
    raise NotImplementedError('Preserve the identity of every surviving node')
