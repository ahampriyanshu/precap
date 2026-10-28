"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


class PrototypeTests(unittest.TestCase):
    def test_fifo_and_empty(self):
        q = exercise.MessageQueue()
        self.assertIsNone(q.consume())
        self.assertTrue(q.publish('b', 'first'))
        q.publish('a', 'second')
        self.assertEqual(q.consume(), {'id': 'b', 'payload': 'first'})
        self.assertEqual(q.consume(), {'id': 'a', 'payload': 'second'})
        self.assertIsNone(q.consume())

    def test_lifetime_duplicates(self):
        q = exercise.MessageQueue()
        q.publish('x', 'original')
        self.assertFalse(q.publish('x', 'new'))
        self.assertEqual(q.consume()['payload'], 'original')
        self.assertFalse(q.publish('x', 'again'))
        self.assertIsNone(q.consume())

    def test_independent_and_snapshot(self):
        a, b = exercise.MessageQueue(), exercise.MessageQueue()
        a.publish('', '')
        result = a.consume()
        result['payload'] = 'changed'
        self.assertIsNone(a.consume())
        self.assertIsNone(b.consume())
        self.assertTrue(b.publish('', 'B'))


class FinalTests(unittest.TestCase):
    def broker(self, attempts=2):
        b = exercise.MessageBroker(attempts)
        b.subscribe('A')
        return b

    def test_fifo_with_acknowledgments(self):
        b = self.broker()
        self.assertIsNone(b.poll('A'))
        b.publish('m2', 'first')
        b.publish('m1', 'second')
        self.assertEqual(b.poll('A'), {'id': 'm2', 'payload': 'first', 'attempt': 1})
        self.assertTrue(b.ack('A', 'm2'))
        self.assertEqual(b.poll('A')['id'], 'm1')
        self.assertTrue(b.ack('A', 'm1'))
        self.assertIsNone(b.poll('A'))

    def test_independent_groups_include_old_messages(self):
        b = self.broker()
        b.publish('x', 'payload')
        b.poll('A')
        b.ack('A', 'x')
        self.assertTrue(b.subscribe('B'))
        self.assertEqual(b.poll('B'), {'id': 'x', 'payload': 'payload', 'attempt': 1})
        self.assertIsNone(b.poll('A'))
        b.publish('y', 'new')
        self.assertEqual(b.poll('A')['id'], 'y')
        self.assertEqual(b.poll('B')['id'], 'x')

    def test_duplicate_subscription_preserves_progress(self):
        b = self.broker()
        b.publish('x', 'X')
        b.poll('A')
        b.ack('A', 'x')
        self.assertFalse(b.subscribe('A'))
        self.assertIsNone(b.poll('A'))
        self.assertEqual(b.dead_letters('A'), [])

    def test_duplicate_publish_preserves_payload_and_positions(self):
        b = self.broker()
        self.assertTrue(b.publish('x', 'original'))
        self.assertFalse(b.publish('x', 'different'))
        self.assertEqual(b.poll('A')['payload'], 'original')
        b.ack('A', 'x')
        self.assertFalse(b.publish('x', 'after ack'))
        self.assertIsNone(b.poll('A'))
        b.subscribe('B')
        self.assertEqual(b.poll('B')['payload'], 'original')

    def test_repeated_poll_is_same_attempt_and_detached(self):
        b = self.broker()
        b.publish('x', 'X')
        first = b.poll('A')
        first['id'] = 'bad'
        first['attempt'] = 99
        self.assertEqual(b.poll('A'), {'id': 'x', 'payload': 'X', 'attempt': 1})
        self.assertTrue(b.ack('A', 'x'))

    def test_retry_blocks_later_message_and_resets_attempt(self):
        b = self.broker(3)
        b.publish('x', 'X')
        b.publish('y', 'Y')
        b.poll('A')
        self.assertEqual(b.nack('A', 'x'), 'retry')
        self.assertFalse(b.ack('A', 'x'))
        self.assertIsNone(b.nack('A', 'x'))
        self.assertEqual(b.poll('A')['attempt'], 2)
        self.assertTrue(b.ack('A', 'x'))
        self.assertEqual(b.poll('A'), {'id': 'y', 'payload': 'Y', 'attempt': 1})

    def test_attempt_limit_routes_exactly_once(self):
        b = self.broker()
        b.publish('x', 'X')
        b.publish('y', 'Y')
        b.poll('A')
        self.assertEqual(b.nack('A', 'x'), 'retry')
        self.assertEqual(b.poll('A')['attempt'], 2)
        self.assertEqual(b.nack('A', 'x'), 'dead-letter')
        self.assertIsNone(b.nack('A', 'x'))
        self.assertFalse(b.ack('A', 'x'))
        self.assertEqual(b.dead_letters('A'), [{'id': 'x', 'payload': 'X', 'attempts': 2}])
        self.assertEqual(b.poll('A')['id'], 'y')
        self.assertEqual(b.poll('A')['attempt'], 1)

    def test_one_attempt_and_dead_letter_order(self):
        b = self.broker(1)
        for mid in ['b', 'a']:
            b.publish(mid, mid.upper())
        for mid in ['b', 'a']:
            self.assertEqual(b.poll('A')['id'], mid)
            self.assertEqual(b.nack('A', mid), 'dead-letter')
        self.assertEqual([entry['id'] for entry in b.dead_letters('A')], ['b', 'a'])
        self.assertIsNone(b.poll('A'))

    def test_failures_do_not_affect_other_groups(self):
        b = self.broker(1)
        b.subscribe('B')
        b.publish('x', 'X')
        b.poll('A')
        b.nack('A', 'x')
        self.assertEqual(b.poll('B')['attempt'], 1)
        self.assertTrue(b.ack('B', 'x'))
        self.assertEqual(b.dead_letters('B'), [])
        self.assertEqual(len(b.dead_letters('A')), 1)

    def test_invalid_acks_preserve_inflight(self):
        b = self.broker()
        b.publish('x', 'X')
        self.assertFalse(b.ack('A', 'x'))
        self.assertIsNone(b.nack('A', 'x'))
        b.poll('A')
        self.assertFalse(b.ack('A', 'wrong'))
        self.assertIsNone(b.nack('A', 'wrong'))
        self.assertIsNone(b.poll('unknown'))
        self.assertFalse(b.ack('unknown', 'x'))
        self.assertIsNone(b.nack('unknown', 'x'))
        self.assertEqual(b.dead_letters('unknown'), [])
        self.assertEqual(b.poll('A')['attempt'], 1)
        self.assertTrue(b.ack('A', 'x'))
        self.assertFalse(b.ack('A', 'x'))

    def test_dead_letter_snapshots(self):
        b = self.broker(1)
        b.publish('', '')
        b.poll('A')
        b.nack('A', '')
        view = b.dead_letters('A')
        view[0]['payload'] = 'bad'
        view.append({})
        self.assertEqual(b.dead_letters('A'), [{'id': '', 'payload': '', 'attempts': 1}])

    def test_constructor_and_instances(self):
        for limit in [0, -1]:
            with self.assertRaises(ValueError):
                exercise.MessageBroker(limit)
        a, b = self.broker(), self.broker()
        a.publish('x', 'X')
        self.assertIsNone(b.poll('A'))
        self.assertTrue(b.publish('x', 'other'))
        self.assertEqual(a.poll('A')['payload'], 'X')
        self.assertEqual(b.poll('A')['payload'], 'other')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
