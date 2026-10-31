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
	run("must undo the first choice", func() {
		allowed := [][]string{[]string{"A", "B"}, []string{"A"}}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), []string{"B", "A"})
	})
	run("impossible", func() {
		allowed := [][]string{[]string{"A"}, []string{"A"}}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), ([]string)(nil))
	})
	run("no positions", func() {
		allowed := [][]string{}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), []string{})
	})
	run("no allowed choice", func() {
		allowed := [][]string{[]string{}}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), ([]string)(nil))
	})
	run("allowed choices 0", func() {
		allowed := [][]string{}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), []string{})
	})
	run("allowed choices 1", func() {
		allowed := [][]string{[]string{"D", "D", "B"}}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), []string{"B"})
	})
	run("allowed choices 2", func() {
		allowed := [][]string{[]string{"B"}, []string{"B", "D", "A"}}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), []string{"B", "A"})
	})
	run("allowed choices 3", func() {
		allowed := [][]string{[]string{"B"}, []string{}, []string{"D", "B"}}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), ([]string)(nil))
	})
	run("allowed choices 4", func() {
		allowed := [][]string{[]string{"D"}, []string{"D", "D", "B", "B"}, []string{"C"}, []string{"B", "A"}}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), []string{"D", "B", "C", "A"})
	})
	run("allowed choices 5", func() {
		allowed := [][]string{[]string{"D", "C", "A", "B"}, []string{"B", "B", "A", "D"}, []string{"D"}, []string{"C", "B", "D", "A"}, []string{"D"}}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), ([]string)(nil))
	})
	run("allowed choices 6", func() {
		allowed := [][]string{[]string{}, []string{"A", "A", "B"}, []string{"A", "C", "B"}, []string{}, []string{"C", "A", "C", "C"}, []string{"A"}}
		before_allowed := snap(allowed)
		defer func() { equal(snap(allowed), before_allowed) }()
		equal(fn(allowed), ([]string)(nil))
	})
	if stage == "final" {
	}

	finish()
}
