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
	run("duplicate removal", func() {
		labels := []string{"food", "food", "water", "fuel", "water"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 3)
	})
	run("empty", func() {
		labels := []string{}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("no kinds allowed", func() {
		labels := []string{"a"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=1 k=0", func() {
		labels := []string{"b"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=1 k=1", func() {
		labels := []string{"c"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 1)
	})
	run("window n=1 k=2", func() {
		labels := []string{"b"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 1)
	})
	run("window n=1 k=3", func() {
		labels := []string{"c"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 1)
	})
	run("window n=2 k=0", func() {
		labels := []string{"a", "a"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=2 k=1", func() {
		labels := []string{"a", "b"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 1)
	})
	run("window n=2 k=2", func() {
		labels := []string{"a", "a"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 2)
	})
	run("window n=2 k=3", func() {
		labels := []string{"a", "b"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 2)
	})
	run("window n=3 k=0", func() {
		labels := []string{"b", "a", "a"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=3 k=1", func() {
		labels := []string{"a", "c", "a"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 1)
	})
	run("window n=3 k=2", func() {
		labels := []string{"c", "c", "c"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 3)
	})
	run("window n=3 k=3", func() {
		labels := []string{"c", "a", "c"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 3)
	})
	run("window n=4 k=0", func() {
		labels := []string{"b", "c", "a", "a"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=4 k=1", func() {
		labels := []string{"b", "c", "c", "a"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 2)
	})
	run("window n=4 k=2", func() {
		labels := []string{"a", "c", "c", "b"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 3)
	})
	run("window n=4 k=3", func() {
		labels := []string{"c", "b", "c", "c"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 4)
	})
	run("window n=5 k=0", func() {
		labels := []string{"c", "a", "c", "c", "c"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=5 k=1", func() {
		labels := []string{"b", "a", "b", "a", "a"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 2)
	})
	run("window n=5 k=2", func() {
		labels := []string{"a", "a", "b", "b", "c"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 4)
	})
	run("window n=5 k=3", func() {
		labels := []string{"a", "b", "b", "a", "a"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 5)
	})
	run("window n=6 k=0", func() {
		labels := []string{"b", "a", "b", "b", "c", "a"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=6 k=1", func() {
		labels := []string{"c", "a", "c", "a", "a", "a"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 3)
	})
	run("window n=6 k=2", func() {
		labels := []string{"a", "a", "b", "a", "b", "b"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 6)
	})
	run("window n=6 k=3", func() {
		labels := []string{"b", "a", "b", "b", "b", "a"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 6)
	})
	run("window n=7 k=0", func() {
		labels := []string{"a", "c", "a", "b", "b", "a", "a"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=7 k=1", func() {
		labels := []string{"b", "b", "b", "b", "c", "c", "c"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 4)
	})
	run("window n=7 k=2", func() {
		labels := []string{"b", "b", "a", "a", "c", "b", "c"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 4)
	})
	run("window n=7 k=3", func() {
		labels := []string{"b", "a", "a", "c", "b", "c", "c"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 7)
	})
	run("window n=8 k=0", func() {
		labels := []string{"a", "c", "c", "a", "c", "a", "a", "c"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=8 k=1", func() {
		labels := []string{"b", "a", "c", "b", "c", "b", "a", "c"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 1)
	})
	run("window n=8 k=2", func() {
		labels := []string{"c", "a", "a", "c", "a", "b", "a", "c"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 5)
	})
	run("window n=8 k=3", func() {
		labels := []string{"b", "a", "c", "c", "c", "a", "a", "b"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 8)
	})
	run("window n=9 k=0", func() {
		labels := []string{"b", "c", "b", "c", "a", "c", "a", "b", "b"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=9 k=1", func() {
		labels := []string{"a", "b", "c", "a", "a", "b", "a", "b", "b"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 2)
	})
	run("window n=9 k=2", func() {
		labels := []string{"a", "b", "b", "b", "c", "c", "a", "c", "b"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 5)
	})
	run("window n=9 k=3", func() {
		labels := []string{"c", "a", "b", "a", "b", "b", "c", "b", "c"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 9)
	})
	run("window n=10 k=0", func() {
		labels := []string{"b", "c", "b", "a", "c", "a", "b", "a", "a", "c"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=10 k=1", func() {
		labels := []string{"a", "b", "a", "b", "c", "c", "c", "a", "b", "c"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 3)
	})
	run("window n=10 k=2", func() {
		labels := []string{"a", "b", "c", "c", "c", "b", "a", "c", "c", "b"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 5)
	})
	run("window n=10 k=3", func() {
		labels := []string{"a", "a", "b", "a", "c", "c", "c", "c", "c", "b"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 10)
	})
	run("window n=11 k=0", func() {
		labels := []string{"b", "a", "c", "c", "c", "c", "c", "c", "a", "c", "a"}
		limit := 0
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 0)
	})
	run("window n=11 k=1", func() {
		labels := []string{"a", "b", "b", "b", "a", "a", "b", "b", "b", "c", "c"}
		limit := 1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 3)
	})
	run("window n=11 k=2", func() {
		labels := []string{"c", "b", "c", "c", "a", "b", "c", "b", "b", "a", "b"}
		limit := 2
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 4)
	})
	run("window n=11 k=3", func() {
		labels := []string{"a", "a", "b", "c", "a", "c", "c", "c", "c", "c", "b"}
		limit := 3
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		got, err := fn(labels, limit)
		must(err)
		equal(got, 11)
	})
	run("negative limit", func() {
		labels := []string{"a"}
		limit := -1
		before_labels := snap(labels)
		defer func() { equal(snap(labels), before_labels) }()
		_, err := fn(labels, limit)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
