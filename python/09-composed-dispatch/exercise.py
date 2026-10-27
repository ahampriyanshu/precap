# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
from typing import Protocol

def prototype(shipment_id: str, price: int) -> str:
    raise NotImplementedError('Implement this API; see README.md')

class QuoteProvider(Protocol):

    def quote(self, distance: int, weight: int) -> int:
        raise NotImplementedError('Implement this API; see README.md')

class AuditSink(Protocol):

    def record(self, shipment_id: str, price: int) -> None:
        raise NotImplementedError('Implement this API; see README.md')

class Dispatcher:

    def __init__(self, carrier: QuoteProvider, audit: AuditSink):
        raise NotImplementedError('Implement this API; see README.md')

    def dispatch(self, shipment_id: str, distance: int, weight: int) -> int:
        raise NotImplementedError('Implement this API; see README.md')
