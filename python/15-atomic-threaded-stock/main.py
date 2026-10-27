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

WARMUPS = [('one dispatcher', (5, [2, 4, 3]), ([True, False, True], 0))]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_all_contenders_share_one_invariant(self):
        from concurrent.futures import ThreadPoolExecutor
        stock=exercise.AtomicStock(37);start=threading.Barrier(8)
        def contend(_):
            start.wait(timeout=5)
            return sum(stock.reserve(1) for _ in range(100))
        with ThreadPoolExecutor(max_workers=8) as pool:total=sum(pool.map(contend,range(8)))
        self.assertEqual(total,37);self.assertEqual(stock.remaining(),0)
    def test_lock_covers_the_check_and_the_update(self):
        class Probe:
            held=False
            entries=0
            def __enter__(self):self.held=True;self.entries+=1
            def __exit__(self,*args):self.held=False
        class Audited(exercise.AtomicStock):
            def __getattribute__(self,name):
                if name=='_quantity' and '_lock' in object.__getattribute__(self,'__dict__'):
                    if not object.__getattribute__(self,'_lock').held:raise AssertionError('read outside lock')
                return super().__getattribute__(name)
            def __setattr__(self,name,value):
                if name=='_quantity' and '_lock' in self.__dict__ and not self._lock.held:raise AssertionError('write outside lock')
                super().__setattr__(name,value)
        stock=Audited(3);probe=Probe();stock._lock=probe
        self.assertTrue(stock.reserve(2));self.assertFalse(stock.reserve(2));self.assertEqual(stock.remaining(),1)
        self.assertGreaterEqual(probe.entries,3)
    def test_invalid_and_independent_instances(self):
        a=exercise.AtomicStock(2);b=exercise.AtomicStock(2);a.reserve(1);self.assertEqual(b.remaining(),2)
        for amount in [0,-1,True]:
            with self.subTest(amount=amount),self.assertRaises(ValueError):a.reserve(amount)
        self.assertEqual(a.remaining(),1)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
