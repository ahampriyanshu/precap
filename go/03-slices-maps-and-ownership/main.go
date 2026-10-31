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

func main() {
	stage := stageFlag()
	_ = stage
	if stage == "prototype" {
		run("patch copy ordered changes", func() {
			s := map[string][]int{"x": {1, 2}}
			p := []Patch{{"x", 0, 3}, {"x", 0, 4}}
			equal(need(Prototype(s, p)), map[string][]int{"x": {4, 2}})
			equal(s, map[string][]int{"x": {1, 2}})
		})
		run("empty and validation", func() {
			equal(need(Prototype(nil, nil)), map[string][]int{})
			invalid(Prototype(map[string][]int{"x": {}}, []Patch{{"x", 0, 1}}))
			invalid(Prototype(nil, []Patch{{"x", 0, 1}}))
		})
	} else {
		run("ordered patches and preserved inputs", func() {
			s := map[string][]int{"x": {1, 2}, "": {3}}
			p := []Patch{{"x", 0, 4}, {"x", 0, 5}, {"", 0, 0}}
			before, pbefore := snap(s), snap(p)
			equal(need(Solve(s, p)), map[string][]int{"x": {5, 2}, "": {0}})
			equal(snap(s), before)
			equal(snap(p), pbefore)
		})
		run("nested outputs do not alias shared source", func() {
			a := []int{1, 2}
			s := map[string][]int{"x": a, "y": a}
			v := need(Solve(s, nil))
			v["x"][0] = 99
			equal(v["y"], []int{1, 2})
			equal(s["x"], []int{1, 2})
			a[1] = 88
			equal(v["y"], []int{1, 2})
		})
		run("error after valid patch preserves caller", func() {
			s := map[string][]int{"x": {1, 2}}
			invalid(Solve(s, []Patch{{"x", 0, 99}, {"missing", 0, 1}}))
			equal(s, map[string][]int{"x": {1, 2}})
			invalid(Solve(s, []Patch{{"x", -1, 1}}))
			invalid(Solve(s, []Patch{{"x", 2, 1}}))
		})
		run("nil empty and capacity trap", func() {
			s := map[string][]int{"empty": nil}
			v := need(Solve(s, nil))
			ok(v["empty"] != nil)
			a := make([]int, 2, 8)
			a[0], a[1] = 1, 2
			v = need(Solve(map[string][]int{"x": a}, nil))
			v["x"] = append(v["x"], 3)
			equal(a, []int{1, 2})
			equal(need(Solve(nil, nil)), map[string][]int{})
		})
	}
	finish()
}
