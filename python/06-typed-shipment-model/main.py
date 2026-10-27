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

WARMUPS = [('record shape', ('H1', 3), ('H1', 3))]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_value_semantics_and_order(self):
        values=exercise.parse_shipments([{'quantity':2,'id':'b'},{'id':'a','quantity':1}])
        self.assertEqual(values,[exercise.Shipment('b',2),exercise.Shipment('a',1)])
        self.assertEqual(len({exercise.Shipment('a',1),exercise.Shipment('a',1)}),1)
    def test_frozen_boundary(self):
        from dataclasses import FrozenInstanceError
        item=exercise.Shipment('a',1)
        with self.assertRaises(FrozenInstanceError):item.quantity=4
    def test_invalid_construction(self):
        for ident,qty in [('',1),('a',0),('a',True),('a',1.5)]:
            with self.subTest(ident=ident,qty=qty),self.assertRaises(ValueError):exercise.Shipment(ident,qty)
    def test_fields_are_not_silently_ignored(self):
        for row in [{'id':'a'},{'id':'a','quantity':1,'quanity':8}]:
            with self.subTest(row=row),self.assertRaises(ValueError):exercise.parse_shipments([row])


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
