"""Executable learning contract; Python 3.11+; standard library only."""
from __future__ import annotations
import argparse
import asyncio
import contextlib
import copy
import io
import json
import logging
import os
from pathlib import Path
import queue
import tempfile
import threading
import unittest
from unittest import mock
from decimal import Decimal
import exercise

WARMUPS = [('stable JSON', ({'a': 1, 'b': 2},), '{"a": 1, "b": 2}')]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_round_trip_unicode(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manifest.json';exercise.save_manifest(path,{'港':3,'a':[1,2]})
            self.assertEqual(json.loads(path.read_text(encoding='utf-8')),{'港':3,'a':[1,2]})
            self.assertEqual(list(Path(folder).iterdir()),[path])
    def test_serialization_failure_preserves_old_file(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manifest.json';path.write_text('old')
            with self.assertRaises(TypeError):exercise.save_manifest(path,{'bad':object()})
            self.assertEqual(path.read_text(),'old');self.assertEqual(len(list(Path(folder).iterdir())),1)
    def test_replace_failure_cleans_temporary_file(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'manifest.json';path.write_text('old')
            with mock.patch.object(exercise.os,'replace',side_effect=OSError('disk failure')):
                with self.assertRaises(OSError):exercise.save_manifest(path,{'new':1})
            self.assertEqual(path.read_text(),'old');self.assertEqual(len(list(Path(folder).iterdir())),1)
    def test_nan_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(ValueError):exercise.save_manifest(Path(folder)/'x',{'price':float('nan')})


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
