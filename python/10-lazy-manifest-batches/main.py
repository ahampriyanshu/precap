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

WARMUPS = [('small batches', ([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]), ('empty', ([], 3), [])]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_no_eager_consumption_or_read_ahead(self):
        seen=[]
        def source():
            for i in range(5):seen.append(i);yield i
        stream=exercise.batches(source(),2);self.assertEqual(seen,[])
        first=next(stream);self.assertEqual(first,[0,1]);self.assertEqual(seen,[0,1])
        self.assertEqual(next(stream),[2,3]);self.assertEqual(first,[0,1])
        self.assertEqual(list(stream),[[4]])
    def test_boundaries(self):
        for values,size,want in [([],3,[]),([1],3,[[1]]),([1,2],1,[[1],[2]]),([1,2],2,[[1,2]])]:
            with self.subTest(values=values,size=size):self.assertEqual(list(exercise.batches(iter(values),size)),want)
    def test_validation_is_immediate(self):
        for size in [0,-1,True,1.5]:
            with self.subTest(size=size),self.assertRaises(ValueError):exercise.batches(iter([]),size)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
