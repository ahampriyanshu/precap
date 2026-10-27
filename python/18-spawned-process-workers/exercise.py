# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
import multiprocessing
from concurrent.futures import ProcessPoolExecutor

def prototype(payload: bytes) -> int:
    raise NotImplementedError('Implement this API; see README.md')

def checksum(payload: bytes) -> int:
    raise NotImplementedError('Implement this API; see README.md')

def checksums(payloads: list[bytes], *, workers: int) -> list[int]:
    raise NotImplementedError('Implement this API; see README.md')
