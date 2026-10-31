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
	run("multiple legal choices", func() {
		n := 4
		edges := [][2]int{[2]int{0, 2}, [2]int{1, 2}, [2]int{2, 3}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2, 3})
	})
	run("cycle", func() {
		n := 2
		edges := [][2]int{[2]int{0, 1}, [2]int{1, 0}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, ([]int)(nil))
	})
	run("duplicate prerequisite", func() {
		n := 2
		edges := [][2]int{[2]int{0, 1}, [2]int{0, 1}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1})
	})
	run("self cycle", func() {
		n := 1
		edges := [][2]int{[2]int{0, 0}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, ([]int)(nil))
	})
	run("empty graph", func() {
		n := 0
		edges := [][2]int{}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{})
	})
	run("generated DAG 1", func() {
		n := 1
		edges := [][2]int{}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0})
	})
	run("generated DAG 2", func() {
		n := 2
		edges := [][2]int{[2]int{0, 1}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1})
	})
	run("generated DAG 3", func() {
		n := 3
		edges := [][2]int{}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2})
	})
	run("generated DAG 4", func() {
		n := 4
		edges := [][2]int{[2]int{0, 2}, [2]int{2, 3}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2, 3})
	})
	run("generated DAG 5", func() {
		n := 5
		edges := [][2]int{[2]int{0, 2}, [2]int{1, 2}, [2]int{1, 4}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2, 3, 4})
	})
	run("generated DAG 6", func() {
		n := 6
		edges := [][2]int{[2]int{0, 4}, [2]int{1, 2}, [2]int{2, 3}, [2]int{2, 4}, [2]int{3, 4}, [2]int{3, 5}, [2]int{4, 5}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2, 3, 4, 5})
	})
	run("generated DAG 7", func() {
		n := 7
		edges := [][2]int{[2]int{0, 2}, [2]int{0, 6}, [2]int{1, 2}, [2]int{1, 6}, [2]int{2, 5}, [2]int{3, 5}, [2]int{5, 6}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2, 3, 4, 5, 6})
	})
	run("generated DAG 8", func() {
		n := 8
		edges := [][2]int{[2]int{0, 1}, [2]int{0, 2}, [2]int{0, 3}, [2]int{2, 3}, [2]int{2, 4}, [2]int{3, 7}, [2]int{4, 6}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2, 3, 4, 5, 6, 7})
	})
	run("generated DAG 9", func() {
		n := 9
		edges := [][2]int{[2]int{0, 7}, [2]int{0, 8}, [2]int{1, 4}, [2]int{1, 5}, [2]int{1, 8}, [2]int{2, 4}, [2]int{2, 5}, [2]int{2, 7}, [2]int{2, 8}, [2]int{4, 5}, [2]int{4, 8}, [2]int{5, 6}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2, 3, 4, 5, 6, 7, 8})
	})
	run("generated DAG 10", func() {
		n := 10
		edges := [][2]int{[2]int{0, 2}, [2]int{0, 3}, [2]int{0, 4}, [2]int{0, 7}, [2]int{0, 9}, [2]int{1, 2}, [2]int{1, 4}, [2]int{1, 6}, [2]int{1, 7}, [2]int{1, 9}, [2]int{2, 6}, [2]int{3, 6}, [2]int{4, 7}, [2]int{4, 9}, [2]int{5, 8}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9})
	})
	run("generated DAG 11", func() {
		n := 11
		edges := [][2]int{[2]int{0, 5}, [2]int{0, 7}, [2]int{0, 9}, [2]int{0, 10}, [2]int{1, 4}, [2]int{1, 6}, [2]int{1, 9}, [2]int{2, 3}, [2]int{2, 7}, [2]int{2, 8}, [2]int{2, 9}, [2]int{3, 4}, [2]int{3, 9}, [2]int{4, 5}, [2]int{4, 8}, [2]int{4, 10}, [2]int{5, 7}, [2]int{5, 8}, [2]int{5, 9}, [2]int{6, 8}, [2]int{8, 9}, [2]int{9, 10}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10})
	})
	run("invalid input", func() {
		n := -1
		edges := [][2]int{}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		_, err := fn(n, edges)
		bad(err)
	})
	run("invalid input", func() {
		n := 2
		edges := [][2]int{[2]int{2, 0}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		_, err := fn(n, edges)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
