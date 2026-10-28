"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('first maximum wins', ([8, 2, 8],), (18, 0)),
 ('empty input', ([],), (0, None)),
 ('one zero', ([0],), (0, 0)),
 ('unbounded integer arithmetic',
  ([1000000000000000000000000000000, 1],),
  (1000000000000000000000000000001, 0)),
 ('generated length 2', ([2, 6],), (8, 1)),
 ('generated length 3', ([10, 11, 15],), (36, 2)),
 ('generated length 4', ([21, 28, 6, 24],), (79, 1)),
 ('generated length 5', ([14, 21, 9, 27, 17],), (88, 3)),
 ('generated length 6', ([13, 9, 3, 23, 19, 7],), (74, 3)),
 ('generated length 7', ([27, 23, 9, 16, 20, 5, 9],), (109, 0)),
 ('generated length 8', ([21, 22, 28, 29, 22, 29, 3, 16],), (170, 3)),
 ('generated length 9', ([7, 15, 15, 28, 25, 26, 0, 28, 23],), (167, 3)),
 ('generated length 10', ([20, 29, 22, 16, 9, 24, 5, 28, 28, 23],), (204, 1)),
 ('generated length 11', ([28, 19, 19, 2, 18, 13, 13, 4, 24, 26, 20],), (186, 0)),
 ('generated length 12', ([16, 11, 6, 5, 0, 5, 20, 11, 6, 20, 28, 12],), (140, 10)),
 ('generated length 13', ([14, 2, 12, 23, 10, 28, 15, 23, 14, 5, 11, 0, 11],), (168, 5)),
 ('generated length 14', ([25, 25, 18, 5, 17, 25, 5, 4, 12, 3, 12, 29, 27, 26],), (233, 11)),
 ('generated length 15', ([29, 20, 3, 18, 18, 23, 0, 15, 24, 25, 25, 28, 27, 6, 4],), (265, 0)),
 ('generated length 16', ([27, 17, 6, 7, 9, 16, 28, 15, 7, 27, 13, 16, 9, 6, 15, 13],), (231, 6)),
 ('generated length 17', ([2, 4, 0, 5, 26, 22, 3, 12, 12, 18, 18, 3, 4, 1, 21, 4, 25],), (180, 4)),
 ('generated length 18', ([8, 0, 29, 2, 28, 8, 0, 24, 1, 8, 13, 2, 26, 5, 6, 20, 16, 2],), (198, 2)),
 ('generated length 19',
  ([29, 6, 10, 9, 0, 8, 4, 27, 16, 0, 19, 3, 8, 16, 8, 16, 17, 13, 13],),
  (222, 0))]

ERROR_CASES = []

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
