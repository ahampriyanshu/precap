# Harborline: Python Engineering Journeys

Two connected learning paths about a relief-logistics operation, from its first handwritten manifest to a city-wide dispatch service. Each directory introduces a distinct design pressure. The curriculum is organized by prerequisites and changed requirements, not by a target question count.

Mira runs dispatch; Ishan builds its software. They face recurring concerns—stock, manifests, depots, roads, carriers and failures—so later chapters extend earlier decisions instead of replacing them with unrelated interview puzzles. The tracks share the setting but are independently runnable. These are learning directories, not Git repositories.

## Start here

Use **Python 3.11 or later** and the standard library. There are no packages to install, external services, credentials or network calls. In this workspace a Python 3.12 interpreter is available at `/Users/priyanshu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`; use it if your default `python3` is older.

1. Read one chapter's `README.md`. It contains the complete story and contract.
2. Complete the small `prototype` in `exercise.py`, then run its tests.
3. Explain the failure/cost of that approach before implementing the final function or classes.
4. Complete the final API and run its tests. Read the next handoff after you can explain the invariant, not only after tests pass.

```bash
python3 run.py --list
python3 run.py dsa/01-first-manifest --stage prototype
python3 run.py dsa/01-first-manifest --stage final
python3 run.py --check
```

You can also run `python3 main.py --stage final` from any chapter directory. `run.py --all` runs every chapter, but unfinished exercises will fail; that is expected. The runner applies a safety timeout to each child process so a broken concurrency exercise cannot hang the entire course indefinitely.

## What is inside each chapter

- **README.md:** connected incident, historical/design context, small starting task, concrete failure, final contract, reasoning prompts and next handoff.
- **exercise.py:** imports, public shapes and implementation stubs. Complete these; no answer keys are included.
- **main.py:** executable standard-library tests, named counterexamples and edge cases. DSA chapters also contain deterministic generated examples and input-preservation checks; concurrency chapters test shutdown, propagation and resource ownership.

Tests establish the observable contract, not a mathematical complexity proof. An inefficient algorithm may pass small functional cases; explain the target complexity and inspect the structure you used. There are no machine-speed assertions. DSA prototypes intentionally use tiny inputs; some final-only inputs exercise additional scale. Python prototype tests isolate the smaller starting task rather than pretending that the final API has no new requirements.

The linked-list chapter also provides Node/detach and identity tests: a list-shaped output is not a substitute for preserving real linked nodes. Concurrency failure tests use barriers/events and bounded safety waits. Implementations that deadlock may still hit a safety timeout, which is a test failure, not a benchmark result.

## History without invented biographies

Harborline is fictional. Dijkstra, Kruskal, Floyd, Bellman and Prim chapters distinguish their documented mathematical/design problems from our adapted story and link primary sources. Foundational operations and general structures do not have fabricated single-inventor anecdotes. Python chapters link the official mechanism documentation. No claim is made that a historical inventor literally encountered this fictional logistics platform.

## Algorithms: the relief network grows

