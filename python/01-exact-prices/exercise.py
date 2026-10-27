# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP, localcontext

def prototype(weight: int, rate: int) -> int:
    raise NotImplementedError('Implement this API; see README.md')

def quote(weight_text: str, rate_text: str) -> Decimal:
    raise NotImplementedError('Implement this API; see README.md')
