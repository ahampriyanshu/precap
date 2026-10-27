"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('head and adjacent removals', ([1, 2, 3, 2, 4], [1, 2]), [3, 4]),
 ('no route', ([], [1]), []),
 ('all closed', ([1, 1], [1]), []),
 ('no closures', ([1, 2], []), [1, 2]),
 ('linked route 0', ([], [1, 4]), []),
 ('linked route 1', ([0], [1, 4]), [0]),
 ('linked route 2', ([5, 3], [1, 4]), [5, 3]),
 ('linked route 3', ([1, 1, 2], [1, 4]), [2]),
 ('linked route 4', ([3, 3, 5, 0], [1, 4]), [3, 3, 5, 0]),
 ('linked route 5', ([0, 2, 4, 5, 2], [1, 4]), [0, 2, 5, 2]),
 ('linked route 6', ([2, 5, 5, 4, 0, 2], [1, 4]), [2, 5, 5, 0, 2]),
 ('linked route 7', ([1, 5, 5, 3, 3, 5, 5], [1, 4]), [5, 5, 3, 3, 5, 5]),
 ('linked route 8', ([3, 4, 2, 2, 4, 4, 5, 4], [1, 4]), [3, 2, 2, 5]),
 ('linked route 9', ([1, 1, 3, 5, 5, 0, 4, 4, 3], [1, 4]), [3, 5, 5, 0, 3]),
 ('linked route 10', ([4, 1, 1, 0, 1, 5, 2, 0, 5, 4], [1, 4]), [0, 5, 2, 0, 5]),
 ('linked route 11', ([3, 3, 5, 1, 5, 5, 2, 1, 4, 5, 5], [1, 4]), [3, 3, 5, 5, 5, 2, 5, 5]),
 ('linked route 12', ([5, 0, 0, 5, 3, 3, 1, 1, 2, 1, 5, 4], [1, 4]), [5, 0, 0, 5, 3, 3, 2, 5]),
 ('linked route 13', ([4, 5, 2, 4, 4, 0, 0, 1, 0, 3, 1, 2, 5], [1, 4]), [5, 2, 0, 0, 0, 3, 2, 5]),
 ('linked route 14', ([1, 0, 5, 4, 1, 3, 0, 0, 5, 0, 4, 5, 1, 5], [1, 4]), [0, 5, 3, 0, 0, 5, 0, 5, 5])]

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

class PointerTests(unittest.TestCase):
    def test_retained_node_identity_and_no_cycles(self):
        nodes=[exercise.Node(v) for v in [1,2,2,3,4]]
        for left,right in zip(nodes,nodes[1:]):left.next=right
        head=exercise.detach(nodes[0],{1,2})
        self.assertIs(head,nodes[3]);self.assertIs(head.next,nodes[4]);self.assertIsNone(head.next.next)
    def test_empty_and_all_removed(self):
        self.assertIsNone(exercise.detach(None,{1}))
        head=exercise.Node(1,exercise.Node(1))
        self.assertIsNone(exercise.detach(head,{1}))
    def test_no_new_survivor_nodes(self):
        head=exercise.Node(9,exercise.Node(8));tail=head.next
        self.assertIs(exercise.detach(head,set()),head);self.assertIs(head.next,tail)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage', choices=['prototype', 'final'], default='final')
    options, remaining = parser.parse_known_args()
    STAGE = options.stage
    if STAGE == 'prototype':
        result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(ContractTests))
        raise SystemExit(not result.wasSuccessful())
    unittest.main(argv=['main.py', *remaining], verbosity=2)
