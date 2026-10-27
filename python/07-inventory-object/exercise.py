# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations

def prototype(stock: int, quantity: int) -> int:
    raise NotImplementedError('Implement this API; see README.md')

class Inventory:

    def __init__(self, stock: dict[str, int]):
        raise NotImplementedError('Implement this API; see README.md')

    def available(self, sku: str) -> int:
        raise NotImplementedError('Implement this API; see README.md')

    def reserve(self, sku: str, quantity: int) -> bool:
        raise NotImplementedError('Implement this API; see README.md')

    def snapshot(self) -> dict[str, int]:
        raise NotImplementedError('Implement this API; see README.md')
