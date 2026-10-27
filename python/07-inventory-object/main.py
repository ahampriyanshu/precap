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

WARMUPS = [('one reservation', (7, 3), 4)]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_reservation_is_all_or_nothing(self):
        inventory=exercise.Inventory({'food':3})
        self.assertFalse(inventory.reserve('food',4));self.assertEqual(inventory.available('food'),3)
        self.assertTrue(inventory.reserve('food',3));self.assertEqual(inventory.available('food'),0)
        self.assertFalse(inventory.reserve('missing',1))
    def test_instances_and_snapshots_are_independent(self):
        original={'x':5};a=exercise.Inventory(original);b=exercise.Inventory(original);original['x']=99
        a.reserve('x',2);snapshot=a.snapshot();snapshot['x']=88
        self.assertEqual(a.available('x'),3);self.assertEqual(b.available('x'),5)
    def test_invalid_quantities_do_not_mutate(self):
        inventory=exercise.Inventory({'x':2})
        for qty in [0,-1,True,1.2]:
            with self.subTest(qty=qty),self.assertRaises(ValueError):inventory.reserve('x',qty)
        self.assertEqual(inventory.snapshot(),{'x':2})


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
