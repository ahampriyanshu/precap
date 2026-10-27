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

WARMUPS = [('normalization', (' H-01 ',), 'h-01')]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_hash_and_equality_agree(self):
        a=exercise.ShipmentKey(' North ','H1');b=exercise.ShipmentKey('north','h1')
        self.assertEqual(a,b);self.assertEqual(hash(a),hash(b));self.assertEqual({a:7}[b],7)
    def test_order_and_readonly_fields(self):
        a=exercise.ShipmentKey('a','2');b=exercise.ShipmentKey('b','1')
        self.assertLess(a,b);self.assertEqual(sorted([b,a]),[a,b])
        for name in ['depot','shipment','_depot']:
            with self.subTest(name=name),self.assertRaises(AttributeError):setattr(a,name,'changed')
    def test_foreign_comparison_protocol(self):
        a=exercise.ShipmentKey('a','1')
        self.assertIs(a.__eq__(object()),NotImplemented);self.assertIs(a.__lt__(object()),NotImplemented)
        with self.assertRaises(TypeError):a<object()
    def test_empty_identity(self):
        with self.assertRaises(ValueError):exercise.ShipmentKey(' ','1')


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
