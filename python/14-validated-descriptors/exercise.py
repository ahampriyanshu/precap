# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations

def prototype(value: object) -> bool:
    raise NotImplementedError('Implement this API; see README.md')

class NonNegative:

    def __set_name__(self, owner, name):
        """TODO: record this descriptor binding; allow module import first."""
        pass

    def __get__(self, instance, owner=None):
        raise NotImplementedError('Implement this API; see README.md')

    def __set__(self, instance, value):
        raise NotImplementedError('Implement this API; see README.md')

class Container:
    capacity = NonNegative()
    used = NonNegative()

    def __init__(self, capacity: int, used: int=0):
        raise NotImplementedError('Implement this API; see README.md')
