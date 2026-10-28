"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('earliest-start trap', ([('long', 0, 10), ('a', 1, 2), ('b', 2, 3), ('c', 3, 4)],), ['a', 'b', 'c']),
 ('tie and touching', ([('b', 0, 2), ('a', 0, 2), ('c', 2, 3)],), ['a', 'c']),
 ('empty schedule', ([],), []),
 ('generated schedule 1', ([('j0', 4, 8)],), ['j0']),
 ('generated schedule 2', ([('j0', 8, 13), ('j1', 2, 5)],), ['j1', 'j0']),
 ('generated schedule 3', ([('j0', 5, 9), ('j1', 7, 9), ('j2', 6, 11)],), ['j0']),
 ('generated schedule 4', ([('j0', -2, -1), ('j1', 5, 7), ('j2', -3, 0), ('j3', 2, 6)],), ['j0', 'j3']),
 ('generated schedule 5',
  ([('j0', 1, 5), ('j1', 0, 2), ('j2', -2, -1), ('j3', 4, 6), ('j4', 4, 9)],),
  ['j2', 'j1', 'j3']),
 ('generated schedule 6',
  ([('j0', 0, 4), ('j1', 1, 2), ('j2', 2, 4), ('j3', 0, 3), ('j4', -1, 3), ('j5', 0, 4)],),
  ['j1', 'j2']),
 ('generated schedule 7',
  ([('j0', 2, 6),
    ('j1', -2, 1),
    ('j2', 6, 8),
    ('j3', -1, 1),
    ('j4', -4, 1),
    ('j5', 9, 12),
    ('j6', 6, 8)],),
  ['j4', 'j0', 'j2', 'j5']),
 ('generated schedule 8',
  ([('j0', 8, 9),
    ('j1', -1, 2),
    ('j2', 3, 4),
    ('j3', 6, 9),
    ('j4', 4, 7),
    ('j5', 3, 4),
    ('j6', 0, 3),
    ('j7', 9, 12)],),
  ['j1', 'j2', 'j4', 'j0', 'j7']),
 ('generated schedule 9',
  ([('j0', -4, -1),
    ('j1', 8, 12),
    ('j2', 6, 8),
    ('j3', 0, 5),
    ('j4', 1, 4),
    ('j5', 9, 11),
    ('j6', 2, 3),
    ('j7', -4, -1),
    ('j8', 6, 11)],),
  ['j0', 'j6', 'j2', 'j5']),
 ('generated schedule 10',
  ([('j0', 8, 11),
    ('j1', -3, 1),
    ('j2', -1, 4),
    ('j3', 7, 10),
    ('j4', 6, 11),
    ('j5', 0, 5),
    ('j6', 0, 3),
    ('j7', -2, 3),
    ('j8', 1, 3),
    ('j9', 9, 13)],),
  ['j1', 'j8', 'j3']),
 ('generated schedule 11',
  ([('j0', 0, 1),
    ('j1', 2, 5),
    ('j2', -3, -2),
    ('j3', -3, -2),
    ('j4', 9, 10),
    ('j5', -4, -1),
    ('j6', -4, 0),
    ('j7', 3, 8),
    ('j8', -3, 0),
    ('j9', 9, 14),
    ('j10', -1, 0)],),
  ['j2', 'j10', 'j0', 'j1', 'j4']),
 ('generated schedule 12',
  ([('j0', 2, 6),
    ('j1', -4, -1),
    ('j2', -1, 3),
    ('j3', -2, 0),
    ('j4', 2, 7),
    ('j5', 4, 7),
    ('j6', 4, 7),
    ('j7', -3, 2),
    ('j8', -2, 3),
    ('j9', 5, 8),
    ('j10', 6, 11),
    ('j11', 8, 11)],),
  ['j1', 'j2', 'j5', 'j11']),
 ('generated schedule 13',
  ([('j0', 2, 4),
    ('j1', 1, 4),
    ('j2', 6, 10),
    ('j3', -2, 2),
    ('j4', 8, 10),
    ('j5', 2, 5),
    ('j6', 6, 9),
    ('j7', 3, 7),
    ('j8', 5, 7),
    ('j9', 4, 8),
    ('j10', 6, 10),
    ('j11', 1, 3),
    ('j12', 0, 3)],),
  ['j3', 'j0', 'j8', 'j4']),
 ('generated schedule 14',
  ([('j0', 6, 7),
    ('j1', 0, 5),
    ('j2', 9, 14),
    ('j3', 1, 2),
    ('j4', 8, 9),
    ('j5', 7, 11),
    ('j6', 3, 8),
    ('j7', 7, 8),
    ('j8', -4, 1),
    ('j9', 5, 9),
    ('j10', 9, 10),
    ('j11', -3, 0),
    ('j12', 0, 1),
    ('j13', 0, 3)],),
  ['j11', 'j12', 'j3', 'j0', 'j7', 'j4', 'j10'])]

ERROR_CASES = [('invalid input', ([('x', 2, 2)],))]

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
