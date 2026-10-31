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
	run("order-sensitive boundary", func() {
		weights := []int{1, 2, 3, 4, 5}
		days := 3
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 6)
	})
	run("large answer space", func() {
		weights := []int{1000000000000, 1000000000000}
		days := 2
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 1000000000000)
	})
	run("empty weights", func() {
		weights := []int{}
		days := 1
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 0)
	})
	run("extra days", func() {
		weights := []int{8, 2}
		days := 9
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 8)
	})
	run("capacity sample 1", func() {
		weights := []int{6}
		days := 2
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 6)
	})
	run("capacity sample 2", func() {
		weights := []int{3, 7}
		days := 1
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 10)
	})
	run("capacity sample 3", func() {
		weights := []int{5, 6, 5}
		days := 7
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 6)
	})
	run("capacity sample 4", func() {
		weights := []int{3, 8, 6, 1}
		days := 1
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 18)
	})
	run("capacity sample 5", func() {
		weights := []int{3, 6, 11, 7, 8}
		days := 4
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 11)
	})
	run("capacity sample 6", func() {
		weights := []int{2, 11, 4, 1, 2, 10}
		days := 3
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 13)
	})
	run("capacity sample 7", func() {
		weights := []int{3, 11, 6, 11, 3, 3, 10}
		days := 4
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 14)
	})
	run("capacity sample 8", func() {
		weights := []int{4, 9, 7, 11, 10, 6, 8, 2}
		days := 5
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 16)
	})
	run("capacity sample 9", func() {
		weights := []int{10, 10, 7, 4, 11, 2, 8, 6, 8}
		days := 6
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 14)
	})
	run("capacity sample 10", func() {
		weights := []int{11, 3, 7, 7, 5, 5, 7, 3, 7, 11}
		days := 6
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 12)
	})
	run("capacity sample 11", func() {
		weights := []int{4, 11, 9, 7, 11, 10, 3, 2, 3, 7, 10}
		days := 4
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 24)
	})
	run("capacity sample 12", func() {
		weights := []int{2, 4, 6, 7, 3, 7, 8, 6, 8, 9, 6, 7}
		days := 3
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 29)
	})
	run("capacity sample 13", func() {
		weights := []int{7, 10, 11, 7, 1, 5, 6, 9, 4, 2, 6, 4, 5}
		days := 4
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 21)
	})
	run("capacity sample 14", func() {
		weights := []int{6, 9, 11, 8, 9, 11, 7, 7, 3, 4, 4, 1, 6, 8}
		days := 6
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 18)
	})
	run("capacity sample 15", func() {
		weights := []int{8, 5, 11, 7, 6, 9, 10, 8, 4, 5, 1, 8, 5, 3, 7}
		days := 3
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 33)
	})
	run("capacity sample 16", func() {
		weights := []int{7, 6, 5, 11, 6, 10, 7, 9, 3, 2, 6, 5, 3, 2, 2, 1}
		days := 7
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 16)
	})
	run("capacity sample 17", func() {
		weights := []int{4, 3, 2, 11, 1, 9, 5, 4, 4, 6, 10, 3, 3, 9, 2, 2, 7}
		days := 5
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		got, err := fn(weights, days)
		must(err)
		equal(got, 20)
	})
	run("invalid input", func() {
		weights := []int{1}
		days := 0
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		_, err := fn(weights, days)
		bad(err)
	})
	run("invalid input", func() {
		weights := []int{0}
		days := 1
		before_weights := snap(weights)
		defer func() { equal(snap(weights), before_weights) }()
		_, err := fn(weights, days)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
