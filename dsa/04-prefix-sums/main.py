"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('correction and empty range', ([4, -2, 7], [(0, 3), (1, 3), (2, 2)]), [9, 5, 0]),
 ('empty values', ([], [(0, 0)]), [0]),
 ('generated range 1', ([-4], [(0, 1), (0, 1), (0, 0)]), [-4, -4, 0]),
 ('generated range 2', ([-5, -5], [(0, 2), (1, 2), (0, 0)]), [-10, -5, 0]),
 ('generated range 3', ([4, 7, 6], [(0, 3), (1, 3), (0, 0)]), [17, 13, 0]),
 ('generated range 4', ([2, 0, 1, 4], [(0, 4), (2, 4), (0, 0)]), [7, 5, 0]),
 ('generated range 5', ([-5, 5, -3, -2, -9], [(0, 5), (2, 5), (0, 0)]), [-14, -14, 0]),
 ('generated range 6', ([6, 5, -2, -5, 4, 2], [(0, 6), (3, 6), (0, 0)]), [10, 1, 0]),
 ('generated range 7', ([3, -5, -6, -4, -8, 9, 0], [(0, 7), (3, 7), (0, 0)]), [-11, -3, 0]),
 ('generated range 8', ([-9, 0, 1, -7, -7, -2, -9, -7], [(0, 8), (4, 8), (0, 0)]), [-40, -25, 0]),
 ('generated range 9', ([-7, 5, 5, -2, 0, 7, 0, -1, 7], [(0, 9), (4, 9), (0, 0)]), [14, 13, 0]),
 ('generated range 10',
  ([-9, -2, -4, 3, -1, -3, -5, 3, 5, -3], [(0, 10), (5, 10), (0, 0)]),
  [-16, -3, 0]),
 ('generated range 11',
  ([-9, 9, -8, 1, -1, -1, -2, -9, -1, 0, 0], [(0, 11), (5, 11), (0, 0)]),
  [-21, -13, 0]),
 ('generated range 12',
  ([-8, 3, -2, -8, 8, -2, -8, -9, -2, 9, -8, 3], [(0, 12), (6, 12), (0, 0)]),
  [-24, -15, 0]),
 ('generated range 13',
  ([6, 2, 7, 5, -9, -8, -2, 4, 3, 3, 8, -3, -9], [(0, 13), (6, 13), (0, 0)]),
  [7, 4, 0]),
 ('generated range 14',
  ([-1, -1, -4, 1, -8, -3, -6, 8, -2, 2, 2, -4, -8, -8], [(0, 14), (7, 14), (0, 0)]),
  [-32, -10, 0]),
 ('generated range 15',
  ([-8, -1, 6, -2, -1, 4, 8, -8, -9, 3, -5, -6, 2, -4, -4], [(0, 15), (7, 15), (0, 0)]),
  [-25, -31, 0]),
 ('generated range 16',
  ([-5, -9, -1, 1, -1, -9, -6, 6, 2, 0, -6, 9, -2, 7, -1, 8], [(0, 16), (8, 16), (0, 0)]),
  [-7, 17, 0]),
 ('generated range 17',
  ([-1, -7, -3, -5, 6, 6, -6, 7, -7, 5, 1, -8, 7, -4, -8, 2, 5], [(0, 17), (8, 17), (0, 0)]),
  [-10, -7, 0]),
 ('generated range 18',
  ([4, 7, 3, 6, 0, -1, -7, -1, -9, -1, 1, -4, 2, -5, 9, -2, -7, 3], [(0, 18), (9, 18), (0, 0)]),
  [-2, -4, 0]),
 ('generated range 19',
  ([9, -1, 0, -3, 6, -3, 8, 0, -5, -1, 9, 3, 5, 1, -4, -3, 2, 0, -8], [(0, 19), (9, 19), (0, 0)]),
  [15, 4, 0])]

ERROR_CASES = [('right out of bounds', ([1], [(0, 2)])),
 ('reversed', ([1], [(1, 0)])),
 ('negative index', ([1], [(-1, 0)]))]

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
