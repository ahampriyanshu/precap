"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('correction invalidates prefix',
  ([2, 4, 6], [('sum', 0, 3), ('add', 0, -5), ('sum', 0, 2), ('sum', 2, 2)]),
  [12, 1, 0]),
 ('empty values', ([], [('sum', 0, 0)]), [0]),
 ('point additions 0',
  ([3, 3, 7, 0, 0, 2, 8, 4],
   [('sum', 0, 3),
    ('sum', 0, 4),
    ('sum', 0, 1),
    ('sum', 0, 7),
    ('add', 0, 7),
    ('add', 0, 6),
    ('sum', 0, 6),
    ('add', 0, 3),
    ('add', 0, 8),
    ('sum', 0, 3),
    ('sum', 0, 1),
    ('sum', 0, 6),
    ('add', 0, 5),
    ('sum', 0, 6),
    ('sum', 0, 7)]),
  [13, 13, 3, 23, 28, 37, 27, 39, 44, 52]),
 ('point additions 1',
  ([0, 9, 2, 4, 1, 8, 3, 6],
   [('sum', 0, 4),
    ('add', 0, 0),
    ('add', 0, 6),
    ('add', 0, 4),
    ('add', 0, 7),
    ('add', 0, 6),
    ('add', 0, 4),
    ('sum', 0, 8),
    ('add', 0, 1),
    ('sum', 0, 7),
    ('add', 0, 1),
    ('add', 0, 6),
    ('sum', 0, 4),
    ('add', 0, 8),
    ('add', 0, 8)]),
  [15, 60, 55, 50]),
 ('point additions 2',
  ([1, 5, 8, 7, 6, 6, 7, 9],
   [('sum', 0, 7),
    ('add', 0, 3),
    ('sum', 0, 4),
    ('sum', 0, 2),
    ('add', 0, 8),
    ('sum', 0, 4),
    ('add', 0, 8),
    ('add', 0, 2),
    ('add', 0, 0),
    ('add', 0, 4),
    ('add', 0, 8),
    ('add', 0, 2),
    ('sum', 0, 7),
    ('add', 0, 4),
    ('add', 0, 6)]),
  [40, 24, 9, 32, 75]),
 ('point additions 3',
  ([6, 0, 5, 1, 6, 6, 3, 2],
   [('sum', 0, 3),
    ('sum', 0, 4),
    ('add', 0, 8),
    ('sum', 0, 8),
    ('sum', 0, 2),
    ('add', 0, 0),
    ('add', 0, 8),
    ('sum', 0, 7),
    ('sum', 0, 8),
    ('sum', 0, 0),
    ('sum', 0, 8),
    ('sum', 0, 6),
    ('add', 0, 1),
    ('sum', 0, 5),
    ('sum', 0, 4)]),
  [11, 12, 37, 14, 43, 45, 0, 45, 40, 35, 29]),
 ('point additions 4',
  ([5, 6, 0, 6, 3, 5, 9, 2],
   [('sum', 0, 8),
    ('add', 0, 4),
    ('sum', 0, 1),
    ('add', 0, 6),
    ('add', 0, 0),
    ('sum', 0, 8),
    ('sum', 0, 6),
    ('sum', 0, 3),
    ('sum', 0, 1),
    ('add', 0, 0),
    ('sum', 0, 0),
    ('add', 0, 1),
    ('add', 0, 3),
    ('sum', 0, 8),
    ('add', 0, 4)]),
  [36, 9, 46, 35, 21, 15, 0, 50]),
 ('point additions 5',
  ([1, 6, 4, 3, 7, 9, 6, 0],
   [('add', 0, 0),
    ('add', 0, 8),
    ('sum', 0, 8),
    ('sum', 0, 6),
    ('add', 0, 6),
    ('sum', 0, 2),
    ('sum', 0, 6),
    ('add', 0, 7),
    ('sum', 0, 5),
    ('add', 0, 6),
    ('sum', 0, 7),
    ('add', 0, 0),
    ('add', 0, 0),
    ('sum', 0, 6),
    ('sum', 0, 6)]),
  [44, 38, 21, 44, 42, 63, 57, 57]),
 ('point additions 6',
  ([1, 0, 9, 2, 9, 0, 1, 7],
   [('sum', 0, 6),
    ('sum', 0, 5),
    ('sum', 0, 3),
    ('add', 0, 6),
    ('add', 0, 7),
    ('sum', 0, 6),
    ('add', 0, 4),
    ('add', 0, 0),
    ('sum', 0, 6),
    ('add', 0, 7),
    ('add', 0, 4),
    ('sum', 0, 8),
    ('sum', 0, 5),
    ('add', 0, 0),
    ('sum', 0, 8)]),
  [21, 21, 10, 34, 38, 57, 49, 57]),
 ('point additions 7',
  ([6, 1, 1, 2, 7, 0, 0, 9],
   [('sum', 0, 2),
    ('add', 0, 7),
    ('sum', 0, 0),
    ('sum', 0, 5),
    ('add', 0, 7),
    ('add', 0, 7),
    ('sum', 0, 8),
    ('add', 0, 6),
    ('add', 0, 8),
    ('sum', 0, 8),
    ('add', 0, 8),
    ('add', 0, 2),
    ('add', 0, 4),
    ('add', 0, 8),
    ('add', 0, 2)]),
  [7, 0, 24, 47, 61]),
 ('point additions 8',
  ([3, 3, 0, 3, 5, 1, 5, 1],
   [('add', 0, 4),
    ('add', 0, 5),
    ('add', 0, 6),
    ('add', 0, 4),
    ('sum', 0, 1),
    ('add', 0, 5),
    ('sum', 0, 1),
    ('sum', 0, 4),
    ('sum', 0, 3),
    ('add', 0, 7),
    ('sum', 0, 5),
    ('sum', 0, 2),
    ('add', 0, 4),
    ('add', 0, 1),
    ('sum', 0, 1)]),
  [22, 27, 33, 30, 45, 37, 39]),
 ('point additions 9',
  ([3, 2, 3, 1, 2, 3, 3, 6],
   [('sum', 0, 6),
    ('sum', 0, 7),
    ('sum', 0, 7),
    ('sum', 0, 1),
    ('sum', 0, 0),
    ('sum', 0, 8),
    ('sum', 0, 8),
    ('sum', 0, 6),
    ('sum', 0, 3),
    ('add', 0, 8),
    ('sum', 0, 8),
    ('sum', 0, 1),
    ('add', 0, 7),
    ('add', 0, 8),
    ('add', 0, 8)]),
  [14, 17, 17, 3, 0, 23, 23, 14, 8, 31, 11]),
 ('point additions 10',
  ([6, 0, 6, 3, 2, 9, 2, 8],
   [('add', 0, 2),
    ('add', 0, 5),
    ('add', 0, 2),
    ('sum', 0, 5),
    ('sum', 0, 6),
    ('add', 0, 7),
    ('sum', 0, 5),
    ('add', 0, 4),
    ('sum', 0, 6),
    ('add', 0, 8),
    ('sum', 0, 7),
    ('sum', 0, 2),
    ('sum', 0, 5),
    ('sum', 0, 2),
    ('add', 0, 4)]),
  [26, 35, 33, 46, 56, 34, 45, 34]),
 ('point additions 11',
  ([1, 8, 3, 3, 8, 7, 2, 8],
   [('add', 0, 5),
    ('sum', 0, 2),
    ('add', 0, 5),
    ('add', 0, 1),
    ('add', 0, 1),
    ('add', 0, 3),
    ('sum', 0, 3),
    ('sum', 0, 8),
    ('sum', 0, 7),
    ('sum', 0, 1),
    ('sum', 0, 1),
    ('add', 0, 5),
    ('add', 0, 0),
    ('add', 0, 1),
    ('sum', 0, 8)]),
  [14, 27, 55, 47, 16, 16, 61])]

ERROR_CASES = [('invalid input', ([], [('add', 0, 1)])),
 ('invalid input', ([1], [('sum', 1, 0)])),
 ('invalid input', ([1], [('set', 0, 1)]))]

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
