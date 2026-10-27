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

WARMUPS = [('raw split', ('H1|food|3',), ('H1', 'food', '3')),
 ('whitespace is raw', (' H2 | water | 2 ',), (' H2 ', ' water ', ' 2 '))]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_protocol_and_normalization(self):
        self.assertEqual(exercise.parse_record(' Ｈ１ ｜ food ｜ ０３ '),('H1','food',3))
        self.assertEqual(exercise.parse_record('a|Water|10'),('a','Water',10))
        self.assertEqual(exercise.parse_record('a|b|²'),('a','b',2))
    def test_reject_ambiguous_or_incomplete_records(self):
        for line in ['a|b','a|b|1|x','|b|1','a||1','a|b|0','a|b|-1','a|b|+2','a|b|1.0','a|b|١']:
            with self.subTest(line=line),self.assertRaises(ValueError):exercise.parse_record(line)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
