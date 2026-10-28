"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


class PrototypeTests(unittest.TestCase):
    def test_remainder_follows_sorted_names(self):
        result = exercise.split_equal(10, ['c', 'a', 'b'])
        self.assertEqual(result, {'a': 4, 'b': 3, 'c': 3})
        self.assertEqual(list(result), ['a', 'b', 'c'])
        self.assertEqual(sum(result.values()), 10)

    def test_zero_and_less_than_member_count(self):
        self.assertEqual(exercise.split_equal(0, ['b', 'a']), {'a': 0, 'b': 0})
        self.assertEqual(exercise.split_equal(1, ['c', 'b', 'a']), {'a': 1, 'b': 0, 'c': 0})
        self.assertEqual(exercise.split_equal(7, ['only']), {'only': 7})

    def test_invalid_splits(self):
        for total, participants in [(-1, ['a']), (2, []), (2, ['a', 'a']), (2, [''])]:
            with self.assertRaises(ValueError):
                exercise.split_equal(total, participants)

    def test_input_and_output_independence(self):
        participants = ['b', 'a']
        result = exercise.split_equal(3, participants)
        self.assertEqual(participants, ['b', 'a'])
        result['a'] = 99
        self.assertEqual(exercise.split_equal(3, participants), {'a': 2, 'b': 1})


