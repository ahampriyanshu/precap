"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise
import threading

STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_result(self):
        self.assertEqual(exercise.submit_one(abs, -4), 4)


    def test_none_result(self):
        self.assertIsNone(exercise.submit_one(lambda x: None, 1))


    def test_worker_thread(self):
        main_id=threading.get_ident()
        self.assertNotEqual(exercise.submit_one(lambda value: threading.get_ident(), 0), main_id)


    def test_exception(self):
        def fail(value): raise ValueError("worker")
        with self.assertRaisesRegex(ValueError, "worker"):
            exercise.submit_one(fail, 1)


    def test_independent_calls(self):
        self.assertEqual(exercise.submit_one(abs, -1), 1)
        self.assertEqual(exercise.submit_one(abs, -2), 2)


class FinalTests(unittest.TestCase):
    def test_ordered(self):
        self.assertEqual(exercise.map_in_threads(abs, [-2, 0, -1]), [2, 0, 1])


    def test_empty(self):
        self.assertEqual(exercise.map_in_threads(abs, []), [])


    def test_duplicates(self):
        seen=[]
        lock=threading.Lock()
        def record(value):
            with lock: seen.append(value)
            return value*2
        self.assertEqual(exercise.map_in_threads(record, [3, 3, 1]), [6, 6, 2])
        self.assertEqual(sorted(seen), [1, 3, 3])


    def test_positive_workers(self):
        for workers in (0, -1):
            with self.subTest(workers=workers), self.assertRaises(ValueError):
                exercise.map_in_threads(abs, [], workers=workers)


    def test_worker_thread(self):
        main_id=threading.get_ident()
        identities=exercise.map_in_threads(lambda value: threading.get_ident(), [1, 2], workers=1)
        self.assertTrue(all(identity != main_id for identity in identities))


    def test_failure_and_shutdown(self):
        finished=[]
        lock=threading.Lock()
        def work(value):
            try:
                if value==0: raise ValueError("worker")
                return value
            finally:
                with lock: finished.append(value)
        with self.assertRaisesRegex(ValueError, "worker"):
            exercise.map_in_threads(work, [1, 0, 2])
        self.assertEqual(sorted(finished), [0, 1, 2])


    def test_nonmutation(self):
        values=[-2, -1]
        exercise.map_in_threads(abs, values)
        self.assertEqual(values, [-2, -1])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
