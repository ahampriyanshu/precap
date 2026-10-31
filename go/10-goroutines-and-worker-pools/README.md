# Goroutines, channels, and worker pools

A goroutine is a concurrently scheduled function invocation. Starting one with go does not wait for it, give it a useful result path, or propagate its panic to the caller. A parent operation needs an explicit lifetime: start work, communicate results/errors, cancel unnecessary work, and wait for every goroutine it owns. Concurrency can improve throughput when work waits or uses multiple cores, but creating one goroutine per unbounded input can exhaust memory or overload a dependency.

```go
ready := make(chan struct{})
go func() { close(ready) }()
<-ready // an explicit completion event
```

## Channels carry both data and synchronization

An unbuffered send waits for a receiver; a buffered channel permits bounded queued values. Capacity changes backpressure, not ownership. A receive from a closed channel drains queued values then returns zero with ok=false. Sending to a closed channel panics. The producer that knows no more values will be sent normally owns closing the channel; receivers should not close a channel shared with active senders. Nil-channel sends/receives block forever, which can deliberately disable a select case but also hide initialization bugs.

A worker pool sends job indices through a channel and lets a fixed number of workers process them. Indices preserve output order even when completion order differs. Workers write distinct preallocated output positions, and the parent waits before reading them. A WaitGroup joins lifetimes; Add must happen before the corresponding work can call Done, and Wait does not replace synchronization around truly shared mutable state.

## Every blocking boundary needs an exit

If a receiver exits after one error while producers keep sending, goroutines can leak permanently. Use a derived context, select on cancellation when sending jobs, and stop workers promptly on cancellation. A transform must cooperate with its supplied context; the pool cannot forcibly terminate arbitrary blocking code. Wait for already-started transforms before returning so the caller knows its operation is over.

An error channel needs an ownership and draining policy too. A buffered single-error slot can retain a first failure, or a mutex can protect one stored error. Preserve a transform's error category, cancel sibling work, and discard partial output under this exercise's all-or-error contract. The first observed concurrent error may depend on scheduling, so a deterministic API should not promise input-order error precedence unless it deliberately coordinates that.

Test concurrency with channels, barriers and explicit counts rather than sleeps. A timeout is only a guard against a hung test; it must not be used to decide correct output timing. The final tests prove that multiple callbacks can enter concurrently, never exceed the worker bound, preserve result order, and exit on cancellation. Run the same suite with the race detector to examine the exercised interleavings.

## Practice

`Transform` is `func(context.Context,int) (int,error)`. Implement `Prototype(ctx,inputs,workers,transform) ([]int,error)` sequentially, validating workers>0 and nonnil transform first. `Solve` uses at most workers concurrent transforms and a channel-based job queue. ctx is nonnil; input/sums fit int. Both return results in input order, detached/nonempty rules: empty input yields a nonnil empty result if ctx active. A pre-canceled ctx returns nil and its error without callbacks, including empty input. On transform error, return nil and that classifiable error; final cancels a derived context, stops dispatch, and waits for every started callback. On parent cancellation return nil and context error, also wait. If several callbacks fail, any first observed error is acceptable. Transform callbacks honor ctx and are safe for concurrent use. Do not close/alter caller context, mutate inputs, or return while owned workers remain active. Prototype does not need parallelism; final must allow up to workers callbacks to overlap when jobs permit.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics from direct calls and harness-owned goroutines as named failures, including `panic(nil)`. A panic in a goroutine started by your implementation must be recovered in that goroutine; its caller cannot recover it, and an unhandled panic can terminate the process. Cancellation is cooperative; the local CLI timeout remains the hard stop for unfinished waits. Tests exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
