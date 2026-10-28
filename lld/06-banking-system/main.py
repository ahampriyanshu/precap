"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_deposit_and_withdraw(self):
        a = exercise.BalanceAccount()
        self.assertEqual(a.balance(), 0)
        self.assertEqual(a.deposit(50), 50)
        self.assertTrue(a.withdraw(20))
        self.assertEqual(a.balance(), 30)

    def test_rejections(self):
        a = exercise.BalanceAccount()
        a.deposit(10)
        self.assertFalse(a.withdraw(11))
        for method in (a.deposit, a.withdraw):
            for value in (0, -1):
                with self.assertRaises(ValueError):
                    method(value)
        self.assertEqual(a.balance(), 10)

    def test_instances(self):
        a, b = exercise.BalanceAccount(), exercise.BalanceAccount()
        a.deposit(1)
        self.assertEqual(b.balance(), 0)

class FinalTests(unittest.TestCase):
    def test_create_duplicate_and_missing(self):
        b = exercise.Bank()
        self.assertIsNone(b.balance('missing'))
        self.assertTrue(b.create_account('a'))
        b.deposit('a', 9)
        self.assertFalse(b.create_account('a'))
        self.assertEqual(b.balance('a'), 9)
        self.assertIsNone(b.deposit('missing', 5))

    def test_integer_transfer_conserves_money(self):
        b = exercise.Bank()
        for name in ('a', 'b'): b.create_account(name)
        self.assertEqual(b.deposit('a', 101), 101)
        self.assertEqual(b.transfer('r', 'a', 'b', 37), (64, 37))
        self.assertEqual(b.balance('a') + b.balance('b'), 101)
        self.assertEqual(b.top_spenders(5), [('a', 37), ('b', 0)])

    def test_invalid_transfer_preserves_every_account(self):
        b = exercise.Bank()
        for name in ('a', 'b'): b.create_account(name)
        b.deposit('a', 10)
        for src, dst, amount in [('a', 'x', 3), ('x', 'b', 3), ('a', 'a', 3), ('a', 'b', 11)]:
            self.assertIsNone(b.transfer('retry', src, dst, amount))
            self.assertEqual((b.balance('a'), b.balance('b')), (10, 0))
            self.assertEqual(b.top_spenders(2), [('a', 0), ('b', 0)])
        self.assertEqual(b.transfer('retry', 'a', 'b', 10), (0, 10))

    def test_successful_retry_returns_original_result(self):
        b = exercise.Bank()
        for name in ('a', 'b'): b.create_account(name)
        b.deposit('a', 100)
        self.assertEqual(b.transfer('r', 'a', 'b', 30), (70, 30))
        b.deposit('b', 5)
        self.assertEqual(b.transfer('r', 'a', 'b', 30), (70, 30))
        self.assertEqual((b.balance('a'), b.balance('b')), (70, 35))
        self.assertEqual(b.top_spenders(1), [('a', 30)])

    def test_request_conflict_keeps_replay_record(self):
        b = exercise.Bank()
        for name in ('a', 'b', 'c'): b.create_account(name)
        b.deposit('a', 50)
        b.transfer('r', 'a', 'b', 10)
        for args in [('a', 'b', 11), ('a', 'c', 10), ('b', 'a', 10)]:
            with self.assertRaises(ValueError): b.transfer('r', *args)
        self.assertEqual(b.transfer('r', 'a', 'b', 10), (40, 10))
        self.assertEqual([b.balance(x) for x in ('a', 'b', 'c')], [40, 10, 0])

    def test_failed_request_can_succeed_after_deposit(self):
        b = exercise.Bank()
        for name in ('a', 'b'): b.create_account(name)
        self.assertIsNone(b.transfer('r', 'a', 'b', 5))
        b.deposit('a', 5)
        self.assertEqual(b.transfer('r', 'a', 'b', 5), (0, 5))

    def test_amount_validation_precedes_missing_account(self):
        b = exercise.Bank()
        b.create_account('a'); b.deposit('a', 4)
        for amount in (0, -4):
            with self.assertRaises(ValueError): b.deposit('missing', amount)
            with self.assertRaises(ValueError): b.transfer('r', 'a', 'missing', amount)
        self.assertEqual(b.balance('a'), 4)
        self.assertEqual(b.top_spenders(5), [('a', 0)])

    def test_ranking_ties_limits_and_snapshot(self):
        b = exercise.Bank()
        for name in ('z', 'a', 'm'): b.create_account(name)
        b.deposit('z', 5); b.deposit('m', 5)
        b.transfer('r1', 'z', 'a', 5); b.transfer('r2', 'm', 'a', 5)
        rows = b.top_spenders(10)
        self.assertEqual(rows, [('m', 5), ('z', 5), ('a', 0)])
        rows.clear()
        self.assertEqual(b.top_spenders(1), [('m', 5)])
        self.assertEqual(b.top_spenders(0), [])
        with self.assertRaises(ValueError): b.top_spenders(-1)
        self.assertEqual(b.top_spenders(2), [('m', 5), ('z', 5)])

    def test_instance_isolation(self):
        a, b = exercise.Bank(), exercise.Bank()
        a.create_account('a'); a.create_account('b'); a.deposit('a', 5)
        a.transfer('same', 'a', 'b', 5)
        self.assertEqual(b.top_spenders(10), [])
        b.create_account('a'); b.create_account('b'); b.deposit('a', 8)
        self.assertEqual(b.transfer('same', 'a', 'b', 3), (5, 3))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
