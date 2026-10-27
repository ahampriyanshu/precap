"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('multiple legal choices', (4, [(0, 2), (1, 2), (2, 3)]), [0, 1, 2, 3]),
 ('cycle', (2, [(0, 1), (1, 0)]), None),
 ('duplicate prerequisite', (2, [(0, 1), (0, 1)]), [0, 1]),
 ('self cycle', (1, [(0, 0)]), None),
 ('no repairs', (0, []), []),
 ('repair DAG 1', (1, []), [0]),
 ('repair DAG 2', (2, [(0, 1)]), [0, 1]),
 ('repair DAG 3', (3, []), [0, 1, 2]),
 ('repair DAG 4', (4, [(0, 2), (2, 3)]), [0, 1, 2, 3]),
 ('repair DAG 5', (5, [(0, 2), (1, 2), (1, 4)]), [0, 1, 2, 3, 4]),
 ('repair DAG 6', (6, [(0, 4), (1, 2), (2, 3), (2, 4), (3, 4), (3, 5), (4, 5)]), [0, 1, 2, 3, 4, 5]),
 ('repair DAG 7', (7, [(0, 2), (0, 6), (1, 2), (1, 6), (2, 5), (3, 5), (5, 6)]), [0, 1, 2, 3, 4, 5, 6]),
 ('repair DAG 8',
  (8, [(0, 1), (0, 2), (0, 3), (2, 3), (2, 4), (3, 7), (4, 6)]),
  [0, 1, 2, 3, 4, 5, 6, 7]),
 ('repair DAG 9',
  (9, [(0, 7), (0, 8), (1, 4), (1, 5), (1, 8), (2, 4), (2, 5), (2, 7), (2, 8), (4, 5), (4, 8), (5, 6)]),
  [0, 1, 2, 3, 4, 5, 6, 7, 8]),
 ('repair DAG 10',
  (10,
   [(0, 2),
    (0, 3),
    (0, 4),
    (0, 7),
    (0, 9),
    (1, 2),
    (1, 4),
    (1, 6),
    (1, 7),
    (1, 9),
    (2, 6),
    (3, 6),
    (4, 7),
    (4, 9),
    (5, 8)]),
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
 ('repair DAG 11',
  (11,
   [(0, 5),
    (0, 7),
    (0, 9),
    (0, 10),
    (1, 4),
    (1, 6),
    (1, 9),
    (2, 3),
    (2, 7),
    (2, 8),
    (2, 9),
    (3, 4),
    (3, 9),
    (4, 5),
    (4, 8),
    (4, 10),
    (5, 7),
    (5, 8),
    (5, 9),
    (6, 8),
    (8, 9),
    (9, 10)]),
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]

ERROR_CASES = [('invalid input', (-1, [])), ('invalid input', (2, [(2, 0)]))]

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
