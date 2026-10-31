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
		run("defaults explicit values and leading zeros", func() {
			equal(need(Prototype(nil)), Settings{1, 1000})
			equal(need(Prototype([]string{"timeout_ms=0", "workers=04"})), Settings{4, 0})
		})
		run("malformed duplicate and bounds", func() {
			for _, a := range [][]string{{"unknown=1"}, {"workers=2", "workers=3"}, {"workers=0"}, {"timeout_ms=-1"}, {"workers=+1"}} {
				invalid(Prototype(a))
			}
		})
	} else {
		run("defaults boundary and order independent", func() {
			equal(need(Solve(nil)), Settings{1, 1000})
			equal(need(Solve([]string{"workers=64", "timeout_ms=60000"})), Settings{64, 60000})
			equal(need(Solve([]string{"timeout_ms=0", "workers=01"})), Settings{1, 0})
		})
		run("syntax rejects spaces and extra separators", func() {
			for _, a := range [][]string{{""}, {"workers =1"}, {"workers= 1"}, {"workers=1=2"}, {"workers="}, {"WORKERS=1"}, {"workers=+1"}, {"workers=-"}, {"workers=1.0"}} {
				invalid(Solve(a))
			}
		})
		run("domain duplicate overflow errors zero result", func() {
			for _, a := range [][]string{{"workers=65"}, {"workers=0"}, {"workers=-1"}, {"timeout_ms=60001"}, {"timeout_ms=-1"}, {"workers=2", "workers=3"}, {"workers=9999999999999999999999999"}} {
				v, e := Solve(a)
				bad(e)
				equal(v, Settings{})
			}
		})
		run("inputs retained state and failure order independence", func() {
			a := []string{"workers=3", "timeout_ms=5"}
			before := snap(a)
			equal(need(Solve(a)), Settings{3, 5})
			equal(snap(a), before)
			invalid(Solve([]string{"workers=3", "bad"}))
			equal(need(Solve(nil)), Settings{1, 1000})
		})
	}
	finish()
}
