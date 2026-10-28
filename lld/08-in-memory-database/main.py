"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_records_and_overwrite(self):
        d = exercise.RecordStore()
        self.assertIsNone(d.get('r', 'f'))
        self.assertIsNone(d.set('r', 'f', 'one'))
        d.set('r', 'f', 'two'); d.set('other', 'f', 'other')
        self.assertEqual(d.get('r', 'f'), 'two')
        self.assertEqual(d.get('other', 'f'), 'other')

    def test_scan_order_prefix_snapshot(self):
        d = exercise.RecordStore()
        for f in ('ab', 'z', 'a', ''): d.set('r', f, f)
        self.assertEqual(d.scan('r', 'a'), [('a', 'a'), ('ab', 'ab')])
        rows = d.scan('r'); rows.clear()
        self.assertEqual(d.get('r', ''), '')
        self.assertEqual(len(d.scan('r')), 4)
        self.assertEqual(d.scan('missing'), [])

    def test_instances(self):
        a, b = exercise.RecordStore(), exercise.RecordStore()
        a.set('r', 'f', 'x')
        self.assertIsNone(b.get('r', 'f'))

class FinalTests(unittest.TestCase):
    def test_creation_missing_and_empty_value(self):
        d = exercise.TemporalDatabase()
        self.assertIsNone(d.get(0, 'r', 'f'))
        self.assertIsNone(d.set(1, '', '', ''))
        self.assertEqual(d.get(1, '', ''), '')
        self.assertEqual(d.scan(1, ''), [('', '')])
        self.assertEqual(d.scan(1, 'missing'), [])

    def test_ttl_exact_boundary_and_history(self):
        d = exercise.TemporalDatabase()
        d.set(10, 'r', 'f', 'v', ttl=5)
        self.assertEqual(d.get(14, 'r', 'f'), 'v')
        self.assertIsNone(d.get(15, 'r', 'f'))
        self.assertEqual(d.get_at(20, 'r', 'f', 10), 'v')
        self.assertEqual(d.get_at(20, 'r', 'f', 14), 'v')
        self.assertIsNone(d.get_at(20, 'r', 'f', 15))
        self.assertIsNone(d.get_at(20, 'r', 'f', 9))

    def test_expired_overwrite_never_reveals_older_value(self):
        d = exercise.TemporalDatabase()
        d.set(2, 'r', 'f', 'old')
        d.set(5, 'r', 'f', 'temporary', ttl=3)
        self.assertIsNone(d.get(8, 'r', 'f'))
        self.assertEqual(d.get_at(9, 'r', 'f', 4), 'old')
        self.assertEqual(d.get_at(9, 'r', 'f', 7), 'temporary')
        self.assertIsNone(d.get_at(9, 'r', 'f', 8))

    def test_delete_retains_history_and_recreation(self):
        d = exercise.TemporalDatabase()
        d.set(1, 'r', 'f', 'old')
        self.assertTrue(d.delete(3, 'r', 'f'))
        self.assertFalse(d.delete(3, 'r', 'f'))
        d.set(5, 'r', 'f', 'new')
        self.assertEqual(d.get_at(6, 'r', 'f', 2), 'old')
        self.assertIsNone(d.get_at(6, 'r', 'f', 3))
        self.assertIsNone(d.get_at(6, 'r', 'f', 4))
        self.assertEqual(d.get_at(6, 'r', 'f', 5), 'new')

    def test_cas_success_failure_and_lifetime_replacement(self):
        d = exercise.TemporalDatabase()
        d.set(1, 'r', 'f', 'a', ttl=3)
        self.assertFalse(d.compare_and_set(2, 'r', 'f', 'wrong', 'bad', ttl=1))
        self.assertEqual(d.get(3, 'r', 'f'), 'a')
        self.assertTrue(d.compare_and_set(3, 'r', 'f', 'a', 'b'))
        self.assertEqual(d.get(20, 'r', 'f'), 'b')
        self.assertEqual(d.get_at(20, 'r', 'f', 2), 'a')
        self.assertEqual(d.get_at(20, 'r', 'f', 3), 'b')
        self.assertTrue(d.compare_and_set(20, 'r', 'f', 'b', 'c', ttl=2))
        self.assertIsNone(d.get(22, 'r', 'f'))

    def test_expired_and_missing_conditionals_do_not_create_history(self):
        d = exercise.TemporalDatabase()
        d.set(1, 'r', 'f', 'v', ttl=2)
        self.assertFalse(d.compare_and_set(3, 'r', 'f', 'v', 'bad'))
        self.assertFalse(d.delete(3, 'r', 'f'))
        self.assertFalse(d.compare_and_set(3, 'r', 'missing', '', 'bad'))
        self.assertEqual(d.get_at(4, 'r', 'f', 2), 'v')
        self.assertIsNone(d.get_at(4, 'r', 'f', 3))
        self.assertEqual(d.scan(4, 'r'), [])

    def test_equal_timestamp_last_processed_operation_wins(self):
        d = exercise.TemporalDatabase()
        d.set(5, 'r', 'f', 'a')
        d.set(5, 'r', 'f', 'b')
        self.assertEqual(d.get_at(5, 'r', 'f', 5), 'b')
        self.assertTrue(d.delete(5, 'r', 'f'))
        self.assertIsNone(d.get_at(5, 'r', 'f', 5))
        d.set(5, 'r', 'f', 'c', ttl=1)
        self.assertEqual(d.get_at(6, 'r', 'f', 5), 'c')
        self.assertIsNone(d.get(6, 'r', 'f'))

    def test_scan_order_prefix_and_fresh_results(self):
        d = exercise.TemporalDatabase()
        d.set(1, 'r', 'az', 'z'); d.set(1, 'r', 'a', 'a')
        d.set(1, 'r', 'ab', 'b', ttl=2); d.set(1, 'other', 'a', 'other')
        self.assertEqual(d.scan(2, 'r', 'a'), [('a', 'a'), ('ab', 'b'), ('az', 'z')])
        rows = d.scan(3, 'r'); self.assertEqual(rows, [('a', 'a'), ('az', 'z')])
        rows.append(('bad', 'bad')); rows.clear()
        self.assertEqual(d.scan(3, 'r'), [('a', 'a'), ('az', 'z')])
        self.assertEqual(d.scan(3, 'r', 'A'), [])
        self.assertEqual(d.get(3, 'other', 'a'), 'other')

    def test_invalid_ttl_and_lookback_do_not_advance_time(self):
        d = exercise.TemporalDatabase()
        d.set(1, 'r', 'f', 'old')
        for ttl in (0, -1):
            with self.assertRaises(ValueError): d.set(100, 'r', 'f', 'bad', ttl)
            with self.assertRaises(ValueError): d.compare_and_set(100, 'r', 'missing', 'x', 'bad', ttl)
        for at in (-1, 101):
            with self.assertRaises(ValueError): d.get_at(100, 'r', 'f', at)
        d.set(2, 'r', 'f', 'good')
        self.assertEqual(d.get(2, 'r', 'f'), 'good')
        self.assertEqual(d.get_at(2, 'r', 'f', 1), 'old')

    def test_timestamp_regressions_preserve_history(self):
        d = exercise.TemporalDatabase()
        d.set(5, 'r', 'f', 'v')
        calls = [lambda: d.set(4, 'r', 'f', 'bad'), lambda: d.get(4, 'r', 'f'),
                 lambda: d.delete(4, 'r', 'f'), lambda: d.scan(4, 'r'),
                 lambda: d.compare_and_set(4, 'r', 'f', 'v', 'bad'),
                 lambda: d.get_at(4, 'r', 'f', 1), lambda: d.get(-1, 'r', 'f')]
        for call in calls:
            with self.assertRaises(ValueError): call()
        self.assertEqual(d.get(5, 'r', 'f'), 'v')
        self.assertIsNone(d.get_at(5, 'r', 'f', 4))

    def test_reads_and_unsuccessful_calls_advance_time(self):
        for advance in (lambda d: d.get(8, 'x', 'f'), lambda d: d.delete(8, 'x', 'f'),
                        lambda d: d.compare_and_set(8, 'x', 'f', '', 'v'),
                        lambda d: d.scan(8, 'x'), lambda d: d.get_at(8, 'x', 'f', 0)):
            d = exercise.TemporalDatabase(); advance(d)
            with self.assertRaises(ValueError): d.set(7, 'x', 'f', 'bad')
            self.assertIsNone(d.get(8, 'x', 'f'))

    def test_instance_isolation_including_time(self):
        a, b = exercise.TemporalDatabase(), exercise.TemporalDatabase()
        a.set(100, 'r', 'f', 'a')
        b.set(0, 'r', 'f', 'b')
        self.assertEqual(a.get(100, 'r', 'f'), 'a')
        self.assertEqual(b.get(0, 'r', 'f'), 'b')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
