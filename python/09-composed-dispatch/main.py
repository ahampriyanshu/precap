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

WARMUPS = [('audit display', ('H1', 123), 'H1:123')]

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.TestCase):
    def test_structural_dependencies_and_effect_order(self):
        events=[]
        class Carrier:
            def quote(self,distance,weight):events.append(('quote',distance,weight));return 17
        class Audit:
            def record(self,ident,price):events.append(('audit',ident,price))
        self.assertEqual(exercise.Dispatcher(Carrier(),Audit()).dispatch('H',4,2),17)
        self.assertEqual(events,[('quote',4,2),('audit','H',17)])
    def test_quote_failure_emits_nothing(self):
        carrier=mock.Mock();carrier.quote.side_effect=ValueError('no route');audit=mock.Mock()
        with self.assertRaises(ValueError):exercise.Dispatcher(carrier,audit).dispatch('H',1,1)
        audit.record.assert_not_called()
    def test_audit_failure_is_not_retried(self):
        carrier=mock.Mock();carrier.quote.return_value=10;audit=mock.Mock();audit.record.side_effect=OSError('offline')
        with self.assertRaises(OSError):exercise.Dispatcher(carrier,audit).dispatch('H',1,1)
        carrier.quote.assert_called_once();audit.record.assert_called_once_with('H',10)


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
