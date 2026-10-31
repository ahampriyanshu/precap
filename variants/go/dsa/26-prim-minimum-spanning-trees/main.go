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
	run("dense matrix", func() {
		costs := [][]*int{[]*int{ip(0), ip(2), ip(8)}, []*int{ip(2), ip(0), ip(1)}, []*int{ip(8), ip(1), ip(0)}}
		before_costs := snap(costs)
		defer func() { equal(snap(costs), before_costs) }()
		got, err := fn(costs)
		must(err)
		equal(got, ip(3))
	})
	run("disconnected", func() {
		costs := [][]*int{[]*int{ip(0), (*int)(nil)}, []*int{(*int)(nil), ip(0)}}
		before_costs := snap(costs)
		defer func() { equal(snap(costs), before_costs) }()
		got, err := fn(costs)
		must(err)
		equal(got, (*int)(nil))
	})
	run("empty graph", func() {
		costs := [][]*int{}
		before_costs := snap(costs)
		defer func() { equal(snap(costs), before_costs) }()
		got, err := fn(costs)
		must(err)
		equal(got, ip(0))
	})
	run("negative edge", func() {
		costs := [][]*int{[]*int{ip(0), ip(-2)}, []*int{ip(-2), ip(0)}}
		before_costs := snap(costs)
		defer func() { equal(snap(costs), before_costs) }()
		got, err := fn(costs)
		must(err)
		equal(got, ip(-2))
	})
	run("asymmetric", func() {
		costs := [][]*int{[]*int{ip(0), ip(1)}, []*int{ip(2), ip(0)}}
		before_costs := snap(costs)
		defer func() { equal(snap(costs), before_costs) }()
		_, err := fn(costs)
		bad(err)
	})
	run("not square", func() {
		costs := [][]*int{[]*int{ip(0), ip(1)}}
		before_costs := snap(costs)
		defer func() { equal(snap(costs), before_costs) }()
		_, err := fn(costs)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
