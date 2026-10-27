# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
from collections.abc import Iterable, Iterator

def prototype(values: list[int], size: int) -> list[list[int]]:
    raise NotImplementedError('Implement this API; see README.md')

def batches(source: Iterable, size: int) -> Iterator[list]:
    raise NotImplementedError('Implement this API; see README.md')
