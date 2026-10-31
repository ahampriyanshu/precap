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
	run("first maximum wins", func() {
		loads := []int{8, 2, 8}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{18, ip(0)})
	})
	run("empty input", func() {
		loads := []int{}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{0, (*int)(nil)})
	})
	run("one zero", func() {
		loads := []int{0}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{0, ip(0)})
	})
	run("unbounded integer arithmetic", func() {
		loads := []int{1000000000000, 1}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{1000000000001, ip(0)})
	})
	run("generated length 2", func() {
		loads := []int{2, 6}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{8, ip(1)})
	})
	run("generated length 3", func() {
		loads := []int{10, 11, 15}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{36, ip(2)})
	})
	run("generated length 4", func() {
		loads := []int{21, 28, 6, 24}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{79, ip(1)})
	})
	run("generated length 5", func() {
		loads := []int{14, 21, 9, 27, 17}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{88, ip(3)})
	})
	run("generated length 6", func() {
		loads := []int{13, 9, 3, 23, 19, 7}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{74, ip(3)})
	})
	run("generated length 7", func() {
		loads := []int{27, 23, 9, 16, 20, 5, 9}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{109, ip(0)})
	})
	run("generated length 8", func() {
		loads := []int{21, 22, 28, 29, 22, 29, 3, 16}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{170, ip(3)})
	})
	run("generated length 9", func() {
		loads := []int{7, 15, 15, 28, 25, 26, 0, 28, 23}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{167, ip(3)})
	})
	run("generated length 10", func() {
		loads := []int{20, 29, 22, 16, 9, 24, 5, 28, 28, 23}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{204, ip(1)})
	})
	run("generated length 11", func() {
		loads := []int{28, 19, 19, 2, 18, 13, 13, 4, 24, 26, 20}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{186, ip(0)})
	})
	run("generated length 12", func() {
		loads := []int{16, 11, 6, 5, 0, 5, 20, 11, 6, 20, 28, 12}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{140, ip(10)})
	})
	run("generated length 13", func() {
		loads := []int{14, 2, 12, 23, 10, 28, 15, 23, 14, 5, 11, 0, 11}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{168, ip(5)})
	})
	run("generated length 14", func() {
		loads := []int{25, 25, 18, 5, 17, 25, 5, 4, 12, 3, 12, 29, 27, 26}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{233, ip(11)})
	})
	run("generated length 15", func() {
		loads := []int{29, 20, 3, 18, 18, 23, 0, 15, 24, 25, 25, 28, 27, 6, 4}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{265, ip(0)})
	})
	run("generated length 16", func() {
		loads := []int{27, 17, 6, 7, 9, 16, 28, 15, 7, 27, 13, 16, 9, 6, 15, 13}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{231, ip(6)})
	})
	run("generated length 17", func() {
		loads := []int{2, 4, 0, 5, 26, 22, 3, 12, 12, 18, 18, 3, 4, 1, 21, 4, 25}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{180, ip(4)})
	})
	run("generated length 18", func() {
		loads := []int{8, 0, 29, 2, 28, 8, 0, 24, 1, 8, 13, 2, 26, 5, 6, 20, 16, 2}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{198, ip(2)})
	})
	run("generated length 19", func() {
		loads := []int{29, 6, 10, 9, 0, 8, 4, 27, 16, 0, 19, 3, 8, 16, 8, 16, 17, 13, 13}
		before_loads := snap(loads)
		defer func() { equal(snap(loads), before_loads) }()
		equal(fn(loads), Summary{222, ip(0)})
	})
	if stage == "final" {
	}

	finish()
}
