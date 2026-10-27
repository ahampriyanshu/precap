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

WARMUPS = [('eventual success', ([None, None, 7],), 7), ('all failed', ([None],), None)]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_deferred_execution_and_metadata(self):
        calls=[]
        @exercise.retry(attempts=3,exceptions=(OSError,))
        def send(value,*,tag):
            """Carrier operation."""
            calls.append((value,tag))
            if len(calls)<3:raise OSError('transient')
            return value*2
        self.assertEqual(calls,[]);self.assertEqual(send.__name__,'send');self.assertEqual(send.__doc__,'Carrier operation.')
        self.assertEqual(send(5,tag='x'),10);self.assertEqual(len(calls),3)
    def test_exhaustion_preserves_exception_identity(self):
        failure=OSError('down');fn=mock.Mock(side_effect=failure)
        wrapped=exercise.retry(attempts=2,exceptions=(OSError,))(fn)
        for _ in range(2):
            with self.assertRaises(OSError) as caught:wrapped()
            self.assertIs(caught.exception,failure)
        self.assertEqual(fn.call_count,4)
    def test_unselected_exception_is_not_retried(self):
        fn=mock.Mock(side_effect=ValueError('invalid'))
        with self.assertRaises(ValueError):exercise.retry(attempts=3,exceptions=(OSError,))(fn)()
        self.assertEqual(fn.call_count,1)
    def test_invalid_policies(self):
        for attempts,exceptions in [(0,(OSError,)),(True,(OSError,)),(1,(BaseException,)),(1,[OSError])]:
            with self.subTest(attempts=attempts),self.assertRaises(ValueError):exercise.retry(attempts=attempts,exceptions=exceptions)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