class FinalTests(unittest.TestCase):
    def group(self):
        return exercise.ExpenseSharing(['c', 'a', 'b'])

    def assert_balances(self, group, expected):
        self.assertEqual(group.balances(), expected)
        self.assertEqual(sum(group.balances().values()), 0)

    def test_initial_balances_and_constructor(self):
        g = self.group()
        self.assert_balances(g, {'a': 0, 'b': 0, 'c': 0})
        self.assertEqual(list(g.balances()), ['a', 'b', 'c'])
        self.assertEqual(g.suggest_settlements(), [])
        for members in [[], ['a', 'a'], ['a', '']]:
            with self.assertRaises(ValueError):
                exercise.ExpenseSharing(members)

    def test_equal_split_with_exact_cent_conservation(self):
        g = self.group()
        self.assertTrue(g.add_expense('e', 'c', 1000, ['c', 'b', 'a']))
        self.assert_balances(g, {'a': -334, 'b': -333, 'c': 667})
        self.assertTrue(g.add_expense('small', 'a', 1, ['b', 'c']))
        self.assert_balances(g, {'a': -333, 'b': -334, 'c': 667})

    def test_payer_can_be_excluded_and_self_expense(self):
        g = self.group()
        g.add_expense('e', 'c', 5, ['b', 'a'])
        self.assert_balances(g, {'a': -3, 'b': -2, 'c': 5})
        self.assertTrue(g.add_expense('self', 'a', 17, ['a']))
        self.assert_balances(g, {'a': -3, 'b': -2, 'c': 5})

    def test_expense_retry_ignores_participant_order(self):
        g = self.group()
        participants = ['c', 'a', 'b']
        g.add_expense('e', 'c', 10, participants)
        participants.clear()
        before = g.balances()
        self.assertFalse(g.add_expense('e', 'c', 10, ['b', 'a', 'c']))
        self.assertEqual(g.balances(), before)
        self.assertTrue(g.add_expense('other', 'c', 10, ['b', 'a', 'c']))
        self.assert_balances(g, {'a': -8, 'b': -6, 'c': 14})

    def test_conflicting_expense_id_is_atomic(self):
        g = self.group()
        g.add_expense('e', 'c', 10, ['a', 'b'])
        before = g.balances()
        for payer, total, participants in [('a', 10, ['a', 'b']), ('c', 11, ['a', 'b']), ('c', 10, ['a'])]:
            with self.assertRaises(ValueError):
                g.add_expense('e', payer, total, participants)
        self.assertEqual(g.balances(), before)
        self.assertFalse(g.add_expense('e', 'c', 10, ['b', 'a']))

    def test_invalid_expense_does_not_consume_id(self):
        g = self.group()
        requests = [('', 'c', 5, ['a']), ('e', 'unknown', 5, ['a']), ('e', 'c', 0, ['a']),
                    ('e', 'c', -1, ['a']), ('e', 'c', 5, []), ('e', 'c', 5, ['a', 'a']), ('e', 'c', 5, ['unknown'])]
        for args in requests:
            with self.assertRaises(ValueError):
                g.add_expense(*args)
        self.assert_balances(g, {'a': 0, 'b': 0, 'c': 0})
        self.assertTrue(g.add_expense('e', 'c', 5, ['a']))
        self.assert_balances(g, {'a': -5, 'b': 0, 'c': 5})

    def test_partial_settlement_and_exact_retry(self):
        g = self.group()
        g.add_expense('e', 'c', 10, ['a', 'b', 'c'])
        self.assertTrue(g.settle('p', 'a', 'c', 4))
        self.assert_balances(g, {'a': 0, 'b': -3, 'c': 3})
        self.assertFalse(g.settle('p', 'a', 'c', 4))
        self.assert_balances(g, {'a': 0, 'b': -3, 'c': 3})
        self.assertTrue(g.settle('last', 'b', 'c', 3))
        self.assert_balances(g, {'a': 0, 'b': 0, 'c': 0})
        self.assertEqual(g.suggest_settlements(), [])

    def test_settlement_limits_roles_and_failed_id_retry(self):
        g = self.group()
        g.add_expense('e', 'c', 10, ['a', 'b'])
        before = g.balances()
        for debtor, creditor, amount in [('a', 'c', 6), ('c', 'a', 1), ('a', 'b', 1), ('b', 'a', 1)]:
            with self.assertRaises(ValueError):
                g.settle('p', debtor, creditor, amount)
        self.assertEqual(g.balances(), before)
        self.assertTrue(g.settle('p', 'a', 'c', 2))
        self.assert_balances(g, {'a': -3, 'b': -5, 'c': 8})
        other = exercise.ExpenseSharing(['a', 'c', 'd'])
        other.add_expense('e1', 'c', 3, ['a'])
        other.add_expense('e2', 'd', 4, ['a'])
        with self.assertRaises(ValueError):
            other.settle('p', 'a', 'c', 4)
        self.assert_balances(other, {'a': -7, 'c': 3, 'd': 4})

    def test_invalid_and_conflicting_settlement_is_atomic(self):
        g = self.group()
        g.add_expense('e', 'c', 10, ['a', 'b'])
        g.settle('p', 'a', 'c', 2)
        before = g.balances()
        for args in [('', 'a', 'c', 1), ('q', 'a', 'a', 1), ('q', 'missing', 'c', 1),
                     ('q', 'a', 'missing', 1), ('q', 'a', 'c', 0), ('q', 'a', 'c', -1),
                     ('p', 'a', 'c', 1), ('p', 'b', 'c', 2)]:
            with self.assertRaises(ValueError):
                g.settle(*args)
        self.assertEqual(g.balances(), before)
        self.assertTrue(g.settle('q', 'a', 'c', 1))

    def test_shared_operation_namespace(self):
        g = self.group()
        g.add_expense('e', 'c', 10, ['a', 'b'])
        before = g.balances()
        with self.assertRaises(ValueError):
            g.settle('e', 'a', 'c', 2)
        self.assertEqual(g.balances(), before)
        g.settle('p', 'a', 'c', 2)
        before = g.balances()
        with self.assertRaises(ValueError):
            g.add_expense('p', 'a', 2, ['b'])
        self.assertEqual(g.balances(), before)

    def test_suggestions_are_deterministic_and_nonmutating(self):
        g = exercise.ExpenseSharing(['d', 'c', 'b', 'a'])
        g.add_expense('e1', 'c', 7, ['a'])
        g.add_expense('e2', 'd', 5, ['b'])
        before = g.balances()
        expected = [('a', 'c', 7), ('b', 'd', 5)]
        self.assertEqual(g.suggest_settlements(), expected)
        self.assertEqual(g.suggest_settlements(), expected)
        self.assertEqual(g.balances(), before)
        for index, (debtor, creditor, amount) in enumerate(expected):
            g.settle('p' + str(index), debtor, creditor, amount)
            self.assertEqual(sum(g.balances().values()), 0)
        self.assertTrue(all(value == 0 for value in g.balances().values()))

    def test_suggestions_split_across_creditors(self):
        g = exercise.ExpenseSharing(['d', 'c', 'b', 'a'])
        g.add_expense('e1', 'c', 3, ['a'])
        g.add_expense('e2', 'd', 4, ['a', 'b'])
        self.assert_balances(g, {'a': -5, 'b': -2, 'c': 3, 'd': 4})
        self.assertEqual(g.suggest_settlements(), [('a', 'c', 3), ('a', 'd', 2), ('b', 'd', 2)])

    def test_snapshots_inputs_and_instances_are_independent(self):
        members = ['b', 'a']
        a = exercise.ExpenseSharing(members)
        b = exercise.ExpenseSharing(members)
        members.clear()
        a.add_expense('e', 'b', 3, ['a'])
        a.balances()['a'] = 99
        a.suggest_settlements().clear()
        self.assert_balances(a, {'a': -3, 'b': 3})
        self.assert_balances(b, {'a': 0, 'b': 0})
        self.assertTrue(b.add_expense('e', 'a', 1, ['b']))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
