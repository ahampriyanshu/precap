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
	run("greedy ratio counterexample", func() {
		items := [][2]int{[2]int{2, 3}, [2]int{3, 4}, [2]int{4, 5}}
		capacity := 6
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 8)
	})
	run("no item reuse", func() {
		items := [][2]int{[2]int{2, 3}}
		capacity := 4
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 3)
	})
	run("no items", func() {
		items := [][2]int{}
		capacity := 0
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 0)
	})
	run("zero value", func() {
		items := [][2]int{[2]int{2, 0}, [2]int{2, 7}}
		capacity := 2
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 7)
	})
	run("item selection 0", func() {
		items := [][2]int{}
		capacity := 8
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 0)
	})
	run("item selection 1", func() {
		items := [][2]int{[2]int{4, 7}}
		capacity := 2
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 0)
	})
	run("item selection 2", func() {
		items := [][2]int{[2]int{3, 10}, [2]int{3, 8}}
		capacity := 5
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 10)
	})
	run("item selection 3", func() {
		items := [][2]int{[2]int{4, 2}, [2]int{1, 10}, [2]int{3, 0}}
		capacity := 13
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 12)
	})
	run("item selection 4", func() {
		items := [][2]int{[2]int{6, 5}, [2]int{3, 2}, [2]int{3, 11}, [2]int{4, 10}}
		capacity := 7
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 21)
	})
	run("item selection 5", func() {
		items := [][2]int{[2]int{3, 3}, [2]int{2, 5}, [2]int{6, 8}, [2]int{1, 6}, [2]int{3, 11}}
		capacity := 8
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 22)
	})
	run("item selection 6", func() {
		items := [][2]int{[2]int{4, 1}, [2]int{1, 5}, [2]int{5, 6}, [2]int{4, 3}, [2]int{6, 7}, [2]int{2, 3}}
		capacity := 7
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 12)
	})
	run("item selection 7", func() {
		items := [][2]int{[2]int{5, 4}, [2]int{5, 1}, [2]int{6, 4}, [2]int{6, 9}, [2]int{4, 9}, [2]int{3, 8}, [2]int{2, 9}}
		capacity := 7
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 18)
	})
	run("item selection 8", func() {
		items := [][2]int{[2]int{3, 3}, [2]int{4, 8}, [2]int{2, 3}, [2]int{3, 7}, [2]int{2, 3}, [2]int{3, 0}, [2]int{2, 1}, [2]int{3, 3}}
		capacity := 11
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 21)
	})
	run("item selection 9", func() {
		items := [][2]int{[2]int{5, 1}, [2]int{2, 1}, [2]int{3, 11}, [2]int{4, 3}, [2]int{2, 11}, [2]int{1, 5}, [2]int{2, 10}, [2]int{6, 2}, [2]int{1, 0}}
		capacity := 0
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 0)
	})
	run("item selection 10", func() {
		items := [][2]int{[2]int{3, 2}, [2]int{5, 7}, [2]int{5, 5}, [2]int{6, 5}, [2]int{4, 7}, [2]int{6, 1}, [2]int{5, 0}, [2]int{3, 7}, [2]int{6, 9}, [2]int{3, 7}}
		capacity := 9
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 16)
	})
	run("item selection 11", func() {
		items := [][2]int{[2]int{2, 2}, [2]int{3, 1}, [2]int{1, 7}, [2]int{5, 11}, [2]int{1, 4}, [2]int{3, 4}, [2]int{4, 8}, [2]int{2, 3}, [2]int{3, 1}, [2]int{1, 0}, [2]int{5, 1}}
		capacity := 11
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		got, err := fn(items, capacity)
		must(err)
		equal(got, 30)
	})
	run("invalid input", func() {
		items := [][2]int{[2]int{0, 2}}
		capacity := 3
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		_, err := fn(items, capacity)
		bad(err)
	})
	run("invalid input", func() {
		items := [][2]int{}
		capacity := -1
		before_items := snap(items)
		defer func() { equal(snap(items), before_items) }()
		_, err := fn(items, capacity)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
