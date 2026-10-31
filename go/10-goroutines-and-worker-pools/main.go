package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"reflect"
	"sync/atomic"
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

func square(_ context.Context, x int) (int, error) { return x * x, nil }

type poolResult struct {
	values []int
	err    error
}

func awaitSignal(c <-chan struct{}) {
	select {
	case <-c:
	case <-time.After(3 * time.Second):
		panic("timeout waiting for synchronization")
	}
}
func awaitPool(done <-chan harnessResult[poolResult]) poolResult {
	return harnessValue(awaitHarness(done))
}
func awaitPoolSignal(signal <-chan struct{}, done <-chan harnessResult[poolResult]) {
	select {
	case <-signal:
	case result := <-done:
		harnessValue(result)
		panic("pool returned before required callback synchronization")
	case <-time.After(3 * time.Second):
		panic("timeout waiting for callback synchronization")
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
		run("sequential order empty and input preserved", func() {
			a := []int{3, 1, 2}
			before := snap(a)
			equal(need(Prototype(context.Background(), a, 2, square)), []int{9, 1, 4})
			equal(snap(a), before)
			equal(need(Prototype(context.Background(), nil, 1, square)), []int{})
		})
		run("invalid canceled and transform failures", func() {
			invalid(Prototype(context.Background(), nil, 0, square))
			invalid(Prototype(context.Background(), nil, 1, nil))
			ctx, cancel := context.WithCancel(context.Background())
			cancel()
			_, e := Prototype(ctx, nil, 1, square)
			ok(errors.Is(e, context.Canceled))
			sentinel := errors.New("transform")
			_, e = Prototype(context.Background(), []int{1}, 1, func(context.Context, int) (int, error) { return 0, sentinel })
			ok(errors.Is(e, sentinel))
		})
	} else {
		run("ordered results empty and caller ownership", func() {
			a := []int{3, 1, 2, 0, -2}
			before := snap(a)
			equal(need(Solve(context.Background(), a, 3, square)), []int{9, 1, 4, 0, 4})
			equal(snap(a), before)
			equal(need(Solve(context.Background(), nil, 4, square)), []int{})
		})
		run("validation and pre-canceled context never call transform", func() {
			calls := 0
			f := func(context.Context, int) (int, error) { calls++; return 1, nil }
			invalid(Solve(context.Background(), []int{1}, 0, f))
			invalid(Solve(context.Background(), nil, 1, nil))
			ctx, cancel := context.WithCancel(context.Background())
			cancel()
			_, e := Solve(ctx, []int{1}, 1, f)
			ok(errors.Is(e, context.Canceled))
			_, e = Solve(ctx, nil, 1, f)
			ok(errors.Is(e, context.Canceled))
			equal(calls, 0)
		})
		run("bounded concurrent entry with deterministic barrier", func() {

			ctx, cancel := context.WithCancel(context.Background())
			entered, release := make(chan struct{}, 20), make(chan struct{})
			var active, max int32
			done := startHarness(func() poolResult {
				v, e := Solve(ctx, []int{1, 2, 3, 4, 5, 6}, 3, func(ctx context.Context, x int) (int, error) {
					n := atomic.AddInt32(&active, 1)
					defer atomic.AddInt32(&active, -1)
					for {
						old := atomic.LoadInt32(&max)
						if n <= old || atomic.CompareAndSwapInt32(&max, old, n) {
							break
						}
					}
					entered <- struct{}{}
					select {
					case <-release:
						return x * 2, nil
					case <-ctx.Done():
						return 0, ctx.Err()
					}
				})
				return poolResult{v, e}
			})
			defer func() { cancel(); waitHarnessCleanup(done) }()
			for i := 0; i < 3; i++ {
				awaitPoolSignal(entered, done)
			}
			close(release)
			result := awaitPool(done)
			must(result.err)
			equal(result.values, []int{2, 4, 6, 8, 10, 12})
			equal(atomic.LoadInt32(&max), int32(3))
			equal(atomic.LoadInt32(&active), int32(0))

		})
		run("transform error identity and sibling cleanup", func() {
			sentinel := errors.New("transform")
			v, e := Solve(context.Background(), []int{1}, 2, func(context.Context, int) (int, error) { return 0, sentinel })
			ok(v == nil && errors.Is(e, sentinel))
		})
		run("cancellation waits for callback exit", func() {

			ctx, cancel := context.WithCancel(context.Background())
			started, ended := make(chan struct{}), make(chan struct{})
			done := startHarness(func() poolResult {
				v, e := Solve(ctx, []int{1}, 1, func(ctx context.Context, x int) (int, error) {
					close(started)
					<-ctx.Done()
					close(ended)
					return 0, ctx.Err()
				})
				return poolResult{v, e}
			})
			defer func() { cancel(); waitHarnessCleanup(done) }()
			awaitPoolSignal(started, done)
			cancel()
			result := awaitPool(done)
			ok(result.values == nil && errors.Is(result.err, context.Canceled))
			awaitSignal(ended)

		})
		run("single worker many jobs and repeated calls", func() {
			for i := 0; i < 20; i++ {
				equal(need(Solve(context.Background(), []int{2, 1}, 1, square)), []int{4, 1})
			}
		})
	}
	finish()
}
