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
	run("uneven tree", func() {
		tree := &Tree{"hub", &Tree{"west", (*Tree)(nil), &Tree{"cold", (*Tree)(nil), (*Tree)(nil)}}, &Tree{"east", (*Tree)(nil), (*Tree)(nil)}}
		before_tree := snap(tree)
		defer func() { equal(snap(tree), before_tree) }()
		equal(fn(tree), [][]string{[]string{"hub"}, []string{"west", "east"}, []string{"cold"}})
	})
	run("empty tree", func() {
		tree := (*Tree)(nil)
		before_tree := snap(tree)
		defer func() { equal(snap(tree), before_tree) }()
		equal(fn(tree), [][]string{})
	})
	run("one node", func() {
		tree := &Tree{"root", (*Tree)(nil), (*Tree)(nil)}
		before_tree := snap(tree)
		defer func() { equal(snap(tree), before_tree) }()
		equal(fn(tree), [][]string{[]string{"root"}})
	})
	run("right chain", func() {
		tree := &Tree{"a", (*Tree)(nil), &Tree{"b", (*Tree)(nil), &Tree{"c", (*Tree)(nil), (*Tree)(nil)}}}
		before_tree := snap(tree)
		defer func() { equal(snap(tree), before_tree) }()
		equal(fn(tree), [][]string{[]string{"a"}, []string{"b"}, []string{"c"}})
	})
	if stage == "final" {
	}

	finish()
}
