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
	run("head and adjacent removals", func() {
		values := []int{1, 2, 3, 2, 4}
		blocked := []int{1, 2}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{3, 4})
	})
	run("empty list", func() {
		values := []int{}
		blocked := []int{1}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{})
	})
	run("all values removed", func() {
		values := []int{1, 1}
		blocked := []int{1}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{})
	})
	run("no blocked values", func() {
		values := []int{1, 2}
		blocked := []int{}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{1, 2})
	})
	run("linked list 0", func() {
		values := []int{}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{})
	})
	run("linked list 1", func() {
		values := []int{0}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{0})
	})
	run("linked list 2", func() {
		values := []int{5, 3}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{5, 3})
	})
	run("linked list 3", func() {
		values := []int{1, 1, 2}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{2})
	})
	run("linked list 4", func() {
		values := []int{3, 3, 5, 0}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{3, 3, 5, 0})
	})
	run("linked list 5", func() {
		values := []int{0, 2, 4, 5, 2}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{0, 2, 5, 2})
	})
	run("linked list 6", func() {
		values := []int{2, 5, 5, 4, 0, 2}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{2, 5, 5, 0, 2})
	})
	run("linked list 7", func() {
		values := []int{1, 5, 5, 3, 3, 5, 5}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{5, 5, 3, 3, 5, 5})
	})
	run("linked list 8", func() {
		values := []int{3, 4, 2, 2, 4, 4, 5, 4}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{3, 2, 2, 5})
	})
	run("linked list 9", func() {
		values := []int{1, 1, 3, 5, 5, 0, 4, 4, 3}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{3, 5, 5, 0, 3})
	})
	run("linked list 10", func() {
		values := []int{4, 1, 1, 0, 1, 5, 2, 0, 5, 4}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{0, 5, 2, 0, 5})
	})
	run("linked list 11", func() {
		values := []int{3, 3, 5, 1, 5, 5, 2, 1, 4, 5, 5}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{3, 3, 5, 5, 5, 2, 5, 5})
	})
	run("linked list 12", func() {
		values := []int{5, 0, 0, 5, 3, 3, 1, 1, 2, 1, 5, 4}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{5, 0, 0, 5, 3, 3, 2, 5})
	})
	run("linked list 13", func() {
		values := []int{4, 5, 2, 4, 4, 0, 0, 1, 0, 3, 1, 2, 5}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{5, 2, 0, 0, 0, 3, 2, 5})
	})
	run("linked list 14", func() {
		values := []int{1, 0, 5, 4, 1, 3, 0, 0, 5, 0, 4, 5, 1, 5}
		blocked := []int{1, 4}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_blocked := snap(blocked)
		defer func() { equal(snap(blocked), before_blocked) }()
		equal(fn(values, blocked), []int{0, 5, 3, 0, 0, 5, 0, 5, 5})
	})
	if stage == "final" {
	}
	run("pointer identity consecutive removals and tail", func() {
		n4 := &Node{Value: 4}
		n3 := &Node{Value: 2, Next: n4}
		n2 := &Node{Value: 2, Next: n3}
		n1 := &Node{Value: 1, Next: n2}
		blocked := map[int]bool{2: true}
		before := snap(blocked)
		h := Detach(n1, blocked)
		ok(h == n1 && h.Next == n4 && n4.Next == nil)
		equal(snap(blocked), before)
		ok(Detach(nil, blocked) == nil)
		ok(Detach(&Node{Value: 2}, blocked) == nil)
	})

	finish()
}
