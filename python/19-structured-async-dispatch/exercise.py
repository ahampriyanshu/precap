# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
import asyncio

async def prototype(ids: list, fetch) -> list:
    raise NotImplementedError('Implement this API; see README.md')

async def collect(ids, fetch, *, limit: int) -> list:
    raise NotImplementedError('Implement this API; see README.md')
