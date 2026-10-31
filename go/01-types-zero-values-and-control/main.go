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
		run("zero value summary", func() { equal(Prototype(nil), Summary{}) })
		run("valid zero", func() { equal(Prototype([]Reading{{0, true}}), Summary{1, 0, ip(0), ip(0)}) })
		run("invalid ignored", func() { equal(Prototype([]Reading{{99, false}, {3, true}, {-2, true}}), Summary{2, 1, ip(-2), ip(3)}) })
		run("all invalid", func() { equal(Prototype([]Reading{{3, false}}), Summary{}) })
	} else {
		run("empty summary", func() { equal(Solve(nil), Summary{}) })
		run("positive minimum not invented zero", func() { equal(Solve([]Reading{{7, true}, {2, true}, {7, true}}), Summary{3, 16, ip(2), ip(7)}) })
		run("negative maximum not invented zero", func() { equal(Solve([]Reading{{-8, true}, {-2, true}}), Summary{2, -10, ip(-8), ip(-2)}) })
		run("valid zero and ignored invalid", func() { equal(Solve([]Reading{{0, true}, {999, false}}), Summary{1, 0, ip(0), ip(0)}) })
		run("input and result ownership", func() {
			a := []Reading{{2, true}, {3, true}}
			before := snap(a)
			s := Solve(a)
			*s.Minimum = 99
			equal(snap(a), before)
			equal(Solve(a), Summary{2, 5, ip(2), ip(3)})
			ok(s.Minimum != s.Maximum)
		})
	}
	finish()
}
