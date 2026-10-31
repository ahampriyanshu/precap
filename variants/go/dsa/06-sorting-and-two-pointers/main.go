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
	run("no self pairing", func() {
		weights := []int{5}
		target := 10
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), (*Pair)(nil))
	})
	run("two equal values", func() {
		weights := []int{5, 5}
		target := 10
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{5, 5})
	})
	run("canonical tie", func() {
		weights := []int{4, 1, 3, 2}
		target := 5
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{1, 4})
	})
	run("empty", func() {
		weights := []int{}
		target := 0
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), (*Pair)(nil))
	})
	run("negative adjustment", func() {
		weights := []int{-4, 0, 4}
		target := 0
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-4, 4})
	})
	run("generated pair 0", func() {
		weights := []int{}
		target := 5
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), (*Pair)(nil))
	})
	run("generated pair 1", func() {
		weights := []int{-6}
		target := 6
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), (*Pair)(nil))
	})
	run("generated pair 2", func() {
		weights := []int{2, 1}
		target := -5
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), (*Pair)(nil))
	})
	run("generated pair 3", func() {
		weights := []int{-1, 3, 3}
		target := 1
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), (*Pair)(nil))
	})
	run("generated pair 4", func() {
		weights := []int{7, 5, -2, -4}
		target := 2
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), (*Pair)(nil))
	})
	run("generated pair 5", func() {
		weights := []int{7, 4, -3, -4, 3}
		target := 0
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-4, 4})
	})
	run("generated pair 6", func() {
		weights := []int{-3, 2, 3, 2, -5, 4}
		target := -2
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-5, 3})
	})
	run("generated pair 7", func() {
		weights := []int{1, 5, -5, -5, 6, 2, -4}
		target := 4
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), (*Pair)(nil))
	})
	run("generated pair 8", func() {
		weights := []int{3, 0, 3, 6, 0, -2, -4, 1}
		target := 0
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{0, 0})
	})
	run("generated pair 9", func() {
		weights := []int{-5, 6, -3, -3, 6, 7, 6, -1, 5}
		target := 5
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-1, 6})
	})
	run("generated pair 10", func() {
		weights := []int{2, 3, -2, 1, 6, 3, 6, 4, 0, -1}
		target := 0
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-2, 2})
	})
	run("generated pair 11", func() {
		weights := []int{4, 0, 0, 7, 1, 3, 0, 0, 0, 4, -2}
		target := 1
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-2, 3})
	})
	run("generated pair 12", func() {
		weights := []int{2, 6, 2, -4, 6, 7, -1, 3, -3, -3, -3, 5}
		target := -2
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-4, 2})
	})
	run("generated pair 13", func() {
		weights := []int{-1, 2, -4, -1, 1, -6, 1, 5, 4, -2, 6, 5, -5}
		target := 7
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{1, 6})
	})
	run("generated pair 14", func() {
		weights := []int{7, 2, 1, -3, 5, 6, -2, 7, 1, -1, 4, 3, -1, 1}
		target := -4
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-3, -1})
	})
	run("generated pair 15", func() {
		weights := []int{-3, 3, 0, -2, -5, -4, -1, -2, 6, 0, 4, 3, -3, -6, 3}
		target := 3
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-3, 6})
	})
	run("generated pair 16", func() {
		weights := []int{5, -1, -2, -1, 7, 3, 4, -4, 1, -1, -3, -5, -3, -1, 5, -3}
		target := -2
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-5, 3})
	})
	run("generated pair 17", func() {
		weights := []int{6, 3, -5, -4, 6, 0, 2, 3, 4, 7, 5, -1, -4, 1, -1, -5, 5}
		target := 5
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-1, 6})
	})
	run("generated pair 18", func() {
		weights := []int{-6, 7, 5, 7, 7, 7, -1, 4, 5, -3, -1, -2, 5, -1, -3, 4, 6, 4}
		target := 6
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-1, 7})
	})
	run("generated pair 19", func() {
		weights := []int{5, -5, -3, 2, 7, -4, -2, 5, 4, 4, -1, 4, 7, 3, 0, 7, -4, -3, 3}
		target := -1
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-5, 4})
	})
	run("generated pair 20", func() {
		weights := []int{7, 7, 2, 7, -6, 2, 5, -6, -3, 3, -6, -6, -2, -2, 2, 6, -4, -2, -1, -1}
		target := -4
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-6, 2})
	})
	run("generated pair 21", func() {
		weights := []int{-6, -2, 3, 5, 5, 2, 5, 1, 5, -3, 2, 6, -1, -1, 1, 4, 0, 2, 1, 2, -2}
		target := -5
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-6, 1})
	})
	run("generated pair 22", func() {
		weights := []int{0, -3, 2, -4, -1, -5, -5, 1, 5, 7, 1, 7, 0, 5, -6, 1, -1, 4, 2, -4, 6, 2}
		target := -5
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-6, 1})
	})
	run("generated pair 23", func() {
		weights := []int{3, -5, -3, -5, 0, -5, 3, 4, -6, -3, -4, 2, -4, -5, 2, -4, 1, 5, 0, 2, -3, 5, 4}
		target := -2
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{-6, 4})
	})
	run("generated pair 24", func() {
		weights := []int{6, 2, -6, -3, 2, -5, 6, 5, 0, -2, 3, 0, -6, 6, -1, 2, 4, 0, -3, -4, -6, 3, -6, -1}
		target := 6
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		equal(fn(weights, target), &Pair{0, 6})
	})
	if stage == "final" {
	}

	finish()
}
