"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise
import asyncio
import inspect

STAGE = "final"

class PrototypeTests(unittest.IsolatedAsyncioTestCase):
    async def test_double(self):
        self.assertEqual(await exercise.double_later(3), 6)


    async def test_zero(self):
        self.assertEqual(await exercise.double_later(0), 0)


    async def test_negative(self):
        self.assertEqual(await exercise.double_later(-2), -4)


    async def test_coroutine_function(self):
        self.assertTrue(inspect.iscoroutinefunction(exercise.double_later))


    async def test_yields_control(self):
        events=[]
        async def marker(): events.append("marker")
        task=asyncio.create_task(marker())
        await exercise.double_later(1)
        self.assertEqual(events, ["marker"])
        await task


class FinalTests(unittest.IsolatedAsyncioTestCase):
    async def test_results_order(self):
        async def operation(value):
            for _ in range(value): await asyncio.sleep(0)
            return value*10
        self.assertEqual(await exercise.async_map([3, 1, 2], operation), [30, 10, 20])


    async def test_empty(self):
        async def operation(value): return value
        self.assertEqual(await exercise.async_map([], operation), [])


    async def test_limit(self):
        active=0
        peak=0
        async def operation(value):
            nonlocal active, peak
            active+=1
            peak=max(peak, active)
            await asyncio.sleep(0)
            active-=1
            return value
        self.assertEqual(await exercise.async_map(list(range(5)), operation, limit=2), list(range(5)))
        self.assertEqual(peak, 2)


    async def test_one_at_a_time(self):
        active=0
        async def operation(value):
            nonlocal active
            active+=1
            self.assertEqual(active, 1)
            await asyncio.sleep(0)
            active-=1
            return value
        self.assertEqual(await exercise.async_map([1, 2], operation, limit=1), [1, 2])


    async def test_invalid_limit(self):
        async def operation(value): return value
        for limit in (0, -1):
            with self.subTest(limit=limit), self.assertRaises(ValueError):
                await exercise.async_map([], operation, limit=limit)


    async def test_failure_cleanup(self):
        started=asyncio.Event()
        cleaned=[]
        async def operation(value):
            if value==0:
                await asyncio.sleep(0)
                self.assertTrue(started.is_set(), "operations must overlap")
                raise ValueError("operation")
            try:
                started.set()
                await asyncio.Event().wait()
            finally: cleaned.append(value)
        with self.assertRaisesRegex(ValueError, "operation"):
            await exercise.async_map([0, 1], operation, limit=2)
        self.assertEqual(cleaned, [1])


    async def test_cancellation_cleanup(self):
        started=asyncio.Event()
        cleaned=[]
        async def operation(value):
            try:
                started.set()
                await asyncio.Event().wait()
            finally: cleaned.append(value)
        task=asyncio.create_task(exercise.async_map([1], operation))
        waiter=asyncio.create_task(started.wait())
        try:
            done, _=await asyncio.wait([task, waiter], return_when=asyncio.FIRST_COMPLETED)
            if task in done: await task
            task.cancel()
            with self.assertRaises(asyncio.CancelledError): await task
            self.assertEqual(cleaned, [1])
        finally:
            for pending in (task, waiter):
                if not pending.done(): pending.cancel()
            await asyncio.gather(task, waiter, return_exceptions=True)


    async def test_duplicates_nonmutation(self):
        values=[2, 2, 1]
        seen=[]
        async def operation(value):
            seen.append(value)
            await asyncio.sleep(0)
            return value
        self.assertEqual(await exercise.async_map(values, operation), values)
        self.assertEqual(values, [2, 2, 1])
        self.assertEqual(sorted(seen), [1, 2, 2])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
