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

WARMUPS = [('sequential statuses', ([1, 2, 1], str), ['1', '2', '1'])]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_real_overlap_without_assuming_speed(self):
        barrier=threading.Barrier(2);calls=[];lock=threading.Lock()
        def fetch(ident):
            with lock:calls.append(ident)
            barrier.wait(timeout=5)
            return ident*10
        self.assertEqual(exercise.fetch_ordered([2,1],fetch,workers=2),[20,10]);self.assertCountEqual(calls,[2,1])
    def test_duplicates_and_failure_cleanup(self):
        fetch=mock.Mock(side_effect=lambda value:value+1)
        self.assertEqual(exercise.fetch_ordered([3,3,1],fetch,workers=2),[4,4,2]);self.assertEqual(fetch.call_count,3)
        completed=threading.Event();started=threading.Barrier(2)
        def failing(value):
            started.wait(timeout=5)
            if value==0:raise OSError('offline')
            completed.set();return value
        with self.assertRaises(OSError):exercise.fetch_ordered([0,1],failing,workers=2)
        self.assertTrue(completed.is_set())
    def test_limits_and_empty_input(self):
        self.assertEqual(exercise.fetch_ordered([],str,workers=1),[])
        with self.assertRaises(ValueError):exercise.fetch_ordered([],str,workers=0)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
