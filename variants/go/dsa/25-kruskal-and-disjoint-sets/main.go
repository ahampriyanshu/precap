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
	run("cheap cycle leaves a vertex disconnected", func() {
		n := 4
		edges := [][3]int{[3]int{0, 1, 1}, [3]int{1, 2, 1}, [3]int{0, 2, 1}, [3]int{2, 3, 9}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{11, [][3]int{[3]int{0, 1, 1}, [3]int{0, 2, 1}, [3]int{2, 3, 9}}})
	})
	run("negative edge and self-loop", func() {
		n := 3
		edges := [][3]int{[3]int{2, 1, -2}, [3]int{1, 0, 4}, [3]int{0, 0, -99}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{2, [][3]int{[3]int{1, 2, -2}, [3]int{0, 1, 4}}})
	})
	run("disconnected", func() {
		n := 3
		edges := [][3]int{[3]int{0, 1, 1}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, (*MST)(nil))
	})
	run("empty graph", func() {
		n := 0
		edges := [][3]int{}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{0, [][3]int{}})
	})
	run("generated weighted graph 1", func() {
		n := 1
		edges := [][3]int{}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{0, [][3]int{}})
	})
	run("generated weighted graph 2", func() {
		n := 2
		edges := [][3]int{[3]int{0, 1, -3}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{-3, [][3]int{[3]int{0, 1, -3}}})
	})
	run("generated weighted graph 3", func() {
		n := 3
		edges := [][3]int{[3]int{0, 1, 5}, [3]int{0, 2, -2}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{3, [][3]int{[3]int{0, 2, -2}, [3]int{0, 1, 5}}})
	})
	run("generated weighted graph 4", func() {
		n := 4
		edges := [][3]int{[3]int{1, 2, 4}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, (*MST)(nil))
	})
	run("generated weighted graph 5", func() {
		n := 5
		edges := [][3]int{[3]int{1, 2, 2}, [3]int{1, 4, -1}, [3]int{2, 3, 7}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, (*MST)(nil))
	})
	run("generated weighted graph 6", func() {
		n := 6
		edges := [][3]int{[3]int{0, 1, 1}, [3]int{0, 2, 3}, [3]int{0, 4, 5}, [3]int{2, 3, 2}, [3]int{2, 4, 5}, [3]int{3, 4, 0}, [3]int{3, 5, -2}, [3]int{4, 5, 4}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{4, [][3]int{[3]int{3, 5, -2}, [3]int{3, 4, 0}, [3]int{0, 1, 1}, [3]int{2, 3, 2}, [3]int{0, 2, 3}}})
	})
	run("generated weighted graph 7", func() {
		n := 7
		edges := [][3]int{[3]int{0, 1, 0}, [3]int{0, 4, 6}, [3]int{1, 3, 3}, [3]int{1, 4, 3}, [3]int{1, 5, 6}, [3]int{1, 6, 3}, [3]int{2, 3, 5}, [3]int{3, 4, -2}, [3]int{4, 5, -1}, [3]int{5, 6, 7}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{8, [][3]int{[3]int{3, 4, -2}, [3]int{4, 5, -1}, [3]int{0, 1, 0}, [3]int{1, 3, 3}, [3]int{1, 6, 3}, [3]int{2, 3, 5}}})
	})
	run("generated weighted graph 8", func() {
		n := 8
		edges := [][3]int{[3]int{0, 2, 7}, [3]int{0, 3, 5}, [3]int{0, 4, 2}, [3]int{0, 5, 3}, [3]int{1, 2, 4}, [3]int{1, 7, 7}, [3]int{2, 4, 4}, [3]int{2, 5, 7}, [3]int{3, 4, 2}, [3]int{4, 6, 4}, [3]int{5, 6, 2}, [3]int{5, 7, 5}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{22, [][3]int{[3]int{0, 4, 2}, [3]int{3, 4, 2}, [3]int{5, 6, 2}, [3]int{0, 5, 3}, [3]int{1, 2, 4}, [3]int{2, 4, 4}, [3]int{5, 7, 5}}})
	})
	run("generated weighted graph 9", func() {
		n := 9
		edges := [][3]int{[3]int{0, 1, -2}, [3]int{0, 3, 3}, [3]int{0, 4, 4}, [3]int{0, 8, 4}, [3]int{1, 4, 1}, [3]int{1, 6, 4}, [3]int{1, 8, 2}, [3]int{2, 7, -1}, [3]int{3, 6, 6}, [3]int{3, 8, 2}, [3]int{4, 5, 6}, [3]int{4, 8, 0}, [3]int{5, 6, 6}, [3]int{5, 7, 6}, [3]int{5, 8, 7}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		got, err := fn(n, edges)
		must(err)
		equal(got, &MST{16, [][3]int{[3]int{0, 1, -2}, [3]int{2, 7, -1}, [3]int{4, 8, 0}, [3]int{1, 4, 1}, [3]int{3, 8, 2}, [3]int{1, 6, 4}, [3]int{4, 5, 6}, [3]int{5, 7, 6}}})
	})
	run("invalid input", func() {
		n := 2
		edges := [][3]int{[3]int{0, 2, 4}}
		before_edges := snap(edges)
		defer func() { equal(snap(edges), before_edges) }()
		_, err := fn(n, edges)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
