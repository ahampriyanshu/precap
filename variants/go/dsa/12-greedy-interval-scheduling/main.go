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
	run("earliest-start trap", func() {
		jobs := []Job{Job{"long", 0, 10}, Job{"a", 1, 2}, Job{"b", 2, 3}, Job{"c", 3, 4}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"a", "b", "c"})
	})
	run("tie and touching", func() {
		jobs := []Job{Job{"b", 0, 2}, Job{"a", 0, 2}, Job{"c", 2, 3}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"a", "c"})
	})
	run("empty schedule", func() {
		jobs := []Job{}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{})
	})
	run("generated schedule 1", func() {
		jobs := []Job{Job{"j0", 4, 8}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j0"})
	})
	run("generated schedule 2", func() {
		jobs := []Job{Job{"j0", 8, 13}, Job{"j1", 2, 5}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j1", "j0"})
	})
	run("generated schedule 3", func() {
		jobs := []Job{Job{"j0", 5, 9}, Job{"j1", 7, 9}, Job{"j2", 6, 11}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j0"})
	})
	run("generated schedule 4", func() {
		jobs := []Job{Job{"j0", -2, -1}, Job{"j1", 5, 7}, Job{"j2", -3, 0}, Job{"j3", 2, 6}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j0", "j3"})
	})
	run("generated schedule 5", func() {
		jobs := []Job{Job{"j0", 1, 5}, Job{"j1", 0, 2}, Job{"j2", -2, -1}, Job{"j3", 4, 6}, Job{"j4", 4, 9}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j2", "j1", "j3"})
	})
	run("generated schedule 6", func() {
		jobs := []Job{Job{"j0", 0, 4}, Job{"j1", 1, 2}, Job{"j2", 2, 4}, Job{"j3", 0, 3}, Job{"j4", -1, 3}, Job{"j5", 0, 4}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j1", "j2"})
	})
	run("generated schedule 7", func() {
		jobs := []Job{Job{"j0", 2, 6}, Job{"j1", -2, 1}, Job{"j2", 6, 8}, Job{"j3", -1, 1}, Job{"j4", -4, 1}, Job{"j5", 9, 12}, Job{"j6", 6, 8}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j4", "j0", "j2", "j5"})
	})
	run("generated schedule 8", func() {
		jobs := []Job{Job{"j0", 8, 9}, Job{"j1", -1, 2}, Job{"j2", 3, 4}, Job{"j3", 6, 9}, Job{"j4", 4, 7}, Job{"j5", 3, 4}, Job{"j6", 0, 3}, Job{"j7", 9, 12}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j1", "j2", "j4", "j0", "j7"})
	})
	run("generated schedule 9", func() {
		jobs := []Job{Job{"j0", -4, -1}, Job{"j1", 8, 12}, Job{"j2", 6, 8}, Job{"j3", 0, 5}, Job{"j4", 1, 4}, Job{"j5", 9, 11}, Job{"j6", 2, 3}, Job{"j7", -4, -1}, Job{"j8", 6, 11}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j0", "j6", "j2", "j5"})
	})
	run("generated schedule 10", func() {
		jobs := []Job{Job{"j0", 8, 11}, Job{"j1", -3, 1}, Job{"j2", -1, 4}, Job{"j3", 7, 10}, Job{"j4", 6, 11}, Job{"j5", 0, 5}, Job{"j6", 0, 3}, Job{"j7", -2, 3}, Job{"j8", 1, 3}, Job{"j9", 9, 13}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j1", "j8", "j3"})
	})
	run("generated schedule 11", func() {
		jobs := []Job{Job{"j0", 0, 1}, Job{"j1", 2, 5}, Job{"j2", -3, -2}, Job{"j3", -3, -2}, Job{"j4", 9, 10}, Job{"j5", -4, -1}, Job{"j6", -4, 0}, Job{"j7", 3, 8}, Job{"j8", -3, 0}, Job{"j9", 9, 14}, Job{"j10", -1, 0}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j2", "j10", "j0", "j1", "j4"})
	})
	run("generated schedule 12", func() {
		jobs := []Job{Job{"j0", 2, 6}, Job{"j1", -4, -1}, Job{"j2", -1, 3}, Job{"j3", -2, 0}, Job{"j4", 2, 7}, Job{"j5", 4, 7}, Job{"j6", 4, 7}, Job{"j7", -3, 2}, Job{"j8", -2, 3}, Job{"j9", 5, 8}, Job{"j10", 6, 11}, Job{"j11", 8, 11}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j1", "j2", "j5", "j11"})
	})
	run("generated schedule 13", func() {
		jobs := []Job{Job{"j0", 2, 4}, Job{"j1", 1, 4}, Job{"j2", 6, 10}, Job{"j3", -2, 2}, Job{"j4", 8, 10}, Job{"j5", 2, 5}, Job{"j6", 6, 9}, Job{"j7", 3, 7}, Job{"j8", 5, 7}, Job{"j9", 4, 8}, Job{"j10", 6, 10}, Job{"j11", 1, 3}, Job{"j12", 0, 3}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j3", "j0", "j8", "j4"})
	})
	run("generated schedule 14", func() {
		jobs := []Job{Job{"j0", 6, 7}, Job{"j1", 0, 5}, Job{"j2", 9, 14}, Job{"j3", 1, 2}, Job{"j4", 8, 9}, Job{"j5", 7, 11}, Job{"j6", 3, 8}, Job{"j7", 7, 8}, Job{"j8", -4, 1}, Job{"j9", 5, 9}, Job{"j10", 9, 10}, Job{"j11", -3, 0}, Job{"j12", 0, 1}, Job{"j13", 0, 3}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		got, err := fn(jobs)
		must(err)
		equal(got, []string{"j11", "j12", "j3", "j0", "j7", "j4", "j10"})
	})
	run("invalid input", func() {
		jobs := []Job{Job{"x", 2, 2}}
		before_jobs := snap(jobs)
		defer func() { equal(snap(jobs), before_jobs) }()
		_, err := fn(jobs)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
