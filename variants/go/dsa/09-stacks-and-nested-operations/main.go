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
	run("nested", func() {
		tokens := []string{"LOAD:a", "LOAD:b", "UNLOAD:b", "UNLOAD:a"}
		before_tokens := snap(tokens)
		defer func() { equal(snap(tokens), before_tokens) }()
		got, err := fn(tokens)
		must(err)
		equal(got, true)
	})
	run("counts are insufficient", func() {
		tokens := []string{"LOAD:a", "LOAD:b", "UNLOAD:a", "UNLOAD:b"}
		before_tokens := snap(tokens)
		defer func() { equal(snap(tokens), before_tokens) }()
		got, err := fn(tokens)
		must(err)
		equal(got, false)
	})
	run("empty balanced", func() {
		tokens := []string{}
		before_tokens := snap(tokens)
		defer func() { equal(snap(tokens), before_tokens) }()
		got, err := fn(tokens)
		must(err)
		equal(got, true)
	})
	run("underflow", func() {
		tokens := []string{"UNLOAD:x"}
		before_tokens := snap(tokens)
		defer func() { equal(snap(tokens), before_tokens) }()
		got, err := fn(tokens)
		must(err)
		equal(got, false)
	})
	run("unfinished", func() {
		tokens := []string{"LOAD:x"}
		before_tokens := snap(tokens)
		defer func() { equal(snap(tokens), before_tokens) }()
		got, err := fn(tokens)
		must(err)
		equal(got, false)
	})
	run("invalid input", func() {
		tokens := []string{"LOAD:"}
		before_tokens := snap(tokens)
		defer func() { equal(snap(tokens), before_tokens) }()
		_, err := fn(tokens)
		bad(err)
	})
	run("invalid input", func() {
		tokens := []string{"PUSH:x"}
		before_tokens := snap(tokens)
		defer func() { equal(snap(tokens), before_tokens) }()
		_, err := fn(tokens)
		bad(err)
	})
	run("invalid input", func() {
		tokens := []string{"LOAD:a:b"}
		before_tokens := snap(tokens)
		defer func() { equal(snap(tokens), before_tokens) }()
		_, err := fn(tokens)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
