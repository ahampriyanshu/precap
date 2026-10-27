# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations

def prototype(shipment_id: str, count: int) -> str:
    raise NotImplementedError('Implement this API; see README.md')

def make_manifest(shipment_id: str, seals: list[str] | None=None, *, priority: str='normal') -> dict:
    raise NotImplementedError('Implement this API; see README.md')
