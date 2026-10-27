"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('expiring descending maximum', ([9, 8, 7, 6], 2), [9, 8, 7]),
 ('duplicate peak', ([4, 4, 1, 4], 2), [4, 4, 4]),
 ('empty', ([], 1), []),
 ('no full window', ([1], 2), []),
 ('peak n=1 w=1', ([0], 1), [0]),
 ('peak n=1 w=3', ([-9], 3), []),
 ('peak n=1 w=5', ([-6], 5), []),
 ('peak n=2 w=1', ([9, -3], 1), [9, -3]),
 ('peak n=2 w=3', ([-2, -10], 3), []),
 ('peak n=2 w=5', ([-9, 5], 5), []),
 ('peak n=3 w=1', ([-4, 10, 7], 1), [-4, 10, 7]),
 ('peak n=3 w=3', ([1, 10, -6], 3), [10]),
 ('peak n=3 w=5', ([-9, 1, 0], 5), []),
 ('peak n=4 w=1', ([-5, -4, 5, -6], 1), [-5, -4, 5, -6]),
 ('peak n=4 w=3', ([1, -7, 2, 1], 3), [2, 2]),
 ('peak n=4 w=5', ([8, 3, -7, 5], 5), []),
 ('peak n=5 w=1', ([-8, -4, -5, 6, 0], 1), [-8, -4, -5, 6, 0]),
 ('peak n=5 w=3', ([7, 6, -7, 1, -2], 3), [7, 6, 1]),
 ('peak n=5 w=5', ([-5, 9, 9, 2, -9], 5), [9]),
 ('peak n=6 w=1', ([-6, 10, -10, 6, 4, -7], 1), [-6, 10, -10, 6, 4, -7]),
 ('peak n=6 w=3', ([-8, -8, 3, -4, -4, -7], 3), [3, 3, 3, -4]),
 ('peak n=6 w=5', ([3, 5, 10, -1, 5, 7], 5), [10, 10]),
 ('peak n=7 w=1', ([1, -3, -6, 1, 6, 5, 7], 1), [1, -3, -6, 1, 6, 5, 7]),
 ('peak n=7 w=3', ([7, 6, 4, -3, -4, -5, 1], 3), [7, 6, 4, -3, 1]),
 ('peak n=7 w=5', ([6, -6, -5, 10, -9, 10, -3], 5), [10, 10, 10]),
 ('peak n=8 w=1', ([-5, -10, -5, -6, 2, 0, 5, 7], 1), [-5, -10, -5, -6, 2, 0, 5, 7]),
 ('peak n=8 w=3', ([5, -6, -10, -3, -9, 2, -4, 2], 3), [5, -3, -3, 2, 2, 2]),
 ('peak n=8 w=5', ([-8, -3, -9, -10, -9, 6, 5, -6], 5), [-3, 6, 6, 6]),
 ('peak n=9 w=1', ([9, -8, 6, -2, 3, -9, -9, 1, 5], 1), [9, -8, 6, -2, 3, -9, -9, 1, 5]),
 ('peak n=9 w=3', ([-10, 1, -6, -9, -10, 9, -7, -9, -10], 3), [1, 1, -6, 9, 9, 9, -7]),
 ('peak n=9 w=5', ([-7, -2, 2, 9, -7, -9, -2, -4, -10], 5), [9, 9, 9, 9, -2]),
 ('peak n=10 w=1', ([-2, 7, -9, -7, -3, 5, 6, 6, -8, 7], 1), [-2, 7, -9, -7, -3, 5, 6, 6, -8, 7]),
 ('peak n=10 w=3', ([-3, 0, -10, -2, -5, 4, 10, -3, 3, -1], 3), [0, 0, -2, 4, 10, 10, 10, 3]),
 ('peak n=10 w=5', ([8, 0, 7, 9, 10, -10, 9, -3, 9, 7], 5), [10, 10, 10, 10, 10, 9]),
 ('peak n=11 w=1',
  ([9, -8, 7, 9, -6, -8, 8, -2, -10, 10, -4], 1),
  [9, -8, 7, 9, -6, -8, 8, -2, -10, 10, -4]),
 ('peak n=11 w=3', ([6, 5, -6, -9, -5, -9, -10, 2, 7, 8, -4], 3), [6, 5, -5, -5, -5, 2, 7, 8, 8]),
 ('peak n=11 w=5', ([-2, -10, -3, 0, -4, -3, -9, 4, 3, -4, 8], 5), [0, 0, 0, 4, 4, 4, 8])]

ERROR_CASES = [('invalid input', ([1], 0))]

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
