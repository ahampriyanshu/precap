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

WARMUPS = [('good', (3,), True), ('bool is not stock', (True,), False), ('negative', (-1,), False)]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_instances_and_fields_are_independent(self):
        a=exercise.Container(10,2);b=exercise.Container(20,3);a.used=7
        self.assertEqual((a.capacity,a.used,b.capacity,b.used),(10,7,20,3))
    def test_class_access_and_missing_values(self):
        self.assertIsInstance(exercise.Container.capacity,exercise.NonNegative)
        raw=object.__new__(exercise.Container)
        with self.assertRaises(AttributeError):_ = raw.capacity
    def test_failed_write_preserves_previous_value(self):
        container=exercise.Container(10,2)
        for value in [-1,True,2.5,'3']:
            with self.subTest(value=value),self.assertRaises(ValueError):container.used=value
        self.assertEqual(container.used,2)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
