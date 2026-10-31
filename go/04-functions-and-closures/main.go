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
		run("state evolves signed and zero deltas", func() { f := Prototype(3); equal(f(0), 3); equal(f(4), 7); equal(f(-9), -2) })
		run("factory independence and callback alias", func() {
			a, b := Prototype(1), Prototype(1)
			alias := a
			equal(alias(2), 3)
			equal(a(1), 4)
			equal(b(0), 1)
		})
	} else {
		run("paired closures share one variable", func() {
			add, read := NewAccumulator(10)
			equal(read(), 10)
			equal(add(-3), 7)
			equal(read(), 7)
			equal(read(), 7)
			alias := add
			equal(alias(2), 9)
			equal(read(), 9)
		})
		run("separate factories independent", func() {
			a, ar := NewAccumulator(0)
			b, br := NewAccumulator(0)
			equal(a(5), 5)
			equal(br(), 0)
			equal(b(2), 2)
			equal(ar(), 5)
		})
		run("loop captures independent initial values", func() {
			f := MakeAccumulators([]int{1, 10, 100})
			equal(f[0](1), 2)
			equal(f[1](1), 11)
			equal(f[2](1), 101)
			equal(f[0](1), 3)
			equal(f[1](0), 11)
		})
		run("input snapshot empty and repeated values", func() {
			starts := []int{4, 4}
			f := MakeAccumulators(starts)
			starts[0] = 999
			equal(f[0](0), 4)
			equal(f[1](-1), 3)
			equal(f[0](0), 4)
			ok(MakeAccumulators(nil) != nil)
			equal(len(MakeAccumulators(nil)), 0)
		})
	}
	finish()
}
