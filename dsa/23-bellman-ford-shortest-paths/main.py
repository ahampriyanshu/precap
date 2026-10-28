"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('late cheaper path', (3, [(0, 1, 4), (0, 2, 5), (2, 1, -3)], 0), [0, 2, 5]),
 ('unreachable negative cycle', (4, [(0, 1, 2), (2, 3, -2), (3, 2, 1)], 0), [0, 2, None, None]),
 ('one vertex', (1, [], 0), [0]),
 ('negative-weight DAG 2', (2, [(0, 1, 6)], 0), [0, 6]),
 ('negative-weight DAG 3', (3, [(1, 2, 7)], 0), [0, None, None]),
 ('negative-weight DAG 4', (4, [(0, 3, 2), (2, 3, -3)], 0), [0, None, None, 2]),
 ('negative-weight DAG 5', (5, [(0, 2, 5), (0, 3, -3), (1, 3, 8), (2, 4, -5)], 0), [0, None, 5, -3, 0]),
 ('negative-weight DAG 6',
  (6, [(0, 1, -2), (0, 3, -2), (1, 5, -2), (2, 5, -1), (3, 4, 5), (3, 5, -4)], 0),
  [0, -2, None, -2, 3, -6]),
 ('negative-weight DAG 7',
  (7,
   [(0, 1, 1),
    (0, 2, -4),
    (0, 3, -5),
    (1, 2, 2),
    (1, 3, 0),
    (1, 5, 5),
    (1, 6, 7),
    (2, 3, -2),
    (2, 4, -5),
    (3, 6, -4),
    (4, 6, -3)],
   0),
  [0, 1, -4, -6, -9, 6, -12]),
 ('negative-weight DAG 8',
  (8, [(1, 2, 8), (1, 3, 5), (2, 6, 6), (2, 7, -4), (3, 6, -1), (3, 7, 5), (4, 7, 2)], 0),
  [0, None, None, None, None, None, None, None]),
 ('negative-weight DAG 9',
  (9,
   [(0, 8, -3),
    (1, 4, -3),
    (1, 6, 8),
    (1, 7, -4),
    (1, 8, -5),
    (2, 3, -5),
    (2, 4, -2),
    (2, 5, -2),
    (3, 5, 2),
    (3, 7, -4),
    (4, 5, 8),
    (4, 6, 2),
    (5, 6, -2),
    (5, 7, 1),
    (6, 7, 7)],
   0),
  [0, None, None, None, None, None, None, None, -3]),
 ('negative-weight DAG 10',
  (10,
   [(0, 4, 2),
    (0, 5, 2),
    (0, 6, -3),
    (0, 9, 8),
    (1, 2, 3),
    (1, 3, -2),
    (1, 8, 1),
    (1, 9, -1),
    (2, 4, 1),
    (2, 8, 8),
    (2, 9, 8),
    (3, 5, 2),
    (3, 6, 5),
    (3, 7, -4),
    (3, 8, -1),
    (4, 8, 5),
    (4, 9, 7),
    (5, 7, 2),
    (5, 8, -4),
    (5, 9, -5)],
   0),
  [0, None, None, None, 2, 2, -3, 4, -2, -3])]

ERROR_CASES = [('reachable negative cycle', (2, [(0, 1, -1), (1, 0, 0)], 0)),
 ('negative self cycle', (1, [(0, 0, -1)], 0))]

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
