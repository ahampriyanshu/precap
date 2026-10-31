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
	run("discovery is not finalization", func() {
		n := 4
		edges := [][3]int{[3]int{0, 1, 10}, [3]int{0, 2, 1}, [3]int{2, 1, 1}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(2), ip(1), (*int)(nil)})
	})
	run("zero cycle and stale entry", func() {
		n := 3
		edges := [][3]int{[3]int{0, 1, 0}, [3]int{1, 0, 0}, [3]int{1, 2, 2}, [3]int{0, 2, 9}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(0), ip(2)})
	})
	run("weighted graph 1", func() {
		n := 1
		edges := [][3]int{}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0)})
	})
	run("weighted graph 2", func() {
		n := 2
		edges := [][3]int{}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil)})
	})
	run("weighted graph 3", func() {
		n := 3
		edges := [][3]int{[3]int{2, 1, 2}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil)})
	})
	run("weighted graph 4", func() {
		n := 4
		edges := [][3]int{[3]int{2, 1, 2}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil), (*int)(nil)})
	})
	run("weighted graph 5", func() {
		n := 5
		edges := [][3]int{[3]int{0, 0, 7}, [3]int{4, 0, 8}, [3]int{4, 1, 0}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil)})
	})
	run("weighted graph 6", func() {
		n := 6
		edges := [][3]int{[3]int{2, 1, 8}, [3]int{2, 3, 7}, [3]int{3, 0, 6}, [3]int{4, 0, 1}, [3]int{4, 2, 7}, [3]int{5, 0, 1}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil)})
	})
	run("weighted graph 7", func() {
		n := 7
		edges := [][3]int{[3]int{1, 4, 5}, [3]int{1, 5, 1}, [3]int{2, 3, 0}, [3]int{2, 6, 7}, [3]int{3, 3, 4}, [3]int{6, 2, 2}, [3]int{6, 3, 0}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil)})
	})
	run("weighted graph 8", func() {
		n := 8
		edges := [][3]int{[3]int{0, 3, 0}, [3]int{0, 4, 6}, [3]int{1, 0, 2}, [3]int{1, 4, 3}, [3]int{1, 5, 5}, [3]int{1, 7, 7}, [3]int{4, 6, 1}, [3]int{4, 7, 6}, [3]int{5, 0, 0}, [3]int{5, 1, 6}, [3]int{5, 4, 0}, [3]int{5, 5, 2}, [3]int{7, 6, 8}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), (*int)(nil), (*int)(nil), ip(0), ip(6), (*int)(nil), ip(7), ip(12)})
	})
	run("weighted graph 9", func() {
		n := 9
		edges := [][3]int{[3]int{0, 8, 6}, [3]int{1, 0, 3}, [3]int{2, 0, 6}, [3]int{2, 1, 1}, [3]int{3, 2, 0}, [3]int{3, 6, 1}, [3]int{4, 2, 2}, [3]int{4, 5, 6}, [3]int{5, 3, 4}, [3]int{5, 4, 7}, [3]int{5, 6, 5}, [3]int{5, 8, 2}, [3]int{6, 1, 0}, [3]int{6, 3, 7}, [3]int{6, 5, 1}, [3]int{6, 7, 3}, [3]int{7, 8, 8}, [3]int{8, 2, 1}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(8), ip(7), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(6)})
	})
	run("weighted graph 10", func() {
		n := 10
		edges := [][3]int{[3]int{0, 0, 8}, [3]int{0, 7, 8}, [3]int{0, 9, 2}, [3]int{1, 2, 7}, [3]int{2, 2, 6}, [3]int{2, 3, 5}, [3]int{2, 8, 7}, [3]int{2, 9, 2}, [3]int{3, 0, 4}, [3]int{3, 3, 6}, [3]int{4, 5, 5}, [3]int{5, 4, 3}, [3]int{5, 9, 8}, [3]int{6, 2, 3}, [3]int{6, 6, 5}, [3]int{6, 8, 5}, [3]int{6, 9, 0}, [3]int{7, 1, 1}, [3]int{7, 2, 3}, [3]int{8, 8, 1}, [3]int{8, 9, 1}, [3]int{9, 0, 4}, [3]int{9, 4, 3}, [3]int{9, 5, 8}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(9), ip(11), ip(16), ip(5), ip(10), (*int)(nil), ip(8), ip(18), ip(2)})
	})
	run("weighted graph 11", func() {
		n := 11
		edges := [][3]int{[3]int{0, 8, 4}, [3]int{1, 0, 0}, [3]int{1, 1, 1}, [3]int{1, 2, 3}, [3]int{1, 3, 2}, [3]int{1, 7, 3}, [3]int{1, 8, 5}, [3]int{2, 3, 3}, [3]int{3, 4, 5}, [3]int{3, 5, 2}, [3]int{3, 8, 3}, [3]int{4, 1, 0}, [3]int{4, 2, 8}, [3]int{4, 9, 8}, [3]int{5, 3, 3}, [3]int{5, 6, 2}, [3]int{6, 0, 2}, [3]int{7, 0, 0}, [3]int{7, 9, 2}, [3]int{8, 10, 8}, [3]int{9, 7, 6}, [3]int{10, 3, 1}, [3]int{10, 7, 0}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(18), ip(21), ip(13), ip(18), ip(15), ip(17), ip(12), ip(4), ip(14), ip(12)})
	})
	run("weighted graph 12", func() {
		n := 12
		edges := [][3]int{[3]int{0, 9, 0}, [3]int{0, 10, 0}, [3]int{1, 1, 2}, [3]int{1, 5, 8}, [3]int{1, 11, 7}, [3]int{3, 0, 7}, [3]int{3, 11, 0}, [3]int{4, 1, 6}, [3]int{4, 2, 0}, [3]int{4, 9, 6}, [3]int{5, 3, 2}, [3]int{5, 8, 4}, [3]int{6, 10, 5}, [3]int{7, 7, 5}, [3]int{8, 2, 0}, [3]int{8, 5, 5}, [3]int{9, 7, 8}, [3]int{9, 9, 6}, [3]int{9, 10, 7}, [3]int{10, 1, 6}, [3]int{10, 6, 2}, [3]int{10, 7, 4}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges, source)
		must(err)
		equal(got, []*int{ip(0), ip(6), ip(18), ip(16), (*int)(nil), ip(14), ip(2), ip(4), ip(18), ip(0), ip(0), ip(13)})
	})
	run("invalid input", func() {
		n := 2
		edges := [][3]int{[3]int{0, 1, -1}}
		source := 0
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		_, err := fn(n, edges, source)
		bad(err)
	})
	run("invalid input", func() {
		n := 0
		edges := [][3]int{}
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
