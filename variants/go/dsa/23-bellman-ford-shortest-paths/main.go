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
	run("late cheaper path", func() {
		n := 3
		edges := [][3]int{[3]int{0, 1, 4}, [3]int{0, 2, 5}, [3]int{2, 1, -3}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(2), ip(5)})
	})
	run("unreachable negative cycle", func() {
		n := 4
		edges := [][3]int{[3]int{0, 1, 2}, [3]int{2, 3, -2}, [3]int{3, 2, 1}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(2), (*int)(nil), (*int)(nil)})
	})
	run("one vertex", func() {
		n := 1
		edges := [][3]int{}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0)})
	})
	run("negative-weight DAG 2", func() {
		n := 2
		edges := [][3]int{[3]int{0, 1, 6}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(6)})
	})
	run("negative-weight DAG 3", func() {
		n := 3
		edges := [][3]int{[3]int{1, 2, 7}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil)})
	})
	run("negative-weight DAG 4", func() {
		n := 4
		edges := [][3]int{[3]int{0, 3, 2}, [3]int{2, 3, -3}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil), ip(2)})
	})
	run("negative-weight DAG 5", func() {
		n := 5
		edges := [][3]int{[3]int{0, 2, 5}, [3]int{0, 3, -3}, [3]int{1, 3, 8}, [3]int{2, 4, -5}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), ip(5), ip(-3), ip(0)})
	})
	run("negative-weight DAG 6", func() {
		n := 6
		edges := [][3]int{[3]int{0, 1, -2}, [3]int{0, 3, -2}, [3]int{1, 5, -2}, [3]int{2, 5, -1}, [3]int{3, 4, 5}, [3]int{3, 5, -4}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(-2), (*int)(nil), ip(-2), ip(3), ip(-6)})
	})
	run("negative-weight DAG 7", func() {
		n := 7
		edges := [][3]int{[3]int{0, 1, 1}, [3]int{0, 2, -4}, [3]int{0, 3, -5}, [3]int{1, 2, 2}, [3]int{1, 3, 0}, [3]int{1, 5, 5}, [3]int{1, 6, 7}, [3]int{2, 3, -2}, [3]int{2, 4, -5}, [3]int{3, 6, -4}, [3]int{4, 6, -3}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(1), ip(-4), ip(-6), ip(-9), ip(6), ip(-12)})
	})
	run("negative-weight DAG 8", func() {
		n := 8
		edges := [][3]int{[3]int{1, 2, 8}, [3]int{1, 3, 5}, [3]int{2, 6, 6}, [3]int{2, 7, -4}, [3]int{3, 6, -1}, [3]int{3, 7, 5}, [3]int{4, 7, 2}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil)})
	})
	run("negative-weight DAG 9", func() {
		n := 9
		edges := [][3]int{[3]int{0, 8, -3}, [3]int{1, 4, -3}, [3]int{1, 6, 8}, [3]int{1, 7, -4}, [3]int{1, 8, -5}, [3]int{2, 3, -5}, [3]int{2, 4, -2}, [3]int{2, 5, -2}, [3]int{3, 5, 2}, [3]int{3, 7, -4}, [3]int{4, 5, 8}, [3]int{4, 6, 2}, [3]int{5, 6, -2}, [3]int{5, 7, 1}, [3]int{6, 7, 7}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(-3)})
	})
	run("negative-weight DAG 10", func() {
		n := 10
		edges := [][3]int{[3]int{0, 4, 2}, [3]int{0, 5, 2}, [3]int{0, 6, -3}, [3]int{0, 9, 8}, [3]int{1, 2, 3}, [3]int{1, 3, -2}, [3]int{1, 8, 1}, [3]int{1, 9, -1}, [3]int{2, 4, 1}, [3]int{2, 8, 8}, [3]int{2, 9, 8}, [3]int{3, 5, 2}, [3]int{3, 6, 5}, [3]int{3, 7, -4}, [3]int{3, 8, -1}, [3]int{4, 8, 5}, [3]int{4, 9, 7}, [3]int{5, 7, 2}, [3]int{5, 8, -4}, [3]int{5, 9, -5}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil), (*int)(nil), ip(2), ip(2), ip(-3), ip(4), ip(-2), ip(-3)})
	})
	run("reachable negative cycle", func() {
		n := 2
		edges := [][3]int{[3]int{0, 1, -1}, [3]int{1, 0, 0}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		_, err := fn(n, edges, source)
		bad(err)
	})
	run("negative self cycle", func() {
		n := 1
		edges := [][3]int{[3]int{0, 0, -1}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		_, err := fn(n, edges, source)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
