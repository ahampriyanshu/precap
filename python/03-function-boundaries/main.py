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

WARMUPS = [('one manifest', ('H-01', 2), 'H-01:2'), ('no seals', ('H-02', 0), 'H-02:0')]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_defaults_do_not_leak(self):
        first=exercise.make_manifest('a');first['seals'].append('red')
        self.assertEqual(exercise.make_manifest('b'),{'id':'b','seals':[],'priority':'normal'})
    def test_caller_ownership(self):
        seals=['blue'];result=exercise.make_manifest('a',seals,priority='urgent');seals.append('red')
        self.assertEqual(result,{'id':'a','seals':['blue'],'priority':'urgent'})
    def test_keyword_only_and_validation(self):
        with self.assertRaises(TypeError):exercise.make_manifest('a',[],'urgent')
        for ident,priority in [('', 'normal'),('a','fast')]:
            with self.subTest(ident=ident),self.assertRaises(ValueError):exercise.make_manifest(ident,priority=priority)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
