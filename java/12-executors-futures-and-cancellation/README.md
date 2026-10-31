# Executors, futures, and cancellation

## Separate a task from its execution policy

Callable describes a result-producing operation that may throw. ExecutorService owns worker scheduling, while Future represents completion, failure, or cancellation of one submission. Future.get blocks and wraps a task failure in ExecutionException; inspect its cause rather than losing the original exception. Submission order, start order, completion order, and result order are distinct choices.

```java
ExecutorService executor = Executors.newFixedThreadPool(2);
try {
    Future<Integer> result = executor.submit(() -> 7);
    assert result.get() == 7;
} finally {
    executor.shutdownNow();
}
```

That fragment shows the lifecycle boundary, not complete production cleanup. A fixed thread pool limits active workers but its default queue is unbounded; a sustained producer can still exhaust memory. A bounded ThreadPoolExecutor queue needs a rejection/backpressure policy. CompletionService is useful for completion-order consumption; iterating Future.get in input order deliberately lets an earlier slow task delay later observed results.

## Cancellation is a request

cancel(true) requests interruption of running work; the task must cooperate. shutdown rejects new submissions, while shutdownNow also attempts interruption and returns queued work that did not start. Neither alone proves all workers have terminated; awaitTermination checks that lifecycle. Preserve interruption when translating a failure, and cancel sibling work when the batch contract promises all-or-failure behavior.

Do not block a worker waiting for dependent work submitted to the same exhausted pool, which can deadlock even without locks. CompletableFuture composes dependent completions but does not erase those execution and cancellation questions; specify executors for blocking stages. Java 21 adds virtual threads as a later feature that reduces the cost of blocking threads. Virtual threads do not make CPU work cheaper or remove the need to bound downstream resources. These exercises stay compatible with Java 17.

## Practice

**Prototype:** `runSequential(List<Callable<Integer>>) -> List<Integer> throws Exception` calls each task in input order once and returns results; stop on the first exception and propagate that exact exception object.

**Final:** `runConcurrent(tasks,int workers) -> List<Integer> throws Exception` requires workers>0, uses an owned fixed-size executor, and preserves input order in returned results. All tasks may run concurrently up to workers; empty input returns empty. If a task fails when its input-order future is observed, cancel outstanding tasks and propagate the original task Exception (not ExecutionException). On caller interruption cancel siblings and propagate InterruptedException. Always shut down and await executor termination; tasks in this exercise cooperate with interruption and terminate promptly. Preserve the task list. No leaked worker threads.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
