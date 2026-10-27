# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
from dataclasses import dataclass

def prototype(identifier: str, quantity: int) -> tuple[str, int]:
    raise NotImplementedError('Implement this API; see README.md')

@dataclass(frozen=True)
class Shipment:
    id: str
    quantity: int

    def __post_init__(self):
        raise NotImplementedError('Implement this API; see README.md')

def parse_shipments(rows: list[dict]) -> list[Shipment]:
    raise NotImplementedError('Implement this API; see README.md')
