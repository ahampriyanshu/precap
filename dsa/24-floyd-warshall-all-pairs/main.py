"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('parallel edges and ordered intermediates',
  (4, [(0, 1, 7), (0, 1, 3), (1, 2, -1), (2, 3, 2)]),
  [[0, 3, 2, 4], [None, 0, -1, 1], [None, None, 0, 2], [None, None, None, 0]]),
 ('wrong loop order misses this route',
  (4, [(0, 3, 1), (3, 2, 1), (2, 1, 1)]),
  [[0, 3, 2, 1], [None, 0, None, None], [None, 1, 0, None], [None, 2, 1, 0]]),
 ('unreachable pairs and diagonal', (2, []), [[0, None], [None, 0]]),
 ('empty graph', (0, []), []),
 ('all-pairs DAG 1', (1, []), [[0]]),
 ('all-pairs DAG 2', (2, [(0, 1, -2)]), [[0, -2], [None, 0]]),
 ('all-pairs DAG 3',
  (3, [(0, 1, 4), (0, 2, -2), (1, 2, -1)]),
  [[0, 4, -2], [None, 0, -1], [None, None, 0]]),
 ('all-pairs DAG 4',
  (4, [(0, 1, -1)]),
  [[0, -1, None, None], [None, 0, None, None], [None, None, 0, None], [None, None, None, 0]]),
 ('all-pairs DAG 5',
  (5, [(0, 4, -1), (1, 2, 6), (1, 3, 7), (1, 4, 0), (2, 4, 3)]),
  [[0, None, None, None, -1],
   [None, 0, 6, 7, 0],
   [None, None, 0, None, 3],
   [None, None, None, 0, None],
   [None, None, None, None, 0]]),
 ('all-pairs DAG 6',
  (6, [(0, 1, 4), (0, 2, -1), (0, 3, 1), (0, 5, 7), (2, 5, 5), (3, 4, 4), (4, 5, 6)]),
  [[0, 4, -1, 1, 5, 4],
   [None, 0, None, None, None, None],
   [None, None, 0, None, None, 5],
   [None, None, None, 0, 4, 10],
   [None, None, None, None, 0, 6],
   [None, None, None, None, None, 0]]),
 ('all-pairs DAG 7',
  (7,
   [(0, 1, 2),
    (0, 2, 7),
    (0, 3, 5),
    (0, 4, 6),
    (1, 3, 2),
    (1, 4, 2),
    (1, 5, 0),
    (1, 6, 4),
    (2, 4, 7),
    (3, 4, 2),
    (3, 6, 2),
    (4, 5, 7),
    (5, 6, 0)]),
  [[0, 2, 7, 4, 4, 2, 2],
   [None, 0, None, 2, 2, 0, 0],
   [None, None, 0, None, 7, 14, 14],
   [None, None, None, 0, 2, 9, 2],
   [None, None, None, None, 0, 7, 7],
   [None, None, None, None, None, 0, 0],
   [None, None, None, None, None, None, 0]]),
 ('all-pairs DAG 8',
  (8,
   [(0, 2, 2),
    (0, 3, 3),
    (0, 4, 4),
    (0, 5, 2),
    (0, 7, 2),
    (1, 2, 0),
    (1, 3, -2),
    (1, 5, 0),
    (1, 6, 1),
    (1, 7, -2),
    (2, 3, 5),
    (2, 4, 4),
    (2, 6, 4),
    (3, 4, 3),
    (3, 6, 3),
    (4, 6, 2),
    (5, 6, 1),
    (5, 7, 0),
    (6, 7, 4)]),
  [[0, None, 2, 3, 4, 2, 3, 2],
   [None, 0, 0, -2, 1, 0, 1, -2],
   [None, None, 0, 5, 4, None, 4, 8],
   [None, None, None, 0, 3, None, 3, 7],
   [None, None, None, None, 0, None, 2, 6],
   [None, None, None, None, None, 0, 1, 0],
   [None, None, None, None, None, None, 0, 4],
   [None, None, None, None, None, None, None, 0]])]

ERROR_CASES = [('negative cycle anywhere', (2, [(0, 1, -2), (1, 0, 1)]))]

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
