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

WARMUPS = [('integer quote', (3, 7), 21), ('empty shipment', (0, 8), 0)]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_round_only_after_multiplication(self):
        for w,r,want in [('2.5','1.005','2.51'),('0.1','0.2','0.02'),('1','0.005','0.01'),('0','99','0.00'),(' 2 ','3','6.00')]:
            with self.subTest(w=w,r=r):
                actual=exercise.quote(w,r)
                self.assertIsInstance(actual,Decimal)
                self.assertEqual(actual,Decimal(want))
                self.assertEqual(actual.as_tuple().exponent,-2)
    def test_bad_money_is_not_an_invoice(self):
        for w in ['NaN','Infinity','-1','not-money','']:
            with self.subTest(w=w),self.assertRaises(ValueError):exercise.quote(w,'1')
    def test_large_finite_precision(self):
        self.assertEqual(exercise.quote('123456789012345678901234567890','2'),Decimal('246913578024691357802469135780.00'))
        self.assertEqual(exercise.quote('1e40','1'),Decimal('1e40'))


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
