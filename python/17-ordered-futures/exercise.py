# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor

def prototype(ids: list, fetch) -> list:
    raise NotImplementedError('Implement this API; see README.md')

def fetch_ordered(ids, fetch, *, workers: int) -> list:
    raise NotImplementedError('Implement this API; see README.md')
