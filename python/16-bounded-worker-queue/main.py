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

WARMUPS = [('sequential small batch', ([1, 2, 3], str), ['1', '2', '3'])]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_bounded_queue_order_failures_and_shutdown(self):
        calls=[];lock=threading.Lock();made=[]
        class ObservedQueue(queue.Queue):
            def __init__(self,*args,**kwargs):super().__init__(*args,**kwargs);made.append(self)
        def handle(value):
            with lock:calls.append(value)
            if value==2:raise ValueError('bad crate')
            return value*10
        result=exercise.process(iter([3,2,1,3]),handle,workers=3,max_pending=1,queue_factory=ObservedQueue)
        self.assertEqual(result,[(True,30),(False,'ValueError: bad crate'),(True,10),(True,30)])
        self.assertCountEqual(calls,[3,2,1,3]);self.assertEqual(len(made),1);self.assertEqual(made[0].maxsize,1)
        self.assertEqual(made[0].unfinished_tasks,0)
        self.assertFalse(any(t.name.startswith('harborline-worker-') for t in threading.enumerate()))
    def test_source_failure_still_stops_workers(self):
        def source():yield 1;raise RuntimeError('input broke')
        with self.assertRaises(RuntimeError):exercise.process(source(),str,workers=2,max_pending=1)
        self.assertFalse(any(t.name.startswith('harborline-worker-') for t in threading.enumerate()))
    def test_empty_and_invalid_limits(self):
        self.assertEqual(exercise.process([],str,workers=2,max_pending=1),[])
        for workers,pending in [(0,1),(1,0),(True,1)]:
            with self.subTest(workers=workers),self.assertRaises(ValueError):exercise.process([],str,workers=workers,max_pending=pending)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
