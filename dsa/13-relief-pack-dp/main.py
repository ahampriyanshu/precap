"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('greedy counterexample', ([1, 3, 4], 6), 2),
 ('unreachable', ([4, 6], 5), -1),
 ('empty exact zero', ([], 0), 0),
 ('no stock', ([], 3), -1),
 ('duplicate sizes', ([2, 2], 4), 2),
 ('pack amount 0', ([2, 5, 3], 0), 0),
 ('pack amount 1', ([6, 5], 1), -1),
 ('pack amount 2', ([2, 3, 6], 2), 1),
 ('pack amount 3', ([], 3), -1),
 ('pack amount 4', ([], 4), -1),
 ('pack amount 5', ([1, 3, 6], 5), 3),
 ('pack amount 6', ([1, 5, 6], 6), 1),
 ('pack amount 7', ([5], 7), -1),
 ('pack amount 8', ([1, 4, 6], 8), 2),
 ('pack amount 9', ([5, 1], 9), 5),
 ('pack amount 10', ([3, 2, 6], 10), 3),
 ('pack amount 11', ([], 11), -1),
 ('pack amount 12', ([], 12), -1),
 ('pack amount 13', ([3, 5, 6], 13), 3),
 ('pack amount 14', ([5, 1], 14), 6),
 ('pack amount 15', ([], 15), -1),
 ('pack amount 16', ([5, 1, 6], 16), 3),
 ('pack amount 17', ([6], 17), -1),
 ('pack amount 18', ([3, 1, 5], 18), 4),
 ('pack amount 19', ([1, 2], 19), 10)]

ERROR_CASES = [('invalid input', ([0], 3)), ('invalid input', ([1], -1))]

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
