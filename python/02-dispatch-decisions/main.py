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

WARMUPS = [('one desk', ([('food', 2), ('water', 3)],), 5), ('no requests', ([],), 0)]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_sequential_allocation_and_ownership(self):
        stock={'food':5,'water':0};requests=[('food',4),('food',2),('food',1),('missing',1)]
        before=copy.deepcopy((requests,stock))
        self.assertEqual(exercise.allocate(requests,stock),(['food','food'],{'food':0,'water':0}))
        self.assertEqual((requests,stock),before)
    def test_result_has_its_own_dictionary(self):
        stock={'x':2};_,remaining=exercise.allocate([],stock);remaining['x']=99
        self.assertEqual(stock,{'x':2})
    def test_invalid_input(self):
        for requests,stock in [([('x',0)],{}),([('x',True)],{}),([] ,{'x':-1})]:
            with self.subTest(requests=requests,stock=stock),self.assertRaises(ValueError):exercise.allocate(requests,stock)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
