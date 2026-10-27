# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
import threading

def prototype(quantity: int, requests: list[int]) -> tuple[list[bool], int]:
    raise NotImplementedError('Implement this API; see README.md')

class AtomicStock:

    def __init__(self, quantity: int):
        raise NotImplementedError('Implement this API; see README.md')

    def reserve(self, amount: int) -> bool:
        raise NotImplementedError('Implement this API; see README.md')

    def remaining(self) -> int:
        raise NotImplementedError('Implement this API; see README.md')
