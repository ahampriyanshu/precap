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
	run("correction and empty range", func() {
		values := []int{4, -2, 7}
		queries := [][2]int{[2]int{0, 3}, [2]int{1, 3}, [2]int{2, 2}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{9, 5, 0})
	})
	run("empty values", func() {
		values := []int{}
		queries := [][2]int{[2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{0})
	})
	run("generated range 1", func() {
		values := []int{-4}
		queries := [][2]int{[2]int{0, 1}, [2]int{0, 1}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-4, -4, 0})
	})
	run("generated range 2", func() {
		values := []int{-5, -5}
		queries := [][2]int{[2]int{0, 2}, [2]int{1, 2}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-10, -5, 0})
	})
	run("generated range 3", func() {
		values := []int{4, 7, 6}
		queries := [][2]int{[2]int{0, 3}, [2]int{1, 3}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{17, 13, 0})
	})
	run("generated range 4", func() {
		values := []int{2, 0, 1, 4}
		queries := [][2]int{[2]int{0, 4}, [2]int{2, 4}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{7, 5, 0})
	})
	run("generated range 5", func() {
		values := []int{-5, 5, -3, -2, -9}
		queries := [][2]int{[2]int{0, 5}, [2]int{2, 5}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-14, -14, 0})
	})
	run("generated range 6", func() {
		values := []int{6, 5, -2, -5, 4, 2}
		queries := [][2]int{[2]int{0, 6}, [2]int{3, 6}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{10, 1, 0})
	})
	run("generated range 7", func() {
		values := []int{3, -5, -6, -4, -8, 9, 0}
		queries := [][2]int{[2]int{0, 7}, [2]int{3, 7}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-11, -3, 0})
	})
	run("generated range 8", func() {
		values := []int{-9, 0, 1, -7, -7, -2, -9, -7}
		queries := [][2]int{[2]int{0, 8}, [2]int{4, 8}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-40, -25, 0})
	})
	run("generated range 9", func() {
		values := []int{-7, 5, 5, -2, 0, 7, 0, -1, 7}
		queries := [][2]int{[2]int{0, 9}, [2]int{4, 9}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{14, 13, 0})
	})
	run("generated range 10", func() {
		values := []int{-9, -2, -4, 3, -1, -3, -5, 3, 5, -3}
		queries := [][2]int{[2]int{0, 10}, [2]int{5, 10}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-16, -3, 0})
	})
	run("generated range 11", func() {
		values := []int{-9, 9, -8, 1, -1, -1, -2, -9, -1, 0, 0}
		queries := [][2]int{[2]int{0, 11}, [2]int{5, 11}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-21, -13, 0})
	})
	run("generated range 12", func() {
		values := []int{-8, 3, -2, -8, 8, -2, -8, -9, -2, 9, -8, 3}
		queries := [][2]int{[2]int{0, 12}, [2]int{6, 12}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-24, -15, 0})
	})
	run("generated range 13", func() {
		values := []int{6, 2, 7, 5, -9, -8, -2, 4, 3, 3, 8, -3, -9}
		queries := [][2]int{[2]int{0, 13}, [2]int{6, 13}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{7, 4, 0})
	})
	run("generated range 14", func() {
		values := []int{-1, -1, -4, 1, -8, -3, -6, 8, -2, 2, 2, -4, -8, -8}
		queries := [][2]int{[2]int{0, 14}, [2]int{7, 14}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-32, -10, 0})
	})
	run("generated range 15", func() {
		values := []int{-8, -1, 6, -2, -1, 4, 8, -8, -9, 3, -5, -6, 2, -4, -4}
		queries := [][2]int{[2]int{0, 15}, [2]int{7, 15}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-25, -31, 0})
	})
	run("generated range 16", func() {
		values := []int{-5, -9, -1, 1, -1, -9, -6, 6, 2, 0, -6, 9, -2, 7, -1, 8}
		queries := [][2]int{[2]int{0, 16}, [2]int{8, 16}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-7, 17, 0})
	})
	run("generated range 17", func() {
		values := []int{-1, -7, -3, -5, 6, 6, -6, 7, -7, 5, 1, -8, 7, -4, -8, 2, 5}
		queries := [][2]int{[2]int{0, 17}, [2]int{8, 17}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-10, -7, 0})
	})
	run("generated range 18", func() {
		values := []int{4, 7, 3, 6, 0, -1, -7, -1, -9, -1, 1, -4, 2, -5, 9, -2, -7, 3}
		queries := [][2]int{[2]int{0, 18}, [2]int{9, 18}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{-2, -4, 0})
	})
	run("generated range 19", func() {
		values := []int{9, -1, 0, -3, 6, -3, 8, 0, -5, -1, 9, 3, 5, 1, -4, -3, 2, 0, -8}
		queries := [][2]int{[2]int{0, 19}, [2]int{9, 19}, [2]int{0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		got, err := fn(values, queries)
		must(err)
		equal(got, []int{15, 4, 0})
	})
	run("right out of bounds", func() {
		values := []int{1}
		queries := [][2]int{[2]int{0, 2}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		_, err := fn(values, queries)
		bad(err)
	})
	run("reversed", func() {
		values := []int{1}
		queries := [][2]int{[2]int{1, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		_, err := fn(values, queries)
		bad(err)
	})
	run("negative index", func() {
		values := []int{1}
		queries := [][2]int{[2]int{-1, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_queries := snap(queries)
		defer func() { equal(snap(queries), before_queries) }()
		_, err := fn(values, queries)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
