"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('cheap cycle leaves a vertex disconnected',
  (4, [(0, 1, 1), (1, 2, 1), (0, 2, 1), (2, 3, 9)]),
  (11, [(0, 1, 1), (0, 2, 1), (2, 3, 9)])),
 ('negative edge and self-loop',
  (3, [(2, 1, -2), (1, 0, 4), (0, 0, -99)]),
  (2, [(1, 2, -2), (0, 1, 4)])),
 ('disconnected', (3, [(0, 1, 1)]), None),
 ('empty graph', (0, []), (0, [])),
 ('generated weighted graph 1', (1, []), (0, [])),
 ('generated weighted graph 2', (2, [(0, 1, -3)]), (-3, [(0, 1, -3)])),
 ('generated weighted graph 3', (3, [(0, 1, 5), (0, 2, -2)]), (3, [(0, 2, -2), (0, 1, 5)])),
 ('generated weighted graph 4', (4, [(1, 2, 4)]), None),
 ('generated weighted graph 5', (5, [(1, 2, 2), (1, 4, -1), (2, 3, 7)]), None),
 ('generated weighted graph 6',
  (6, [(0, 1, 1), (0, 2, 3), (0, 4, 5), (2, 3, 2), (2, 4, 5), (3, 4, 0), (3, 5, -2), (4, 5, 4)]),
  (4, [(3, 5, -2), (3, 4, 0), (0, 1, 1), (2, 3, 2), (0, 2, 3)])),
 ('generated weighted graph 7',
  (7,
   [(0, 1, 0),
    (0, 4, 6),
    (1, 3, 3),
    (1, 4, 3),
    (1, 5, 6),
    (1, 6, 3),
    (2, 3, 5),
    (3, 4, -2),
    (4, 5, -1),
    (5, 6, 7)]),
  (8, [(3, 4, -2), (4, 5, -1), (0, 1, 0), (1, 3, 3), (1, 6, 3), (2, 3, 5)])),
 ('generated weighted graph 8',
  (8,
   [(0, 2, 7),
    (0, 3, 5),
    (0, 4, 2),
    (0, 5, 3),
    (1, 2, 4),
    (1, 7, 7),
    (2, 4, 4),
    (2, 5, 7),
    (3, 4, 2),
    (4, 6, 4),
    (5, 6, 2),
    (5, 7, 5)]),
  (22, [(0, 4, 2), (3, 4, 2), (5, 6, 2), (0, 5, 3), (1, 2, 4), (2, 4, 4), (5, 7, 5)])),
 ('generated weighted graph 9',
  (9,
   [(0, 1, -2),
    (0, 3, 3),
    (0, 4, 4),
    (0, 8, 4),
    (1, 4, 1),
    (1, 6, 4),
    (1, 8, 2),
    (2, 7, -1),
    (3, 6, 6),
    (3, 8, 2),
    (4, 5, 6),
    (4, 8, 0),
    (5, 6, 6),
    (5, 7, 6),
    (5, 8, 7)]),
  (16, [(0, 1, -2), (2, 7, -1), (4, 8, 0), (1, 4, 1), (3, 8, 2), (1, 6, 4), (4, 5, 6), (5, 7, 6)]))]

ERROR_CASES = [('invalid input', (2, [(0, 2, 4)]))]

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
