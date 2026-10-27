# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
from functools import total_ordering

def prototype(identifier: str) -> str:
    raise NotImplementedError('Implement this API; see README.md')

@total_ordering
class ShipmentKey:
    __slots__ = ('_depot', '_shipment')

    def __init__(self, depot: str, shipment: str):
        raise NotImplementedError('Implement this API; see README.md')

    @property
    def depot(self):
        raise NotImplementedError('Implement this API; see README.md')

    @property
    def shipment(self):
        raise NotImplementedError('Implement this API; see README.md')

    def __setattr__(self, name, value):
        raise NotImplementedError('Implement this API; see README.md')

    def __eq__(self, other):
        raise NotImplementedError('Implement this API; see README.md')

    def __hash__(self):
        raise NotImplementedError('Implement this API; see README.md')

    def __lt__(self, other):
        raise NotImplementedError('Implement this API; see README.md')
