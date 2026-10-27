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

WARMUPS = [('serial integrity', (b'abc',), 590), ('empty payload', (b'',), 0)]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_checksum_boundaries(self):
        self.assertEqual(exercise.checksum(b''),0);self.assertEqual(exercise.checksum(b'abc'),590)
        self.assertEqual(exercise.checksum(bytes(range(256))),sum((i+1)*i for i in range(256)))
    def test_spawn_context_order_and_duplicates(self):
        values=[b'abc',b'',bytes(range(256)),b'abc']
        expected=[590,0,sum((i+1)*i for i in range(256)),590]
        # Real spawn execution catches non-picklable workers and import side effects.
        with mock.patch.object(exercise,'ProcessPoolExecutor',wraps=exercise.ProcessPoolExecutor) as factory:
            self.assertEqual(exercise.checksums(values,workers=2),expected)
        self.assertTrue(factory.called,'This task requires a process pool, not a serial loop')
        self.assertEqual(factory.call_args.kwargs['mp_context'].get_start_method(),'spawn')
    def test_empty_and_validation(self):
        self.assertEqual(exercise.checksums([],workers=1),[])
        for workers in [0,-1,True]:
            with self.subTest(workers=workers),self.assertRaises(ValueError):exercise.checksums([],workers=workers)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
