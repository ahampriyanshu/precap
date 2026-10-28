"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('cycle and unreachable vertex', (5, [(0, 1), (1, 2), (2, 0), (2, 3)], 0), [0, 1, 1, 2, None]),
 ('self loop', (1, [(0, 0)], 0), [0]),
 ('generated graph 2', (2, [(0, 1)], 0), [0, 1]),
 ('generated graph 3', (3, [], 0), [0, None, None]),
 ('generated graph 4', (4, [(0, 3), (1, 2), (1, 3)], 0), [0, 2, 3, 1]),
 ('generated graph 5', (5, [(0, 1), (0, 2), (1, 2), (1, 4), (2, 3), (2, 4), (3, 4)], 0), [0, 1, 1, 2, 2]),
 ('generated graph 6', (6, [(2, 3), (3, 5), (4, 5)], 0), [0, None, None, None, None, None]),
 ('generated graph 7',
  (7,
   [(0, 1), (0, 4), (0, 5), (0, 6), (1, 4), (1, 5), (2, 3), (2, 4), (2, 5), (4, 5), (4, 6), (5, 6)],
   0),
  [0, 1, 2, 3, 1, 1, 1]),
 ('generated graph 8',
  (8, [(0, 3), (0, 6), (1, 2), (1, 3), (1, 5), (3, 4), (3, 5), (3, 7), (5, 6)], 0),
  [0, 2, 3, 1, 2, 2, 1, 2]),
 ('generated graph 9',
  (9, [(0, 1), (0, 2), (0, 3), (1, 6), (1, 8), (2, 3), (5, 7), (6, 7)], 0),
  [0, 1, 1, 1, None, 4, 2, 3, 2]),
 ('generated graph 10',
  (10,
   [(0, 1),
    (0, 2),
    (0, 4),
    (0, 6),
    (0, 8),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 9),
    (2, 4),
    (2, 5),
    (2, 6),
    (3, 9),
    (6, 8)],
   0),
  [0, 1, 1, 2, 1, 2, 1, None, 1, 2]),
 ('generated graph 11',
  (11,
   [(0, 3),
    (0, 4),
    (0, 7),
    (0, 9),
    (0, 10),
    (1, 3),
    (1, 6),
    (2, 9),
    (3, 5),
    (3, 6),
    (4, 7),
    (4, 8),
    (5, 10),
    (6, 8),
    (7, 9),
    (7, 10)],
   0),
  [0, 2, 2, 1, 1, 2, 2, 1, 2, 1, 1])]

ERROR_CASES = [('invalid input', (0, [], 0)), ('invalid input', (2, [(0, 2)], 0))]

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
