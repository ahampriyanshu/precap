"""Run the repository's unchanged unittest contracts on Pyodide's existing event loop.

Native thread/process chapters are intentionally handled by the local download flow.
Async TestCases are awaited directly: asyncio.Runner cannot nest inside the browser loop.
"""
import asyncio
import inspect
import io
import json
import linecache
import os
import sys
import time
import traceback
import types
import unittest


class BrowserResult(unittest.TestResult):
    def __init__(self):
        super().__init__()
        self.checks = []
        self.subtests = {}

    def record(self, test, status, error=None):
        name = str(test)
        detail = "".join(traceback.format_exception(*error))[-6000:] if error else ""
        self.checks.append({"name": name, "status": status, "detail": detail})

    def addSuccess(self, test):
        super().addSuccess(test)
        if not self.subtests.get(test.id()):
            self.record(test, "passed")

    def addFailure(self, test, error):
        super().addFailure(test, error)
        self.record(test, "failed", error)

    def addError(self, test, error):
        super().addError(test, error)
        self.record(test, "error", error)

    def addSkip(self, test, reason):
        super().addSkip(test, reason)
        self.checks.append({"name": str(test), "status": "skipped", "detail": reason})

    def addSubTest(self, test, subtest, error):
        super().addSubTest(test, subtest, error)
        self.subtests[test.id()] = True
        status = "passed" if error is None else ("failed" if issubclass(error[0], AssertionError) else "error")
        self.record(subtest, status, error)


def flatten(suite):
    for item in suite:
        if isinstance(item, unittest.TestSuite):
            yield from flatten(item)
        else:
            yield item


async def run_async_case(test, result):
    # These curriculum cases use per-method setup/teardown and async cleanups.
    # Give every case its own task and cancel any tasks it leaks before proceeding.
    before = asyncio.all_tasks()
    result.startTest(test)
    failure = None
    setup_finished = False
    try:
        test.setUp()
        await test.asyncSetUp()
        setup_finished = True
        value = getattr(test, test._testMethodName)()
        if inspect.isawaitable(value):
            await value
    except unittest.SkipTest as exc:
        result.addSkip(test, str(exc))
        failure = "skip"
    except BaseException:
        failure = sys.exc_info()
    finally:
        if setup_finished:
            try:
                await test.asyncTearDown()
                test.tearDown()
            except BaseException:
                failure = failure or sys.exc_info()
        while test._cleanups:
            fn, args, kwargs = test._cleanups.pop()
            try:
                value = fn(*args, **kwargs)
                if inspect.isawaitable(value):
                    await value
            except BaseException:
                failure = failure or sys.exc_info()
        leaked = [task for task in asyncio.all_tasks() - before if not task.done() and task is not asyncio.current_task()]
        if leaked:
            for task in leaked:
                task.cancel()
            await asyncio.gather(*leaked, return_exceptions=True)
            if failure is None:
                error = AssertionError("The test left unfinished async tasks behind")
                failure = (type(error), error, error.__traceback__)
    if failure is None:
        result.addSuccess(test)
    elif failure != "skip":
        if issubclass(failure[0], AssertionError):
            result.addFailure(test, failure)
        else:
            result.addError(test, failure)
    result.stopTest(test)


async def run_curriculum():
    payload = json.loads(__lesson_payload)
    started = time.perf_counter()
    result = BrowserResult()
    try:
        folder = "/home/pyodide/chapter"
        os.makedirs(folder, exist_ok=True)
        os.chdir(folder)
        for name, content in (("exercise.py", payload["code"]), ("main.py", payload["tests"])):
            with open(name, "w", encoding="utf-8") as handle:
                handle.write(content)
            full = folder + "/" + name
            linecache.cache[full] = (len(content), None, content.splitlines(True), full)
        exercise = types.ModuleType("exercise")
        exercise.__file__ = folder + "/exercise.py"
        sys.modules["exercise"] = exercise
        exec(compile(payload["code"], exercise.__file__, "exec"), exercise.__dict__)
        tests = types.ModuleType("chapter_tests")
        tests.__file__ = folder + "/main.py"
        sys.modules["chapter_tests"] = tests
        exec(compile(payload["tests"], tests.__file__, "exec"), tests.__dict__)
        tests.STAGE = payload["stage"]
        loader = unittest.TestLoader()
        if payload["track"] == "dsa":
            suite = loader.loadTestsFromTestCase(tests.ContractTests)
            if payload["stage"] == "final" and hasattr(tests, "PointerTests"):
                suite.addTests(loader.loadTestsFromTestCase(tests.PointerTests))
        else:
            cls = tests.PrototypeTests if payload["stage"] == "prototype" else tests.FinalTests
            suite = loader.loadTestsFromTestCase(cls)
        for test in flatten(suite):
            if isinstance(test, unittest.IsolatedAsyncioTestCase):
                await run_async_case(test, result)
            else:
                test.run(result)
        passed = result.wasSuccessful() and not result.skipped and bool(result.checks)
    except BaseException:
        error = sys.exc_info()
        result.checks.append({"name": "Load exercise", "status": "error", "detail": "".join(traceback.format_exception(*error))[-6000:]})
        passed = False
    return json.dumps({
        "checks": result.checks, "passed": passed, "methods": result.testsRun,
        "skipped": len(result.skipped), "duration": time.perf_counter() - started,
    })


await run_curriculum()
