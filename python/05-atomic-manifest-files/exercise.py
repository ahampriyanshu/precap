# Learning scaffold: imports and public shapes are provided; behavior is yours.
from __future__ import annotations
import json, os, tempfile
from pathlib import Path

def prototype(data: dict) -> str:
    raise NotImplementedError('Implement this API; see README.md')

def save_manifest(path: str | Path, data: dict) -> None:
    raise NotImplementedError('Implement this API; see README.md')
