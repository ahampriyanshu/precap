package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"reflect"
	"runtime"
	"sync"
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
		run("signed delta key presence and empty map", func() {
			a := []Event{{"x", 3}, {"x", -3}, {"", 2}}
			before := snap(a)
			equal(Prototype(a), map[string]int{"x": 0, "": 2})
			equal(snap(a), before)
			equal(Prototype(nil), map[string]int{})
		})
		run("returned maps independent across calls", func() {
			a := Prototype([]Event{{"x", 1}})
			a["x"] = 99
			equal(Prototype([]Event{{"x", 1}}), map[string]int{"x": 1})
		})
	} else {
		run("zero value signed changes and key presence", func() {
			var c Counter
			equal(c.Get("missing"), 0)
			equal(c.Snapshot(), map[string]int{})
			equal(c.Add("", 0), 0)
			equal(c.Add("x", 4), 4)
			equal(c.Add("x", -5), -1)
			equal(c.Snapshot(), map[string]int{"": 0, "x": -1})
		})
		run("detached snapshots and drain ownership", func() {
			var c Counter
			c.Add("x", 3)
			s := c.Snapshot()
			s["x"] = 99
			equal(c.Get("x"), 3)
			d := c.Drain()
			equal(d, map[string]int{"x": 3})
			equal(c.Snapshot(), map[string]int{})
			c.Add("x", 4)
			d["x"] = 88
			equal(c.Get("x"), 4)
			equal(c.Drain(), map[string]int{"x": 4})
			equal(c.Drain(), map[string]int{})
		})
		run("concurrent writers exact counts", func() {

			var c Counter
			start := make(chan struct{})
			futures := make([]<-chan harnessResult[struct{}], 0, 8)
			for worker := 0; worker < 8; worker++ {
				futures = append(futures, startHarness(func() struct{} {
					<-start
					for i := 0; i < 1000; i++ {
						c.Add("shared", 1)
						c.Add("other", -1)
					}
					return struct{}{}
				}))
			}
			close(start)
			outcomes := make([]harnessResult[struct{}], 0, len(futures))
			for _, future := range futures {
				outcomes = append(outcomes, awaitHarness(future))
			}
			// All owned writers have finished before the owner reports a captured panic.
			for _, outcome := range outcomes {
				harnessValue(outcome)
			}
			equal(c.Snapshot(), map[string]int{"shared": 8000, "other": -8000})

		})
		run("concurrent drains conserve all increments", func() {

			var c Counter
			start, finished := make(chan struct{}), make(chan struct{})
			var stop sync.Once
			stopDraining := func() { stop.Do(func() { close(finished) }) }
			drainer := startHarness(func() int {
				sum := 0
				for {
					select {
					case <-finished:
						for _, v := range c.Drain() {
							sum += v
						}
						return sum
					default:
						for _, v := range c.Drain() {
							sum += v
						}
						runtime.Gosched()
					}
				}
			})
			defer func() { stopDraining(); waitHarnessCleanup(drainer) }()
			futures := make([]<-chan harnessResult[struct{}], 0, 6)
			for worker := 0; worker < 6; worker++ {
				futures = append(futures, startHarness(func() struct{} {
					<-start
					for i := 0; i < 500; i++ {
						c.Add("x", 1)
					}
					return struct{}{}
				}))
			}
			close(start)
			outcomes := make([]harnessResult[struct{}], 0, len(futures))
			for _, future := range futures {
				outcomes = append(outcomes, awaitHarness(future))
			}
			stopDraining()
			drained := awaitHarness(drainer)
			// Join every owned goroutine before surfacing any captured panic.
			for _, outcome := range outcomes {
				harnessValue(outcome)
			}
			equal(harnessValue(drained), 3000)
			equal(c.Snapshot(), map[string]int{})

		})
		run("instances independent and missing reads do not create", func() {
			var a, b Counter
			a.Add("x", 1)
			equal(b.Get("x"), 0)
			equal(b.Snapshot(), map[string]int{})
			equal(a.Get("never"), 0)
			equal(a.Snapshot(), map[string]int{"x": 1})
		})
	}
	finish()
}
