"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_accept_and_deny(self):
        self.assertEqual(exercise.allow_request([], 2, 10, 0), (True, [0]))
        self.assertEqual(exercise.allow_request([0, 0], 2, 10, 0), (False, [0, 0]))

    def test_exact_left_boundary(self):
        self.assertEqual(exercise.allow_request([0, 1], 2, 10, 10), (True, [1, 10]))
        self.assertEqual(exercise.allow_request([0, 1], 2, 10, 9), (False, [0, 1]))

    def test_input_snapshot_and_overfull_history(self):
        recent = [1, 2, 3]
        allowed, result = exercise.allow_request(recent, 2, 10, 3)
        self.assertFalse(allowed)
        self.assertEqual(result, [1, 2, 3])
        result.clear()
        self.assertEqual(recent, [1, 2, 3])

    def test_invalid_inputs(self):
        for recent, limit, window, now in [([], 0, 10, 0), ([], 1, 0, 0), ([], True, 10, 0), ([], 1, 10, -1), ([2, 1], 2, 10, 2), ([3], 2, 10, 2), ([-1], 2, 10, 2), ([True], 2, 10, 2)]:
            with self.subTest(recent=recent, limit=limit, window=window, now=now), self.assertRaises(ValueError):
                exercise.allow_request(recent, limit, window, now)


class FinalTests(unittest.TestCase):
    def test_initial_state_and_limit(self):
        limiter = exercise.SlidingWindowLimiter(2, 10)
        self.assertEqual(limiter.history("A"), [])
        self.assertTrue(limiter.allow("A", 0))
        self.assertTrue(limiter.allow("A", 0))
        self.assertFalse(limiter.allow("A", 0))
        self.assertEqual(limiter.history("A"), [0, 0])

    def test_exact_expiration_boundary(self):
        limiter = exercise.SlidingWindowLimiter(1, 10)
        self.assertTrue(limiter.allow("A", 0))
        self.assertFalse(limiter.allow("A", 9))
        self.assertTrue(limiter.allow("A", 10))
        self.assertEqual(limiter.history("A"), [10])

    def test_partial_expiration(self):
        limiter = exercise.SlidingWindowLimiter(2, 10)
        limiter.allow("A", 0)
        limiter.allow("A", 4)
        self.assertTrue(limiter.allow("A", 10))
        self.assertEqual(limiter.history("A"), [4, 10])
        self.assertFalse(limiter.allow("A", 13))
        self.assertTrue(limiter.allow("A", 14))
        self.assertEqual(limiter.history("A"), [10, 14])

    def test_denials_do_not_consume_allowance(self):
        limiter = exercise.SlidingWindowLimiter(1, 5)
        limiter.allow("A", 0)
        for now in [1, 2, 3, 4]:
            self.assertFalse(limiter.allow("A", now))
            self.assertEqual(limiter.history("A"), [0])
        self.assertTrue(limiter.allow("A", 5))

    def test_per_client_state_and_clock_isolation(self):
        limiter = exercise.SlidingWindowLimiter(1, 10)
        self.assertTrue(limiter.allow("A", 100))
        self.assertTrue(limiter.allow("B", 0))
        self.assertFalse(limiter.allow("A", 100))
        self.assertFalse(limiter.allow("B", 1))
        self.assertEqual(limiter.history("A"), [100])
        self.assertEqual(limiter.history("B"), [0])

    def test_backward_time_after_success_is_atomic(self):
        limiter = exercise.SlidingWindowLimiter(2, 10)
        limiter.allow("A", 20)
        with self.assertRaises(ValueError):
            limiter.allow("A", 19)
        self.assertEqual(limiter.history("A"), [20])
        self.assertTrue(limiter.allow("A", 20))

    def test_denial_advances_observed_time(self):
        limiter = exercise.SlidingWindowLimiter(1, 10)
        limiter.allow("A", 0)
        self.assertFalse(limiter.allow("A", 9))
        with self.assertRaises(ValueError):
            limiter.allow("A", 8)
        self.assertEqual(limiter.history("A"), [0])
        self.assertTrue(limiter.allow("A", 10))

    def test_large_gap_and_window_one(self):
        limiter = exercise.SlidingWindowLimiter(1, 1)
        self.assertTrue(limiter.allow("A", 0))
        self.assertFalse(limiter.allow("A", 0))
        self.assertTrue(limiter.allow("A", 1))
        self.assertTrue(limiter.allow("A", 1000000))
        self.assertEqual(limiter.history("A"), [1000000])

    def test_invalid_settings_and_requests(self):
        for limit, window in [(0, 1), (1, 0), (-1, 1), (1, -1), (True, 1), (1, 1.5)]:
            with self.subTest(limit=limit, window=window), self.assertRaises(ValueError):
                exercise.SlidingWindowLimiter(limit, window)
        limiter = exercise.SlidingWindowLimiter(2, 10)
        limiter.allow("A", 5)
        for client, now in [("", 6), (None, 6), ("A", -1), ("A", 6.5), ("A", True)]:
            with self.subTest(client=client, now=now), self.assertRaises(ValueError):
                limiter.allow(client, now)
        self.assertEqual(limiter.history("A"), [5])
        self.assertTrue(limiter.allow("A", 5))
        with self.assertRaises(ValueError):
            limiter.history("")

    def test_snapshot_and_instance_isolation(self):
        a = exercise.SlidingWindowLimiter(1, 10)
        b = exercise.SlidingWindowLimiter(1, 10)
        a.allow("A", 0)
        a.history("A").clear()
        self.assertEqual(a.history("A"), [0])
        self.assertEqual(b.history("A"), [])
        self.assertTrue(b.allow("A", 0))

    def test_history_is_relative_to_last_allow(self):
        limiter = exercise.SlidingWindowLimiter(2, 10)
        limiter.allow("A", 0)
        limiter.allow("B", 100)
        self.assertEqual(limiter.history("A"), [0])
        self.assertEqual(limiter.history("unseen"), [])
        self.assertTrue(limiter.allow("A", 10))
        self.assertEqual(limiter.history("A"), [10])

    def test_bounded_reference_model(self):
        import random
        randomizer = random.Random(829)
        limiter = exercise.SlidingWindowLimiter(3, 7)
        histories = {client: [] for client in ["A", "B", "C"]}
        clocks = {client: 0 for client in histories}
        for _ in range(240):
            client = randomizer.choice(list(histories))
            clocks[client] += randomizer.randrange(4)
            now = clocks[client]
            history = [timestamp for timestamp in histories[client] if timestamp > now - 7]
            expected = len(history) < 3
            if expected:
                history.append(now)
            histories[client] = history
            self.assertEqual(limiter.allow(client, now), expected)
            for candidate in histories:
                self.assertEqual(limiter.history(candidate), histories[candidate])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
