package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"reflect"
	"time"
)

var passed, failed int

func run(name string, fn func()) {
	func() {
		completed := false
		defer func() {
			if !completed {
				r := recover()
				failed++
				fmt.Printf("FAIL %s: %v\n", name, r)
			}
		}()
		fn()
		completed = true
		passed++
		fmt.Println("PASS", name)
	}()
}
func equal(got, want any) {
	if !reflect.DeepEqual(got, want) {
		panic(fmt.Sprintf("got %#v; want %#v", got, want))
	}
}
func ok(b bool) {
	if !b {
		panic("condition failed")
	}
}
func must(err error) {
	if err != nil {
		panic(err)
	}
}
func bad(err error) {
	if err == nil {
		panic("expected error")
	}
}
func snap(v any) string { b, e := json.Marshal(v); must(e); return string(b) }
func ip(v int) *int     { return &v }
func finish() {
	fmt.Printf("%d passed; %d failed\n", passed, failed)
	if failed > 0 || passed == 0 {
		os.Exit(1)
	}
}
func stageFlag() string {
	s := flag.String("stage", "final", "prototype or final")
	flag.Parse()
	if *s != "prototype" && *s != "final" {
		fmt.Fprintln(os.Stderr, "unknown stage")
		os.Exit(2)
	}
	return *s
}

func need[T any](v T, e error) T  { must(e); return v }
func yes(v bool, e error)         { must(e); ok(v) }
func no(v bool, e error)          { must(e); ok(!v) }
func invalid[T any](v T, e error) { bad(e) }
func sp(s string) *string         { return &s }

func receiveInt(c <-chan int, done <-chan harnessResult[error]) int {
	select {
	case v, open := <-c:
		if !open {
			panic("unexpected closed channel")
		}
		return v
	case result := <-done:
		harnessValue(result)
		panic("forwarding returned before required values")
	case <-time.After(3 * time.Second):
		panic("forwarding timed out")
	}
}
func receiveError(c <-chan error) error {
	select {
	case e, b := <-c:
		if !b {
			panic("missing terminal result")
		}
		return e
	case <-time.After(3 * time.Second):
		panic("terminal status timed out")
	}
}

// harnessResult relays a call outcome without panicking in a harness-owned goroutine.
type harnessResult[T any] struct {
	value      T
	panicked   bool
	panicValue any
}

func startHarness[T any](fn func() T) <-chan harnessResult[T] {
	done := make(chan harnessResult[T], 1)
	go func() {
		result := harnessResult[T]{}
		completed := false
		defer func() {
			if !completed {
				result.panicked = true
				result.panicValue = recover()
			}
			done <- result
			close(done)
		}()
		result.value = fn()
		completed = true
	}()
	return done
}
func awaitHarness[T any](done <-chan harnessResult[T]) harnessResult[T] {
	select {
	case result, open := <-done:
		if !open {
			panic("missing harness call outcome")
		}
		return result
	case <-time.After(3 * time.Second):
		panic("harness call did not finish")
	}
}
func harnessValue[T any](result harnessResult[T]) T {
	if result.panicked {
		panic(fmt.Sprintf("learner panic in harness goroutine: %v", result.panicValue))
	}
	return result.value
}
func waitHarnessCleanup[T any](done <-chan harnessResult[T]) {
	// A cooperative learner call exits after its test-owned context/gates are released.
	// The CLI timeout remains the hard stop for a call that ignores cancellation.
	select {
	case <-done:
	case <-time.After(3 * time.Second):
	}
}

func main() {
	stage := stageFlag()
	_ = stage
	if stage == "prototype" {
		run("synchronous normal forwarding caller output stays open", func() {

			ctx, cancel := context.WithCancel(context.Background())
			in := make(chan int, 3)
			for _, x := range []int{1, 2, 3} {
				in <- x
			}
			close(in)
			out := make(chan int)
			done := startHarness(func() error { return Prototype(ctx, in, out) })
			defer func() { cancel(); waitHarnessCleanup(done) }()
			equal(receiveInt(out, done), 1)
			equal(receiveInt(out, done), 2)
			equal(receiveInt(out, done), 3)
			must(harnessValue(awaitHarness(done)))
			select {
			case _, open := <-out:
				ok(open)
			default:
			}

		})
		run("pre-cancel and nil input unblock", func() {

			ctx, cancel := context.WithCancel(context.Background())
			cancel()
			out := make(chan int)
			done := startHarness(func() error { return Prototype(ctx, nil, out) })
			defer waitHarnessCleanup(done)
			ok(errors.Is(harnessValue(awaitHarness(done)), context.Canceled))

		})
	} else {
		run("normal order channel ownership terminal once", func() {
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()
			in := make(chan int, 3)
			for _, x := range []int{3, 1, 2} {
				in <- x
			}
			close(in)
			out, status := Solve(ctx, in)
			equal(cap(out), 0)
			got := []int{}
			for v := range out {
				got = append(got, v)
			}
			equal(got, []int{3, 1, 2})
			must(receiveError(status))
			_, open := <-status
			ok(!open)
			ok(ctx.Err() == nil)
		})
		run("empty input completes without values", func() {
			in := make(chan int)
			close(in)
			out, status := Solve(context.Background(), in)
			_, open := <-out
			ok(!open)
			must(receiveError(status))
			_, open = <-status
			ok(!open)
		})
		run("pre-cancel prioritized before closed input", func() {
			ctx, cancel := context.WithCancel(context.Background())
			cancel()
			in := make(chan int)
			close(in)
			out, status := Solve(ctx, in)
			ok(errors.Is(receiveError(status), context.Canceled))
			_, open := <-out
			ok(!open)
		})
		run("cancel blocked input including nil", func() {
			ctx, cancel := context.WithCancel(context.Background())
			out, status := Solve(ctx, nil)
			cancel()
			ok(errors.Is(receiveError(status), context.Canceled))
			_, open := <-out
			ok(!open)
		})
		run("cancel blocked output does not require consumer", func() {
			ctx, cancel := context.WithCancel(context.Background())
			in := make(chan int, 1)
			in <- 7
			out, status := Solve(ctx, in)
			cancel()
			ok(errors.Is(receiveError(status), context.Canceled))
			_, open := <-out
			ok(!open)
			select {
			case in <- 8:
			default:
			}
			close(in)
		})
		run("repeated lifetime cleanup parent remains active", func() {
			parent := context.Background()
			for i := 0; i < 30; i++ {
				ctx, cancel := context.WithCancel(parent)
				out, status := Solve(ctx, nil)
				cancel()
				ok(errors.Is(receiveError(status), context.Canceled))
				_, open := <-out
				ok(!open)
			}
			ok(parent.Err() == nil)
		})
	}
	finish()
}
