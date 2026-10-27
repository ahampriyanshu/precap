"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('no self pairing', ([5], 10), None),
 ('two equal crates', ([5, 5], 10), (5, 5)),
 ('canonical tie', ([4, 1, 3, 2], 5), (1, 4)),
 ('empty', ([], 0), None),
 ('negative adjustment', ([-4, 0, 4], 0), (-4, 4)),
 ('generated pallet 0', ([], 5), None),
 ('generated pallet 1', ([-6], 6), None),
 ('generated pallet 2', ([2, 1], -5), None),
 ('generated pallet 3', ([-1, 3, 3], 1), None),
 ('generated pallet 4', ([7, 5, -2, -4], 2), None),
 ('generated pallet 5', ([7, 4, -3, -4, 3], 0), (-4, 4)),
 ('generated pallet 6', ([-3, 2, 3, 2, -5, 4], -2), (-5, 3)),
 ('generated pallet 7', ([1, 5, -5, -5, 6, 2, -4], 4), None),
 ('generated pallet 8', ([3, 0, 3, 6, 0, -2, -4, 1], 0), (0, 0)),
 ('generated pallet 9', ([-5, 6, -3, -3, 6, 7, 6, -1, 5], 5), (-1, 6)),
 ('generated pallet 10', ([2, 3, -2, 1, 6, 3, 6, 4, 0, -1], 0), (-2, 2)),
 ('generated pallet 11', ([4, 0, 0, 7, 1, 3, 0, 0, 0, 4, -2], 1), (-2, 3)),
 ('generated pallet 12', ([2, 6, 2, -4, 6, 7, -1, 3, -3, -3, -3, 5], -2), (-4, 2)),
 ('generated pallet 13', ([-1, 2, -4, -1, 1, -6, 1, 5, 4, -2, 6, 5, -5], 7), (1, 6)),
 ('generated pallet 14', ([7, 2, 1, -3, 5, 6, -2, 7, 1, -1, 4, 3, -1, 1], -4), (-3, -1)),
 ('generated pallet 15', ([-3, 3, 0, -2, -5, -4, -1, -2, 6, 0, 4, 3, -3, -6, 3], 3), (-3, 6)),
 ('generated pallet 16', ([5, -1, -2, -1, 7, 3, 4, -4, 1, -1, -3, -5, -3, -1, 5, -3], -2), (-5, 3)),
 ('generated pallet 17', ([6, 3, -5, -4, 6, 0, 2, 3, 4, 7, 5, -1, -4, 1, -1, -5, 5], 5), (-1, 6)),
 ('generated pallet 18', ([-6, 7, 5, 7, 7, 7, -1, 4, 5, -3, -1, -2, 5, -1, -3, 4, 6, 4], 6), (-1, 7)),
 ('generated pallet 19',
  ([5, -5, -3, 2, 7, -4, -2, 5, 4, 4, -1, 4, 7, 3, 0, 7, -4, -3, 3], -1),
  (-5, 4)),
 ('generated pallet 20',
  ([7, 7, 2, 7, -6, 2, 5, -6, -3, 3, -6, -6, -2, -2, 2, 6, -4, -2, -1, -1], -4),
  (-6, 2)),
 ('generated pallet 21',
  ([-6, -2, 3, 5, 5, 2, 5, 1, 5, -3, 2, 6, -1, -1, 1, 4, 0, 2, 1, 2, -2], -5),
  (-6, 1)),
 ('generated pallet 22',
  ([0, -3, 2, -4, -1, -5, -5, 1, 5, 7, 1, 7, 0, 5, -6, 1, -1, 4, 2, -4, 6, 2], -5),
  (-6, 1)),
 ('generated pallet 23',
  ([3, -5, -3, -5, 0, -5, 3, 4, -6, -3, -4, 2, -4, -5, 2, -4, 1, 5, 0, 2, -3, 5, 4], -2),
  (-6, 4)),
 ('generated pallet 24',
  ([6, 2, -6, -3, 2, -5, 6, 5, 0, -2, 3, 0, -6, 6, -1, 2, 4, 0, -3, -4, -6, 3, -6, -1], 6),
  (0, 6))]

ERROR_CASES = []

FINAL_CASES = []
class ContractTests(unittest.TestCase):
    def invoke(self, args):
        fn = exercise.prototype if STAGE == 'prototype' else exercise.solve
        before = copy.deepcopy(args)
        try:
            return fn(*args)
        finally:
            self.assertEqual(args, before, 'Do not mutate caller-owned inputs, including on failure')

    def assert_typed_equal(self, actual, expected):
        self.assertIs(type(actual),type(expected),'Return the exact documented value type')
        self.assertEqual(actual,expected)
        if isinstance(expected,(list,tuple)):
            for left,right in zip(actual,expected):self.assert_typed_equal(left,right)
        elif isinstance(expected,dict):
            self.assertEqual(list(actual),list(expected),'Dictionary key order is part of this contract')
            for key in expected:self.assert_typed_equal(actual[key],expected[key])

    def test_examples_boundaries_and_counterexamples(self):
        for name, args, expected in CASES:
            with self.subTest(case=name):
                self.assert_typed_equal(self.invoke(copy.deepcopy(args)), expected)

    def test_explicit_error_contract(self):
        for name, args in ERROR_CASES:
            with self.subTest(case=name):
                with self.assertRaises(ValueError):
                    self.invoke(copy.deepcopy(args))

    def test_final_scale_cases(self):
        if STAGE == 'prototype':
            return  # These cases are deliberately outside the prototype's scale.
        for name, args, expected in FINAL_CASES:
            with self.subTest(case=name):
                self.assert_typed_equal(self.invoke(copy.deepcopy(args)), expected)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage', choices=['prototype', 'final'], default='final')
    options, remaining = parser.parse_known_args()
    STAGE = options.stage
    unittest.main(argv=['main.py', *remaining], verbosity=2)
