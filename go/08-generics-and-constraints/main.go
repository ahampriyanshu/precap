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

func need[T any](v T, e error) T  { must(e); return v }
func yes(v bool, e error)         { must(e); ok(v) }
func no(v bool, e error)          { must(e); ok(!v) }
func invalid[T any](v T, e error) { bad(e) }
func sp(s string) *string         { return &s }

type namedCount int
type genericKey struct {
	Name    string
	Version int
}

func main() {
	stage := stageFlag()
	_ = stage
	if stage == "prototype" {
		run("integer stable first occurrence", func() {
			equal(Prototype([]int{2, 1, 2, 0, 1}), []int{2, 1, 0})
			equal(Prototype([]string{"b", "a", "b"}), []string{"b", "a"})
		})
		run("named type and empty inference", func() { equal(Prototype([]namedCount{3, 3, 1}), []namedCount{3, 1}); ok(Prototype[int](nil) != nil) })
	} else {
		run("integer and string stable order", func() {
			equal(Solve([]int{2, 1, 2, 0, 1}), []int{2, 1, 0})
			equal(Solve([]string{"", "a", "", "A"}), []string{"", "a", "A"})
		})
		run("named types arrays and comparable structs", func() {
			equal(Solve([]namedCount{3, 3, 1}), []namedCount{3, 1})
			equal(Solve([][2]int{{1, 2}, {1, 2}, {2, 1}}), [][2]int{{1, 2}, {2, 1}})
			equal(Solve([]genericKey{{"a", 1}, {"a", 1}, {"a", 2}}), []genericKey{{"a", 1}, {"a", 2}})
		})
		run("pointer identity instead of pointed value", func() {
			a, b := ip(1), ip(1)
			v := Solve([]*int{a, b, a, nil, nil})
			ok(len(v) == 3 && v[0] == a && v[1] == b && v[2] == nil)
		})
		run("input ownership and nonnil empty output", func() {
			a := []int{1, 2}
			v := Solve(a)
			v[0] = 99
			equal(a, []int{1, 2})
			ok(Solve[int](nil) != nil)
			equal(Solve([]int{}), []int{})
		})
	}
	finish()
}
