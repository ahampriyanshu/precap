package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"reflect"
)

var passed, failed int

func run(name string, fn func()) {
	func() {
		defer func() {
			if r := recover(); r != nil {
				failed++
				fmt.Printf("FAIL %s: %v\n", name, r)
			}
		}()
		fn()
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

func main() {
	stage := stageFlag()
	_ = stage
	fn := Solve
	if stage == "prototype" {
		fn = Prototype
	}
	run("expiring descending maximum", func() {
		loads := []int{9, 8, 7, 6}
		width := 2
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{9, 8, 7})
	})
	run("duplicate peak", func() {
		loads := []int{4, 4, 1, 4}
		width := 2
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{4, 4, 4})
	})
	run("empty", func() {
		loads := []int{}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{})
	})
	run("no full window", func() {
		loads := []int{1}
		width := 2
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{})
	})
	run("peak n=1 w=1", func() {
		loads := []int{0}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{0})
	})
	run("peak n=1 w=3", func() {
		loads := []int{-9}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{})
	})
	run("peak n=1 w=5", func() {
		loads := []int{-6}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{})
	})
	run("peak n=2 w=1", func() {
		loads := []int{9, -3}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{9, -3})
	})
	run("peak n=2 w=3", func() {
		loads := []int{-2, -10}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{})
	})
	run("peak n=2 w=5", func() {
		loads := []int{-9, 5}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{})
	})
	run("peak n=3 w=1", func() {
		loads := []int{-4, 10, 7}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{-4, 10, 7})
	})
	run("peak n=3 w=3", func() {
		loads := []int{1, 10, -6}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{10})
	})
	run("peak n=3 w=5", func() {
		loads := []int{-9, 1, 0}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{})
	})
	run("peak n=4 w=1", func() {
		loads := []int{-5, -4, 5, -6}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{-5, -4, 5, -6})
	})
	run("peak n=4 w=3", func() {
		loads := []int{1, -7, 2, 1}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{2, 2})
	})
	run("peak n=4 w=5", func() {
		loads := []int{8, 3, -7, 5}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{})
	})
	run("peak n=5 w=1", func() {
		loads := []int{-8, -4, -5, 6, 0}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{-8, -4, -5, 6, 0})
	})
	run("peak n=5 w=3", func() {
		loads := []int{7, 6, -7, 1, -2}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{7, 6, 1})
	})
	run("peak n=5 w=5", func() {
		loads := []int{-5, 9, 9, 2, -9}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{9})
	})
	run("peak n=6 w=1", func() {
		loads := []int{-6, 10, -10, 6, 4, -7}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{-6, 10, -10, 6, 4, -7})
	})
	run("peak n=6 w=3", func() {
		loads := []int{-8, -8, 3, -4, -4, -7}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{3, 3, 3, -4})
	})
	run("peak n=6 w=5", func() {
		loads := []int{3, 5, 10, -1, 5, 7}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{10, 10})
	})
	run("peak n=7 w=1", func() {
		loads := []int{1, -3, -6, 1, 6, 5, 7}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{1, -3, -6, 1, 6, 5, 7})
	})
	run("peak n=7 w=3", func() {
		loads := []int{7, 6, 4, -3, -4, -5, 1}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{7, 6, 4, -3, 1})
	})
	run("peak n=7 w=5", func() {
		loads := []int{6, -6, -5, 10, -9, 10, -3}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{10, 10, 10})
	})
	run("peak n=8 w=1", func() {
		loads := []int{-5, -10, -5, -6, 2, 0, 5, 7}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{-5, -10, -5, -6, 2, 0, 5, 7})
	})
	run("peak n=8 w=3", func() {
		loads := []int{5, -6, -10, -3, -9, 2, -4, 2}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{5, -3, -3, 2, 2, 2})
	})
	run("peak n=8 w=5", func() {
		loads := []int{-8, -3, -9, -10, -9, 6, 5, -6}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{-3, 6, 6, 6})
	})
	run("peak n=9 w=1", func() {
		loads := []int{9, -8, 6, -2, 3, -9, -9, 1, 5}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{9, -8, 6, -2, 3, -9, -9, 1, 5})
	})
	run("peak n=9 w=3", func() {
		loads := []int{-10, 1, -6, -9, -10, 9, -7, -9, -10}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{1, 1, -6, 9, 9, 9, -7})
	})
	run("peak n=9 w=5", func() {
		loads := []int{-7, -2, 2, 9, -7, -9, -2, -4, -10}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{9, 9, 9, 9, -2})
	})
	run("peak n=10 w=1", func() {
		loads := []int{-2, 7, -9, -7, -3, 5, 6, 6, -8, 7}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{-2, 7, -9, -7, -3, 5, 6, 6, -8, 7})
	})
	run("peak n=10 w=3", func() {
		loads := []int{-3, 0, -10, -2, -5, 4, 10, -3, 3, -1}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{0, 0, -2, 4, 10, 10, 10, 3})
	})
	run("peak n=10 w=5", func() {
		loads := []int{8, 0, 7, 9, 10, -10, 9, -3, 9, 7}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{10, 10, 10, 10, 10, 9})
	})
	run("peak n=11 w=1", func() {
		loads := []int{9, -8, 7, 9, -6, -8, 8, -2, -10, 10, -4}
		width := 1
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{9, -8, 7, 9, -6, -8, 8, -2, -10, 10, -4})
	})
	run("peak n=11 w=3", func() {
		loads := []int{6, 5, -6, -9, -5, -9, -10, 2, 7, 8, -4}
		width := 3
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{6, 5, -5, -5, -5, 2, 7, 8, 8})
	})
	run("peak n=11 w=5", func() {
		loads := []int{-2, -10, -3, 0, -4, -3, -9, 4, 3, -4, 8}
		width := 5
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		got, err := fn(loads, width)
		must(err)
		equal(got, []int{0, 0, 0, 4, 4, 4, 8})
	})
	run("invalid input", func() {
		loads := []int{1}
		width := 0
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		_, err := fn(loads, width)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
