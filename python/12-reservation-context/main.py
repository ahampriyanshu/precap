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

WARMUPS = [('successful reserve', (5, 2), 3)]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_commit_on_success(self):
        stock={'x':5}
        with exercise.reservation(stock,'x',2) as value:self.assertIs(value,stock);self.assertEqual(stock['x'],3)
        self.assertEqual(stock,{'x':3})
    def test_rollback_preserves_exception(self):
        stock={'x':5};failure=RuntimeError('carrier offline')
        with self.assertRaises(RuntimeError) as caught:
            with exercise.reservation(stock,'x',2):raise failure
        self.assertIs(caught.exception,failure);self.assertEqual(stock['x'],5)
    def test_nested_failure_restores_only_its_own_quantity(self):
        stock={'x':7}
        with exercise.reservation(stock,'x',2):
            with self.assertRaises(ValueError):
                with exercise.reservation(stock,'x',3):raise ValueError('inner failed')
            self.assertEqual(stock['x'],5)
        self.assertEqual(stock['x'],5)
    def test_base_exception_and_failed_entry(self):
        stock={'x':3}
        with self.assertRaises(KeyboardInterrupt):
            with exercise.reservation(stock,'x',1):raise KeyboardInterrupt()
        self.assertEqual(stock['x'],3)
        with self.assertRaises(ValueError):
            with exercise.reservation(stock,'x',4):self.fail('body must not run')


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
