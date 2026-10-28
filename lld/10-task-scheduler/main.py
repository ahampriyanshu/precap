"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_empty_and_priority(self):
        q = exercise.PriorityQueue()
        self.assertIsNone(q.pop())
        self.assertEqual(q.add('low', -1), 1)
        self.assertEqual(q.add('high', 5), 2)
        self.assertEqual(q.pop(), (2, 'high'))
        self.assertEqual(q.pop(), (1, 'low'))
        self.assertIsNone(q.pop())

    def test_numeric_ties_and_duplicate_names(self):
        q = exercise.PriorityQueue()
        for n in range(12): self.assertEqual(q.add('same', 1), n + 1)
        self.assertEqual([q.pop() for _ in range(12)], [(n, 'same') for n in range(1, 13)])

    def test_identifiers_are_not_reused(self):
        q = exercise.PriorityQueue(); q.add('a', 1); q.pop()
        self.assertEqual(q.add('b', 2), 2)

    def test_instances(self):
        a, b = exercise.PriorityQueue(), exercise.PriorityQueue()
        a.add('a', 1)
        self.assertIsNone(b.pop())
        self.assertEqual(b.add('b', 1), 1)

class FinalTests(unittest.TestCase):
    def test_pending_snapshot_and_missing_task(self):
        s = exercise.TaskScheduler()
        self.assertEqual(s.add_task('same', -2), 1)
        self.assertEqual(s.add_task('same', 0), 2)
        self.assertEqual(s.get_task(0, 1), dict(id=1, name='same', priority=-2, status='pending', worker=None, expires_at=None, token=None))
        self.assertIsNone(s.get_task(0, 99))
        self.assertEqual(s.active(0, 'missing'), [])

    def test_priority_dispatch_and_exact_snapshot(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 2)
        s.add_task('low', -1); s.add_task('high', 5); s.add_task('tie', 5)
        self.assertEqual(s.dispatch(1, 'w', 4), dict(id=2, name='high', priority=5, status='running', worker='w', expires_at=5, token=1))
        self.assertEqual(s.dispatch(1, 'w', 9)['id'], 3)
        self.assertEqual([row['id'] for row in s.active(1, 'w')], [2, 3])

    def test_numeric_ties_after_ten_tasks(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 12)
        for _ in range(12): s.add_task('same', 1)
        self.assertEqual([s.dispatch(0, 'w', 10)['id'] for _ in range(12)], list(range(1, 13)))
        self.assertEqual([row['id'] for row in s.active(0, 'w')], list(range(1, 13)))

    def test_capacity_duplicates_and_failed_dispatch_do_not_consume_tokens(self):
        s = exercise.TaskScheduler()
        self.assertTrue(s.add_worker('w', 1)); self.assertFalse(s.add_worker('w', 99))
        s.add_task('one', 1); s.add_task('two', 0)
        self.assertIsNone(s.dispatch(0, 'unknown', 10))
        first = s.dispatch(0, 'w', 10)
        self.assertEqual(first['token'], 1)
        self.assertIsNone(s.dispatch(0, 'w', 10))
        self.assertEqual(s.get_task(0, 2)['status'], 'pending')
        self.assertEqual(s.get_task(0, 1), first)
        self.assertTrue(s.complete(0, 1, first['token']))
        self.assertEqual(s.dispatch(0, 'w', 10)['token'], 2)

    def test_expiry_boundary_requeues_and_reclaims_capacity(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 1)
        s.add_task('retry', 2)
        first = s.dispatch(5, 'w', 5)
        self.assertEqual(s.active(9, 'w'), [first])
        self.assertFalse(s.complete(10, 1, first['token']))
        self.assertEqual(s.active(10, 'w'), [])
        self.assertEqual(s.get_task(10, 1), dict(id=1, name='retry', priority=2, status='pending', worker=None, expires_at=None, token=None))
        again = s.dispatch(10, 'w', 3)
        self.assertEqual((again['id'], again['token'], again['expires_at']), (1, 2, 13))

    def test_stale_completion_cannot_finish_new_lease_same_worker(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 1); s.add_task('x', 1)
        first = s.dispatch(1, 'w', 2)
        second = s.dispatch(3, 'w', 10)
        self.assertFalse(s.complete(3, 1, first['token']))
        self.assertEqual(s.get_task(3, 1), second)
        self.assertTrue(s.complete(3, 1, second['token']))
        self.assertEqual(s.get_task(3, 1)['status'], 'done')

    def test_manual_completion_permanent_and_immediate_quota_release(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 1)
        s.add_task('one', 1); s.add_task('two', 0)
        first = s.dispatch(0, 'w', 100)
        self.assertTrue(s.complete(1, 1, first['token']))
        self.assertEqual(s.get_task(1, 1), dict(id=1, name='one', priority=1, status='done', worker=None, expires_at=None, token=None))
        self.assertFalse(s.complete(1, 1, first['token']))
        second = s.dispatch(1, 'w', 100)
        self.assertEqual(second['id'], 2)
        self.assertTrue(s.complete(2, 2, second['token']))
        self.assertIsNone(s.dispatch(1000, 'w', 1))

    def test_wrong_token_and_unknown_task_preserve_assignment(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 1); s.add_task('x', 1)
        current = s.dispatch(0, 'w', 10)
        self.assertFalse(s.complete(0, 1, 999))
        self.assertFalse(s.complete(0, 99, current['token']))
        self.assertEqual(s.get_task(0, 1), current)
        self.assertEqual(s.active(0, 'w'), [current])

    def test_workers_have_separate_capacity_and_active_views(self):
        s = exercise.TaskScheduler(); s.add_worker('a', 1); s.add_worker('b', 2)
        for name in ('x', 'y', 'z'): s.add_task(name, 1)
        one = s.dispatch(0, 'a', 10)
        two = s.dispatch(0, 'b', 10); three = s.dispatch(0, 'b', 10)
        self.assertEqual(s.active(0, 'a'), [one])
        self.assertEqual(s.active(0, 'b'), [two, three])
        self.assertIsNone(s.dispatch(0, 'a', 10))
        self.assertIsNone(s.dispatch(0, 'b', 10))

    def test_snapshot_dictionaries_and_lists_are_detached(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 1); s.add_task('x', 1)
        row = s.dispatch(0, 'w', 10); row['status'] = 'done'; row['name'] = 'bad'
        current = s.get_task(0, 1); current['token'] = 999
        rows = s.active(0, 'w'); rows[0]['worker'] = 'bad'; rows.append({})
        self.assertEqual(s.get_task(0, 1), dict(id=1, name='x', priority=1, status='running', worker='w', expires_at=10, token=1))
        self.assertEqual(len(s.active(0, 'w')), 1)

    def test_invalid_durations_and_capacity_do_not_advance_time_or_expire(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 1); s.add_task('x', 1)
        row = s.dispatch(1, 'w', 10)
        for value in (0, -1):
            with self.assertRaises(ValueError): s.dispatch(100, 'w', value)
            with self.assertRaises(ValueError): s.add_worker('w', value)
            with self.assertRaises(ValueError): s.add_worker('new', value)
        self.assertEqual(s.get_task(2, 1), row)
        self.assertTrue(s.add_worker('new', 1))
        s.add_task('y', 0)
        self.assertEqual(s.dispatch(2, 'new', 1)['token'], 2)

    def test_regressing_timestamps_preserve_state(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 1); s.add_task('x', 1)
        row = s.dispatch(5, 'w', 10)
        calls = [lambda: s.dispatch(4, 'w', 1), lambda: s.complete(4, 1, row['token']),
                 lambda: s.get_task(4, 1), lambda: s.active(4, 'w'), lambda: s.get_task(-1, 1)]
        for call in calls:
            with self.assertRaises(ValueError): call()
        self.assertEqual(s.get_task(5, 1), row)
        self.assertTrue(s.complete(5, 1, row['token']))

    def test_valid_failed_requests_advance_time_and_apply_expiry(self):
        for request in (lambda s: s.dispatch(5, 'unknown', 1), lambda s: s.complete(5, 999, 999),
                        lambda s: s.get_task(5, 999), lambda s: s.active(5, 'unknown')):
            s = exercise.TaskScheduler(); s.add_worker('w', 1); s.add_task('x', 1)
            s.dispatch(0, 'w', 5); request(s)
            with self.assertRaises(ValueError): s.get_task(4, 1)
            self.assertEqual(s.get_task(5, 1)['status'], 'pending')
            self.assertEqual(s.dispatch(5, 'w', 2)['token'], 2)

    def test_empty_dispatch_does_not_consume_token(self):
        s = exercise.TaskScheduler(); s.add_worker('w', 1)
        self.assertIsNone(s.dispatch(0, 'w', 1))
        self.assertEqual(s.add_task('x', 0), 1)
        self.assertEqual(s.dispatch(0, 'w', 1)['token'], 1)

    def test_instances_have_independent_clocks_ids_tokens_and_workers(self):
        a, b = exercise.TaskScheduler(), exercise.TaskScheduler()
        a.add_task('a', 1); a.add_worker('w', 1); a.dispatch(100, 'w', 1)
        self.assertIsNone(b.dispatch(0, 'w', 1))
        self.assertTrue(b.add_worker('w', 1))
        self.assertEqual(b.add_task('b', 1), 1)
        row = b.dispatch(0, 'w', 1)
        self.assertEqual((row['id'], row['name'], row['token']), (1, 'b', 1))
        self.assertEqual(a.get_task(100, 1)['name'], 'a')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
