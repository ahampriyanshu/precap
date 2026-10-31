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
		run("value transform leaves original unchanged", func() {
			a := MeterSnapshot{"", 4}
			equal(need(AddValue(a, 3)), MeterSnapshot{"", 7})
			equal(a, MeterSnapshot{"", 4})
			equal(need(AddValue(a, 0)), a)
		})
		run("negative delta returns error", func() { invalid(AddValue(MeterSnapshot{"x", 2}, -1)) })
	} else {
		run("constructor validation and zero state", func() {
			invalid(NewMeter(""))
			m := need(NewMeter("requests"))
			equal(m.Snapshot(), MeterSnapshot{"requests", 0})
			equal(need(m.Add(0)), 0)
		})
		run("pointer receiver mutation and reset", func() {
			m := need(NewMeter("x"))
			alias := m
			equal(need(alias.Add(3)), 3)
			equal(need(m.Add(2)), 5)
			equal(m.Reset(), 5)
			equal(m.Reset(), 0)
			equal(m.Snapshot(), MeterSnapshot{"x", 0})
		})
		run("invalid delta preserves state", func() {
			m := need(NewMeter("x"))
			need(m.Add(8))
			invalid(m.Add(-1))
			equal(m.Snapshot(), MeterSnapshot{"x", 8})
		})
		run("snapshots and instances independent", func() {
			a, b := need(NewMeter("x")), need(NewMeter("x"))
			need(a.Add(3))
			v := a.Snapshot()
			v.Label = "bad"
			v.Total = 99
			equal(a.Snapshot(), MeterSnapshot{"x", 3})
			equal(b.Snapshot(), MeterSnapshot{"x", 0})
		})
	}
	finish()
}
