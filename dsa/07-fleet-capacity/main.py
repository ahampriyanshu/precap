"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('order-sensitive boundary', ([1, 2, 3, 4, 5], 3), 6),
 ('large answer space', ([1000000000000, 1000000000000], 2), 1000000000000),
 ('nothing to ship', ([], 1), 0),
 ('extra days', ([8, 2], 9), 8),
 ('capacity sample 1', ([6], 2), 6),
 ('capacity sample 2', ([3, 7], 1), 10),
 ('capacity sample 3', ([5, 6, 5], 7), 6),
 ('capacity sample 4', ([3, 8, 6, 1], 1), 18),
 ('capacity sample 5', ([3, 6, 11, 7, 8], 4), 11),
 ('capacity sample 6', ([2, 11, 4, 1, 2, 10], 3), 13),
 ('capacity sample 7', ([3, 11, 6, 11, 3, 3, 10], 4), 14),
 ('capacity sample 8', ([4, 9, 7, 11, 10, 6, 8, 2], 5), 16),
 ('capacity sample 9', ([10, 10, 7, 4, 11, 2, 8, 6, 8], 6), 14),
 ('capacity sample 10', ([11, 3, 7, 7, 5, 5, 7, 3, 7, 11], 6), 12),
 ('capacity sample 11', ([4, 11, 9, 7, 11, 10, 3, 2, 3, 7, 10], 4), 24),
 ('capacity sample 12', ([2, 4, 6, 7, 3, 7, 8, 6, 8, 9, 6, 7], 3), 29),
 ('capacity sample 13', ([7, 10, 11, 7, 1, 5, 6, 9, 4, 2, 6, 4, 5], 4), 21),
 ('capacity sample 14', ([6, 9, 11, 8, 9, 11, 7, 7, 3, 4, 4, 1, 6, 8], 6), 18),
 ('capacity sample 15', ([8, 5, 11, 7, 6, 9, 10, 8, 4, 5, 1, 8, 5, 3, 7], 3), 33),
 ('capacity sample 16', ([7, 6, 5, 11, 6, 10, 7, 9, 3, 2, 6, 5, 3, 2, 2, 1], 7), 16),
 ('capacity sample 17', ([4, 3, 2, 11, 1, 9, 5, 4, 4, 6, 10, 3, 3, 9, 2, 2, 7], 5), 20)]

ERROR_CASES = [('invalid input', ([1], 0)), ('invalid input', ([0], 1))]

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
