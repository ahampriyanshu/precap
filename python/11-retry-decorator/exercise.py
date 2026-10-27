# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
import functools

def prototype(outcomes: list[int | None]) -> int | None:
    raise NotImplementedError('Implement this API; see README.md')

def retry(*, attempts: int, exceptions: tuple[type[Exception], ...]):
    raise NotImplementedError('Implement this API; see README.md')
