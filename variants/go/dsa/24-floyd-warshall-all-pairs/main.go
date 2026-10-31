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
	run("parallel edges and ordered intermediates", func() {
		n := 4
		edges := [][3]int{[3]int{0, 1, 7}, [3]int{0, 1, 3}, [3]int{1, 2, -1}, [3]int{2, 3, 2}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), ip(3), ip(2), ip(4)}, []*int{(*int)(nil), ip(0), ip(-1), ip(1)}, []*int{(*int)(nil), (*int)(nil), ip(0), ip(2)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), ip(0)}})
	})
	run("wrong loop order misses this route", func() {
		n := 4
		edges := [][3]int{[3]int{0, 3, 1}, [3]int{3, 2, 1}, [3]int{2, 1, 1}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), ip(3), ip(2), ip(1)}, []*int{(*int)(nil), ip(0), (*int)(nil), (*int)(nil)}, []*int{(*int)(nil), ip(1), ip(0), (*int)(nil)}, []*int{(*int)(nil), ip(2), ip(1), ip(0)}})
	})
	run("unreachable pairs and diagonal", func() {
		n := 2
		edges := [][3]int{}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), (*int)(nil)}, []*int{(*int)(nil), ip(0)}})
	})
	run("empty graph", func() {
		n := 0
		edges := [][3]int{}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{})
	})
	run("all-pairs DAG 1", func() {
		n := 1
		edges := [][3]int{}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0)}})
	})
	run("all-pairs DAG 2", func() {
		n := 2
		edges := [][3]int{[3]int{0, 1, -2}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), ip(-2)}, []*int{(*int)(nil), ip(0)}})
	})
	run("all-pairs DAG 3", func() {
		n := 3
		edges := [][3]int{[3]int{0, 1, 4}, [3]int{0, 2, -2}, [3]int{1, 2, -1}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), ip(4), ip(-2)}, []*int{(*int)(nil), ip(0), ip(-1)}, []*int{(*int)(nil), (*int)(nil), ip(0)}})
	})
	run("all-pairs DAG 4", func() {
		n := 4
		edges := [][3]int{[3]int{0, 1, -1}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), ip(-1), (*int)(nil), (*int)(nil)}, []*int{(*int)(nil), ip(0), (*int)(nil), (*int)(nil)}, []*int{(*int)(nil), (*int)(nil), ip(0), (*int)(nil)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), ip(0)}})
	})
	run("all-pairs DAG 5", func() {
		n := 5
		edges := [][3]int{[3]int{0, 4, -1}, [3]int{1, 2, 6}, [3]int{1, 3, 7}, [3]int{1, 4, 0}, [3]int{2, 4, 3}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), (*int)(nil), (*int)(nil), (*int)(nil), ip(-1)}, []*int{(*int)(nil), ip(0), ip(6), ip(7), ip(0)}, []*int{(*int)(nil), (*int)(nil), ip(0), (*int)(nil), ip(3)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), ip(0), (*int)(nil)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0)}})
	})
	run("all-pairs DAG 6", func() {
		n := 6
		edges := [][3]int{[3]int{0, 1, 4}, [3]int{0, 2, -1}, [3]int{0, 3, 1}, [3]int{0, 5, 7}, [3]int{2, 5, 5}, [3]int{3, 4, 4}, [3]int{4, 5, 6}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), ip(4), ip(-1), ip(1), ip(5), ip(4)}, []*int{(*int)(nil), ip(0), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil)}, []*int{(*int)(nil), (*int)(nil), ip(0), (*int)(nil), (*int)(nil), ip(5)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), ip(0), ip(4), ip(10)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0), ip(6)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0)}})
	})
	run("all-pairs DAG 7", func() {
		n := 7
		edges := [][3]int{[3]int{0, 1, 2}, [3]int{0, 2, 7}, [3]int{0, 3, 5}, [3]int{0, 4, 6}, [3]int{1, 3, 2}, [3]int{1, 4, 2}, [3]int{1, 5, 0}, [3]int{1, 6, 4}, [3]int{2, 4, 7}, [3]int{3, 4, 2}, [3]int{3, 6, 2}, [3]int{4, 5, 7}, [3]int{5, 6, 0}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), ip(2), ip(7), ip(4), ip(4), ip(2), ip(2)}, []*int{(*int)(nil), ip(0), (*int)(nil), ip(2), ip(2), ip(0), ip(0)}, []*int{(*int)(nil), (*int)(nil), ip(0), (*int)(nil), ip(7), ip(14), ip(14)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), ip(0), ip(2), ip(9), ip(2)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0), ip(7), ip(7)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0), ip(0)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0)}})
	})
	run("all-pairs DAG 8", func() {
		n := 8
		edges := [][3]int{[3]int{0, 2, 2}, [3]int{0, 3, 3}, [3]int{0, 4, 4}, [3]int{0, 5, 2}, [3]int{0, 7, 2}, [3]int{1, 2, 0}, [3]int{1, 3, -2}, [3]int{1, 5, 0}, [3]int{1, 6, 1}, [3]int{1, 7, -2}, [3]int{2, 3, 5}, [3]int{2, 4, 4}, [3]int{2, 6, 4}, [3]int{3, 4, 3}, [3]int{3, 6, 3}, [3]int{4, 6, 2}, [3]int{5, 6, 1}, [3]int{5, 7, 0}, [3]int{6, 7, 4}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, [][]*int{[]*int{ip(0), (*int)(nil), ip(2), ip(3), ip(4), ip(2), ip(3), ip(2)}, []*int{(*int)(nil), ip(0), ip(0), ip(-2), ip(1), ip(0), ip(1), ip(-2)}, []*int{(*int)(nil), (*int)(nil), ip(0), ip(5), ip(4), (*int)(nil), ip(4), ip(8)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), ip(0), ip(3), (*int)(nil), ip(3), ip(7)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0), (*int)(nil), ip(2), ip(6)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0), ip(1), ip(0)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0), ip(4)}, []*int{(*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), (*int)(nil), ip(0)}})
	})
	run("negative cycle anywhere", func() {
		n := 2
		edges := [][3]int{[3]int{0, 1, -2}, [3]int{1, 0, 1}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		_, err := fn(n, edges)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
