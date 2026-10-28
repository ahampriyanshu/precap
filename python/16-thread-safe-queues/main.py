"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise
import queue
import threading

STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_type(self):
        self.assertIsInstance(exercise.make_queue([]), queue.Queue)


    def test_fifo(self):
        jobs=exercise.make_queue([3, 1, 2])
        self.assertEqual([jobs.get_nowait() for _ in range(3)], [3, 1, 2])


    def test_empty(self):
        with self.assertRaises(queue.Empty):
            exercise.make_queue([]).get_nowait()


    def test_duplicates(self):
        jobs=exercise.make_queue([0, 0])
        self.assertEqual([jobs.get_nowait(), jobs.get_nowait()], [0, 0])


    def test_fresh_nonmutation(self):
        values=[1, 2]
        a=exercise.make_queue(values)
        b=exercise.make_queue(values)
        a.get_nowait()
        self.assertEqual(b.qsize(), 2)
        self.assertEqual(values, [1, 2])


class FinalTests(unittest.TestCase):
    def test_squares(self):
        jobs=queue.Queue()
        results=queue.Queue()
        for value in (2, -3, None): jobs.put(value)
        self.assertIsNone(exercise.square_worker(jobs, results))
        self.assertEqual([results.get_nowait(), results.get_nowait()], [4, 9])
        self.assertEqual(jobs.unfinished_tasks, 0)


    def test_sentinel_only(self):
        jobs=queue.Queue()
        results=queue.Queue()
        jobs.put(None)
        exercise.square_worker(jobs, results)
        self.assertTrue(results.empty())
        self.assertEqual(jobs.unfinished_tasks, 0)


    def test_zero(self):
        jobs=queue.Queue()
        results=queue.Queue()
        for value in (0, None): jobs.put(value)
        exercise.square_worker(jobs, results)
        self.assertEqual(results.get_nowait(), 0)


    def test_stop_boundary(self):
        jobs=queue.Queue()
        results=queue.Queue()
        for value in (None, 8): jobs.put(value)
        exercise.square_worker(jobs, results)
        self.assertEqual(jobs.get_nowait(), 8)
        self.assertEqual(jobs.unfinished_tasks, 1)


    def test_failed_output_acknowledged(self):
        jobs=queue.Queue()
        jobs.put(2)
        class BrokenResults:
            def put(self, value): raise RuntimeError("output")
        with self.assertRaisesRegex(RuntimeError, "output"):
            exercise.square_worker(jobs, BrokenResults())
        self.assertEqual(jobs.unfinished_tasks, 0)


    def test_thread_integration(self):
        jobs=queue.Queue()
        results=queue.Queue()
        for value in (1, 2, 3, None): jobs.put(value)
        thread=threading.Thread(target=exercise.square_worker, args=(jobs, results))
        thread.start()
        thread.join()
        self.assertEqual(jobs.unfinished_tasks, 0)
        jobs.join()
        self.assertEqual([results.get_nowait() for _ in range(3)], [1, 4, 9])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
