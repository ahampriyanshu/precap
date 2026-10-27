# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
from abc import ABC, abstractmethod

def prototype(distance: int) -> int:
    raise NotImplementedError('Implement this API; see README.md')

class Carrier(ABC):

    @abstractmethod
    def quote(self, distance: int, weight: int) -> int:
        raise NotImplementedError('Implement this API; see README.md')

class RoadCarrier(Carrier):

    def quote(self, distance: int, weight: int) -> int:
        raise NotImplementedError('Implement this API; see README.md')

class DroneCarrier(Carrier):

    def quote(self, distance: int, weight: int) -> int:
        raise NotImplementedError('Implement this API; see README.md')

def total_quote(carriers: list[Carrier], distance: int, weight: int) -> int:
    raise NotImplementedError('Implement this API; see README.md')
