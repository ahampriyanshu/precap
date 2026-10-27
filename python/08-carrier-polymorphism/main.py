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

WARMUPS = [('van tariff', (7,), 114), ('zero distance', (0,), 100)]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_abstract_contract(self):
        with self.assertRaises(TypeError):exercise.Carrier()
    def test_carrier_quotes(self):
        self.assertEqual(exercise.RoadCarrier().quote(10,3),123)
        self.assertEqual(exercise.DroneCarrier().quote(10,3),69)
        self.assertEqual(exercise.total_quote([exercise.RoadCarrier(),exercise.DroneCarrier()],10,3),192)
    def test_new_subclass_needs_no_dispatcher_change(self):
        class Ferry(exercise.Carrier):
            def quote(self,distance,weight):return 777
        self.assertEqual(exercise.total_quote([Ferry()],0,0),777)
    def test_invalid_or_unsupported_loads(self):
        for carrier,distance,weight in [(exercise.DroneCarrier(),2,6),(exercise.RoadCarrier(),-1,0),(exercise.RoadCarrier(),True,1)]:
            with self.subTest(carrier=type(carrier).__name__),self.assertRaises(ValueError):carrier.quote(distance,weight)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
