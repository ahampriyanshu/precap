# Context, cancellation, and channel lifetimes

Context carries cancellation, deadlines and request-scoped metadata across call boundaries. Pass it explicitly as the first parameter instead of storing it in a long-lived service. context.Background is a root for work with no parent request; context.TODO marks an unresolved propagation decision. A derived context's cancel function releases its resources and should be called even after successful work. Parent cancellation propagates downward, while canceling a child does not cancel its parent.

```go
parent := context.Background()
child, cancel := context.WithCancel(parent)
cancel()
fmt.Println(child.Err() == context.Canceled) // true
fmt.Println(parent.Err() == nil) // true
```

## Cancellation is cooperative

Closing Done announces cancellation; it does not kill goroutines, interrupt arbitrary computation, or undo writes already committed. Every potentially blocking stage needs to select on Done or call a dependency that honors context. A CPU loop must check periodically if prompt cancellation matters. Once a context is canceled it cannot be reused as an active context for another request.

WithDeadline and WithTimeout bound work with a deadline. Check errors.Is for context.Canceled or context.DeadlineExceeded where callers need to distinguish user cancellation from an elapsed budget. Avoid deriving fresh unrelated background contexts inside a request, which disconnects downstream work from its owner. When carrying values, use a private key type to avoid collisions and reserve them for request metadata; ordinary required dependencies and options belong in parameters or structs.

## Backpressure makes cancellation necessary

An unbuffered output naturally limits producer speed to the consumer's ability to receive. If the consumer leaves, the producer can become stuck in a send unless the send also watches cancellation. Buffering delays the problem but cannot solve an indefinitely absent consumer. A channel bridge must watch cancellation while waiting for input and while delivering output.

The bridge's owned output channel signals that no further values will arrive. A separate result channel carries exactly one terminal error (or nil success) then closes. It is buffered so the bridge can complete cleanup even if the caller has not yet read its status. The caller owns the input; the bridge must not close it. The parent context also belongs to the caller and remains active on normal completion.

Select may choose any ready case, so cancellation races with already-ready input/output. Do not promise an exact partially forwarded prefix under concurrent cancellation. Promise that all values are forwarded in order on normal completion and that blocked boundaries can exit on cancellation. A pre-canceled context can be checked before entering select to give deterministic early behavior. Tests below coordinate transitions with channels and use timeouts only to catch hangs.

## Practice

Prototype: `Prototype(ctx context.Context,in <-chan int,out chan<- int) error` synchronously forwards values in order until input closes or ctx cancels. It never closes caller-owned in/out. Normal input closure returns nil; cancellation returns ctx.Err().

Final: `Solve(ctx context.Context,in <-chan int) (<-chan int,<-chan error)` starts one owned bridge, returns an unbuffered value channel and a buffered terminal-status channel. Forward in order. Close value output when done, then emit exactly one terminal error (nil normal, ctx.Err canceled) and close status. Every receive/send must have a cancellation path; a nil input is allowed and waits until canceled. Pre-canceled ctx forwards nothing, even if input is closed. Do not close caller input or cancel parent. On concurrent cancellation, an already-ready send may win; no exact partial prefix is promised. Cancellation must release a bridge blocked on output even if the consumer reads no values. The terminal result means the bridge has finished work.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics from direct calls and harness-owned goroutines as named failures, including `panic(nil)`. A panic in a goroutine started by your implementation must be recovered in that goroutine; its caller cannot recover it, and an unhandled panic can terminate the process. Cancellation is cooperative; the local CLI timeout remains the hard stop for unfinished waits. Tests exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
