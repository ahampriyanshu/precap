"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('discovery is not finalization', (4, [(0, 1, 10), (0, 2, 1), (2, 1, 1)], 0), [0, 2, 1, None]),
 ('zero cycle and stale entry', (3, [(0, 1, 0), (1, 0, 0), (1, 2, 2), (0, 2, 9)], 0), [0, 0, 2]),
 ('weighted map 1', (1, [], 0), [0]),
 ('weighted map 2', (2, [], 0), [0, None]),
 ('weighted map 3', (3, [(2, 1, 2)], 0), [0, None, None]),
 ('weighted map 4', (4, [(2, 1, 2)], 0), [0, None, None, None]),
 ('weighted map 5', (5, [(0, 0, 7), (4, 0, 8), (4, 1, 0)], 0), [0, None, None, None, None]),
 ('weighted map 6',
  (6, [(2, 1, 8), (2, 3, 7), (3, 0, 6), (4, 0, 1), (4, 2, 7), (5, 0, 1)], 0),
  [0, None, None, None, None, None]),
 ('weighted map 7',
  (7, [(1, 4, 5), (1, 5, 1), (2, 3, 0), (2, 6, 7), (3, 3, 4), (6, 2, 2), (6, 3, 0)], 0),
  [0, None, None, None, None, None, None]),
 ('weighted map 8',
  (8,
   [(0, 3, 0),
    (0, 4, 6),
    (1, 0, 2),
    (1, 4, 3),
    (1, 5, 5),
    (1, 7, 7),
    (4, 6, 1),
    (4, 7, 6),
    (5, 0, 0),
    (5, 1, 6),
    (5, 4, 0),
    (5, 5, 2),
    (7, 6, 8)],
   0),
  [0, None, None, 0, 6, None, 7, 12]),
 ('weighted map 9',
  (9,
   [(0, 8, 6),
    (1, 0, 3),
    (2, 0, 6),
    (2, 1, 1),
    (3, 2, 0),
    (3, 6, 1),
    (4, 2, 2),
    (4, 5, 6),
    (5, 3, 4),
    (5, 4, 7),
    (5, 6, 5),
    (5, 8, 2),
    (6, 1, 0),
    (6, 3, 7),
    (6, 5, 1),
    (6, 7, 3),
    (7, 8, 8),
    (8, 2, 1)],
   0),
  [0, 8, 7, None, None, None, None, None, 6]),
 ('weighted map 10',
  (10,
   [(0, 0, 8),
    (0, 7, 8),
    (0, 9, 2),
    (1, 2, 7),
    (2, 2, 6),
    (2, 3, 5),
    (2, 8, 7),
    (2, 9, 2),
    (3, 0, 4),
    (3, 3, 6),
    (4, 5, 5),
    (5, 4, 3),
    (5, 9, 8),
    (6, 2, 3),
    (6, 6, 5),
    (6, 8, 5),
    (6, 9, 0),
    (7, 1, 1),
    (7, 2, 3),
    (8, 8, 1),
    (8, 9, 1),
    (9, 0, 4),
    (9, 4, 3),
    (9, 5, 8)],
   0),
  [0, 9, 11, 16, 5, 10, None, 8, 18, 2]),
 ('weighted map 11',
  (11,
   [(0, 8, 4),
    (1, 0, 0),
    (1, 1, 1),
    (1, 2, 3),
    (1, 3, 2),
    (1, 7, 3),
    (1, 8, 5),
    (2, 3, 3),
    (3, 4, 5),
    (3, 5, 2),
    (3, 8, 3),
    (4, 1, 0),
    (4, 2, 8),
    (4, 9, 8),
    (5, 3, 3),
    (5, 6, 2),
    (6, 0, 2),
    (7, 0, 0),
    (7, 9, 2),
    (8, 10, 8),
    (9, 7, 6),
    (10, 3, 1),
    (10, 7, 0)],
   0),
  [0, 18, 21, 13, 18, 15, 17, 12, 4, 14, 12]),
 ('weighted map 12',
  (12,
   [(0, 9, 0),
    (0, 10, 0),
    (1, 1, 2),
    (1, 5, 8),
    (1, 11, 7),
    (3, 0, 7),
    (3, 11, 0),
    (4, 1, 6),
    (4, 2, 0),
    (4, 9, 6),
    (5, 3, 2),
    (5, 8, 4),
    (6, 10, 5),
    (7, 7, 5),
    (8, 2, 0),
    (8, 5, 5),
    (9, 7, 8),
    (9, 9, 6),
    (9, 10, 7),
    (10, 1, 6),
    (10, 6, 2),
    (10, 7, 4)],
   0),
  [0, 6, 18, 16, None, 14, 2, 4, 18, 0, 0, 13])]

ERROR_CASES = [('invalid input', (2, [(0, 1, -1)], 0)), ('invalid input', (0, [], 0))]

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
