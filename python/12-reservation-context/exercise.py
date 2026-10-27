# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
from contextlib import contextmanager

def prototype(stock: int, quantity: int) -> int:
    raise NotImplementedError('Implement this API; see README.md')

@contextmanager
def reservation(stock: dict[str, int], sku: str, quantity: int):
    raise NotImplementedError('Implement this API; see README.md')
