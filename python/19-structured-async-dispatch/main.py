"""Executable learning contract; Python 3.11+; standard library only."""
from __future__ import annotations
import argparse
import asyncio
import contextlib
import copy
import io
import json
import logging
import os
from pathlib import Path
import queue
import tempfile
import threading
import unittest
from unittest import mock
from decimal import Decimal
import exercise

WARMUPS = []

class PrototypeTests(unittest.TestCase):
    def test_small_version(self):
        for name,args,expected in WARMUPS:
            with self.subTest(case=name):
                self.assertEqual(exercise.prototype(*copy.deepcopy(args)),expected)


class FinalTests(unittest.IsolatedAsyncioTestCase):
    async def test_order_duplicates_and_concurrency_bound(self):
        active=0;peak=0;seen=[]
        async def fetch(ident):
            nonlocal active,peak
            active+=1;peak=max(peak,active);seen.append(ident)
            try:await asyncio.sleep(0);return ident*10
            finally:active-=1
        self.assertEqual(await exercise.collect([3,1,3,2],fetch,limit=2),[30,10,30,20])
        self.assertEqual(seen.count(3),2);self.assertEqual(peak,2);self.assertEqual(active,0)
    async def test_failure_cancels_and_awaits_siblings(self):
        ready=asyncio.Event();started=set();cleaned=set()
        async def fetch(ident):
            started.add(ident)
            if len(started)==2:ready.set()
            try:
                await ready.wait()
                if ident==0:raise OSError('carrier down')
                await asyncio.Event().wait()
            finally:cleaned.add(ident)
        with self.assertRaises(ExceptionGroup) as caught:
            await asyncio.wait_for(exercise.collect([0,1],fetch,limit=2),5)
        self.assertTrue(any(isinstance(e,OSError) for e in caught.exception.exceptions));self.assertEqual(cleaned,{0,1})
    async def test_outer_cancellation_owns_cleanup(self):
        started=asyncio.Event();cleaned=asyncio.Event()
        async def fetch(ident):
            started.set()
            try:await asyncio.Event().wait()
            finally:cleaned.set()
        task=asyncio.create_task(exercise.collect([1],fetch,limit=1))
        await asyncio.wait_for(started.wait(),5);task.cancel()
        with self.assertRaises(asyncio.CancelledError):await task
        self.assertTrue(cleaned.is_set())
    async def test_empty_and_validation(self):
        async def fetch(ident):return ident
        self.assertEqual(await exercise.collect([],fetch,limit=1),[])
        with self.assertRaises(ValueError):await exercise.collect([],fetch,limit=0)

class AsyncPrototypeTests(unittest.IsolatedAsyncioTestCase):
    async def test_sequential_small_version(self):
        seen=[]
        async def fetch(ident):seen.append(ident);return ident*2
        self.assertEqual(await exercise.prototype([2,1,2],fetch),[4,2,4]);self.assertEqual(seen,[2,1,2])
PrototypeTests=AsyncPrototypeTests


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage',choices=['prototype','final'],default='final')
    options,remaining=parser.parse_known_args()
    loader=unittest.TestLoader()
    suite=loader.loadTestsFromTestCase(PrototypeTests if options.stage=='prototype' else FinalTests)
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(not result.wasSuccessful())
