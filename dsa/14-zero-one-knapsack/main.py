"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('greedy ratio counterexample', ([(2, 3), (3, 4), (4, 5)], 6), 8),
 ('no item reuse', ([(2, 3)], 4), 3),
 ('no items', ([], 0), 0),
 ('zero value', ([(2, 0), (2, 7)], 2), 7),
 ('item selection 0', ([], 8), 0),
 ('item selection 1', ([(4, 7)], 2), 0),
 ('item selection 2', ([(3, 10), (3, 8)], 5), 10),
 ('item selection 3', ([(4, 2), (1, 10), (3, 0)], 13), 12),
 ('item selection 4', ([(6, 5), (3, 2), (3, 11), (4, 10)], 7), 21),
 ('item selection 5', ([(3, 3), (2, 5), (6, 8), (1, 6), (3, 11)], 8), 22),
 ('item selection 6', ([(4, 1), (1, 5), (5, 6), (4, 3), (6, 7), (2, 3)], 7), 12),
 ('item selection 7', ([(5, 4), (5, 1), (6, 4), (6, 9), (4, 9), (3, 8), (2, 9)], 7), 18),
 ('item selection 8', ([(3, 3), (4, 8), (2, 3), (3, 7), (2, 3), (3, 0), (2, 1), (3, 3)], 11), 21),
 ('item selection 9', ([(5, 1), (2, 1), (3, 11), (4, 3), (2, 11), (1, 5), (2, 10), (6, 2), (1, 0)], 0), 0),
 ('item selection 10',
  ([(3, 2), (5, 7), (5, 5), (6, 5), (4, 7), (6, 1), (5, 0), (3, 7), (6, 9), (3, 7)], 9),
  16),
 ('item selection 11',
  ([(2, 2), (3, 1), (1, 7), (5, 11), (1, 4), (3, 4), (4, 8), (2, 3), (3, 1), (1, 0), (5, 1)], 11),
  30)]

ERROR_CASES = [('invalid input', ([(0, 2)], 3)), ('invalid input', ([], -1))]

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
