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
	run("greedy counterexample", func() {
		sizes := []int{1, 3, 4}
		amount := 6
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 2)
	})
	run("unreachable", func() {
		sizes := []int{4, 6}
		amount := 5
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("empty exact zero", func() {
		sizes := []int{}
		amount := 0
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 0)
	})
	run("no sizes", func() {
		sizes := []int{}
		amount := 3
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("duplicate sizes", func() {
		sizes := []int{2, 2}
		amount := 4
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 2)
	})
	run("target amount 0", func() {
		sizes := []int{2, 5, 3}
		amount := 0
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 0)
	})
	run("target amount 1", func() {
		sizes := []int{6, 5}
		amount := 1
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("target amount 2", func() {
		sizes := []int{2, 3, 6}
		amount := 2
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 1)
	})
	run("target amount 3", func() {
		sizes := []int{}
		amount := 3
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("target amount 4", func() {
		sizes := []int{}
		amount := 4
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("target amount 5", func() {
		sizes := []int{1, 3, 6}
		amount := 5
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 3)
	})
	run("target amount 6", func() {
		sizes := []int{1, 5, 6}
		amount := 6
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 1)
	})
	run("target amount 7", func() {
		sizes := []int{5}
		amount := 7
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("target amount 8", func() {
		sizes := []int{1, 4, 6}
		amount := 8
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 2)
	})
	run("target amount 9", func() {
		sizes := []int{5, 1}
		amount := 9
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 5)
	})
	run("target amount 10", func() {
		sizes := []int{3, 2, 6}
		amount := 10
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 3)
	})
	run("target amount 11", func() {
		sizes := []int{}
		amount := 11
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("target amount 12", func() {
		sizes := []int{}
		amount := 12
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("target amount 13", func() {
		sizes := []int{3, 5, 6}
		amount := 13
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 3)
	})
	run("target amount 14", func() {
		sizes := []int{5, 1}
		amount := 14
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 6)
	})
	run("target amount 15", func() {
		sizes := []int{}
		amount := 15
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("target amount 16", func() {
		sizes := []int{5, 1, 6}
		amount := 16
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 3)
	})
	run("target amount 17", func() {
		sizes := []int{6}
		amount := 17
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, -1)
	})
	run("target amount 18", func() {
		sizes := []int{3, 1, 5}
		amount := 18
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 4)
	})
	run("target amount 19", func() {
		sizes := []int{1, 2}
		amount := 19
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		got, err := fn(sizes, amount)
		must(err)
		equal(got, 10)
	})
	run("invalid input", func() {
		sizes := []int{0}
		amount := 3
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		_, err := fn(sizes, amount)
		bad(err)
	})
	run("invalid input", func() {
		sizes := []int{1}
		amount := -1
		before_sizes := snap(sizes)
		defer func() { equal(snap(sizes), before_sizes) }()
		_, err := fn(sizes, amount)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