| Chapter | New design pressure |
| --- | --- |
| [The first manifest](dsa/01-first-manifest/README.md) | array scans and loop invariants |
| [Letters become inventory](dsa/02-label-shortages/README.md) | strings, frequency maps and hashing |
| [The radio repeats itself](dsa/03-radio-patterns/README.md) | string search and KMP failure links |
| [One manifest, many shift reports](dsa/04-shift-totals/README.md) | prefix sums and half-open ranges |
| [A truck can carry only so many cargo kinds](dsa/05-mixed-load-window/README.md) | sliding windows with frequency counts |
| [Two crates, one exact pallet](dsa/06-balanced-pallets/README.md) | sorting and two pointers |
| [Buying the smallest workable truck](dsa/07-fleet-capacity/README.md) | binary search over a monotone answer |
| [Detaching closed depots](dsa/08-rerouting-linked-stops/README.md) | linked-list pointer surgery |
| [The pallet at the back blocks the door](dsa/09-loading-stack/README.md) | stacks and nested obligations |
| [The busiest recent loading window](dsa/10-conveyor-peaks/README.md) | monotone deques |
| [One arrival board from many depots](dsa/11-arrival-heap/README.md) | heaps and k-way merging |
| [Serve the most ships with one dock](dsa/12-dock-greedy/README.md) | greedy interval scheduling and exchange arguments |
| [When the largest pack is the wrong choice](dsa/13-relief-pack-dp/README.md) | dynamic programming: optimal substructure and reusable states |
| [One copy of each medical kit](dsa/14-medical-knapsack/README.md) | 0/1 knapsack and dependency-safe DP updates |
| [Two depots disagree about a manifest](dsa/15-manifest-reconciliation/README.md) | two-dimensional DP and edit distance |
| [An early choice can strand the next ship](dsa/16-berth-backtracking/README.md) | backtracking, rollback and search pruning |
| [Inspect the depot hierarchy by distance](dsa/17-inspection-tree/README.md) | binary trees, traversals and queues |
| [Find the nearest lower storage code](dsa/18-bst-depot-index/README.md) | binary search trees, deletion and ordering invariants |
| [Complete a depot name before the radio drops](dsa/19-trie-radio-directory/README.md) | tries and prefix indexes |
| [The depot map is no longer a tree](dsa/20-road-bfs/README.md) | graph representation and breadth-first search |
| [Road repairs must happen in the right order](dsa/21-repair-dependencies/README.md) | directed graphs, cycles and topological sorting |
| [The fewest roads is not the fastest ambulance](dsa/22-ambulance-dijkstra/README.md) | Dijkstra and nonnegative shortest paths |
| [Subsidies invalidate the greedy frontier](dsa/23-rebate-bellman-ford/README.md) | Bellman-Ford, relaxation and negative cycles |
| [Every depot asks about every other depot](dsa/24-city-floyd-warshall/README.md) | Floyd-Warshall and DP over allowed intermediate vertices |
| [Connect the city without buying redundant cable](dsa/25-fiber-kruskal/README.md) | disjoint sets, Kruskal and the cut property |
| [The cable supplier quotes every pair](dsa/26-dense-network-prim/README.md) | Prim and representation-dependent algorithm choice |
| [Yesterday’s prefix sums cannot absorb today’s corrections](dsa/27-live-ledger-fenwick/README.md) | Fenwick trees and dynamic prefix aggregates |
| [An increase can erase the old minimum](dsa/28-cold-chain-segment-tree/README.md) | segment trees and associative summaries |

## Python: the dispatch script becomes a service

| Chapter | New design pressure |
| --- | --- |
| [The first shipping quote](python/01-exact-prices/README.md) | values, types, Decimal and rounding |
| [Allocate stock in arrival order](python/02-dispatch-decisions/README.md) | branches, loops, dictionaries, copies and comprehensions |
| [The second call inherits the first call’s seals](python/03-function-boundaries/README.md) | function binding, keyword-only arguments and mutable defaults |
| [Reject a malformed radio record before it changes stock](python/04-strict-radio-parser/README.md) | Unicode text, unpacking, exceptions and precise validation |
| [A crash must not erase the previous manifest](python/05-atomic-manifest-files/README.md) | modules, JSON, filesystem I/O and exception-safe replacement |
| [A dictionary typo reaches the loading bay](python/06-typed-shipment-model/README.md) | annotations, dataclasses and runtime invariants |
| [Make invalid inventory states unreachable](python/07-inventory-object/README.md) | classes, encapsulation and instance ownership |
| [Add drones without rewriting the dispatcher](python/08-carrier-polymorphism/README.md) | abstract classes, inheritance and substitutability |
| [Change carrier and audit policy independently](python/09-composed-dispatch/README.md) | composition, structural protocols and dependency injection |
| [A million records must not become a million objects](python/10-lazy-manifest-batches/README.md) | iterators, generators and single-pass ownership |
| [Retry a transient outage without hiding a bad request](python/11-retry-decorator/README.md) | closures, decorators and exception selection |
| [Rollback a reservation if dispatch fails](python/12-reservation-context/README.md) | context managers, generators and exception propagation |
| [The same shipment appears twice in a set](python/13-identity-data-model/README.md) | dunder methods, immutability, equality, hashing and ordering |
| [Reuse field validation without sharing field values](python/14-validated-descriptors/README.md) | descriptors, __set_name__ and instance storage |
| [Two dispatchers reserve the last crate](python/15-atomic-threaded-stock/README.md) | threads, locks and atomic invariants |
| [The input desk must not outrun the workers](python/16-bounded-worker-queue/README.md) | bounded queues, task accounting and graceful shutdown |
| [Finish out of order, report in request order](python/17-ordered-futures/README.md) | ThreadPoolExecutor, futures and exception ownership |
| [CPU work needs a different boundary](python/18-spawned-process-workers/README.md) | multiprocessing spawn, pickling and import safety |
| [Cancel the shipment group without orphaning work](python/19-structured-async-dispatch/README.md) | async/await, semaphores, TaskGroup and cancellation |
