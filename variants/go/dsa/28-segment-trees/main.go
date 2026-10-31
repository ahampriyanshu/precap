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
	run("old minimum increases", func() {
		values := []int{1, 5}
		commands := []Command{Command{"min", 0, 2}, Command{"set", 0, 9}, Command{"min", 0, 2}, Command{"min", 1, 1}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(1), ip(5), (*int)(nil)})
	})
	run("empty values", func() {
		values := []int{}
		commands := []Command{Command{"min", 0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{(*int)(nil)})
	})
	run("point replacements 0", func() {
		values := []int{-8, 7, 2, -2, -6, 2, -9, 2}
		commands := []Command{Command{"min", 0, 1}, Command{"set", 0, 0}, Command{"min", 0, 5}, Command{"min", 0, 8}, Command{"min", 0, 4}, Command{"min", 0, 4}, Command{"set", 0, 3}, Command{"set", 0, 0}, Command{"min", 0, 4}, Command{"set", 0, 5}, Command{"set", 0, 1}, Command{"set", 0, 8}, Command{"min", 0, 5}, Command{"set", 0, 1}, Command{"min", 0, 7}, Command{"set", 0, 6}, Command{"set", 0, 2}, Command{"set", 0, 7}, Command{"set", 0, 3}, Command{"set", 0, 5}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-8), ip(-6), ip(-9), ip(-2), ip(-2), ip(-2), ip(-6), ip(-9)})
	})
	run("point replacements 1", func() {
		values := []int{0, 4, 8, -1, -7, -1, -1, 0}
		commands := []Command{Command{"set", 0, 3}, Command{"set", 0, 3}, Command{"set", 0, 6}, Command{"set", 0, 3}, Command{"min", 0, 4}, Command{"min", 0, 8}, Command{"min", 0, 0}, Command{"set", 0, 2}, Command{"min", 0, 0}, Command{"min", 0, 6}, Command{"set", 0, 1}, Command{"set", 0, 4}, Command{"set", 0, 6}, Command{"min", 0, 7}, Command{"min", 0, 0}, Command{"set", 0, 3}, Command{"min", 0, 6}, Command{"set", 0, 6}, Command{"set", 0, 8}, Command{"min", 0, 4}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-1), ip(-7), (*int)(nil), (*int)(nil), ip(-7), ip(-7), (*int)(nil), ip(-7), ip(-1)})
	})
	run("point replacements 2", func() {
		values := []int{-3, -2, -1, 5, -4, -7, 3, -5}
		commands := []Command{Command{"set", 0, 4}, Command{"set", 0, 5}, Command{"set", 0, 2}, Command{"min", 0, 6}, Command{"set", 0, 5}, Command{"set", 0, 6}, Command{"min", 0, 2}, Command{"set", 0, 3}, Command{"set", 0, 7}, Command{"set", 0, 7}, Command{"set", 0, 2}, Command{"set", 0, 6}, Command{"set", 0, 6}, Command{"set", 0, 6}, Command{"set", 0, 7}, Command{"min", 0, 6}, Command{"min", 0, 2}, Command{"min", 0, 8}, Command{"min", 0, 8}, Command{"min", 0, 4}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-7), ip(-2), ip(-7), ip(-2), ip(-7), ip(-7), ip(-2)})
	})
	run("point replacements 3", func() {
		values := []int{5, -7, -8, 7, 1, 0, 4, 6}
		commands := []Command{Command{"min", 0, 5}, Command{"set", 0, 2}, Command{"min", 0, 0}, Command{"min", 0, 6}, Command{"set", 0, 2}, Command{"min", 0, 1}, Command{"min", 0, 1}, Command{"set", 0, 4}, Command{"set", 0, 5}, Command{"min", 0, 4}, Command{"set", 0, 7}, Command{"min", 0, 8}, Command{"set", 0, 3}, Command{"set", 0, 5}, Command{"min", 0, 6}, Command{"min", 0, 7}, Command{"min", 0, 6}, Command{"set", 0, 8}, Command{"min", 0, 4}, Command{"set", 0, 7}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-8), (*int)(nil), ip(-8), ip(2), ip(2), ip(-8), ip(-8), ip(-8), ip(-8), ip(-8), ip(-8)})
	})
	run("point replacements 4", func() {
		values := []int{1, -3, 2, 8, -1, 6, -9, 5}
		commands := []Command{Command{"set", 0, 0}, Command{"min", 0, 3}, Command{"set", 0, 2}, Command{"min", 0, 2}, Command{"set", 0, 1}, Command{"set", 0, 3}, Command{"min", 0, 5}, Command{"set", 0, 7}, Command{"set", 0, 6}, Command{"set", 0, 3}, Command{"set", 0, 4}, Command{"set", 0, 3}, Command{"min", 0, 0}, Command{"min", 0, 4}, Command{"set", 0, 4}, Command{"min", 0, 3}, Command{"set", 0, 0}, Command{"set", 0, 3}, Command{"set", 0, 3}, Command{"set", 0, 1}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-3), ip(-3), ip(-3), (*int)(nil), ip(-3), ip(-3)})
	})
	run("point replacements 5", func() {
		values := []int{-7, 8, 7, 3, 3, 0, -4, -2}
		commands := []Command{Command{"set", 0, 3}, Command{"set", 0, 0}, Command{"min", 0, 2}, Command{"set", 0, 0}, Command{"min", 0, 5}, Command{"min", 0, 5}, Command{"set", 0, 5}, Command{"set", 0, 2}, Command{"min", 0, 1}, Command{"set", 0, 5}, Command{"min", 0, 8}, Command{"set", 0, 5}, Command{"set", 0, 8}, Command{"min", 0, 3}, Command{"set", 0, 4}, Command{"min", 0, 4}, Command{"min", 0, 2}, Command{"set", 0, 0}, Command{"set", 0, 8}, Command{"min", 0, 7}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(0), ip(0), ip(0), ip(2), ip(-4), ip(7), ip(3), ip(4), ip(-4)})
	})
	run("point replacements 6", func() {
		values := []int{3, 1, -6, 7, 0, -2, 5, -7}
		commands := []Command{Command{"set", 0, 5}, Command{"set", 0, 3}, Command{"min", 0, 4}, Command{"min", 0, 5}, Command{"min", 0, 4}, Command{"min", 0, 8}, Command{"set", 0, 8}, Command{"min", 0, 8}, Command{"min", 0, 8}, Command{"min", 0, 1}, Command{"min", 0, 2}, Command{"set", 0, 1}, Command{"min", 0, 0}, Command{"min", 0, 1}, Command{"set", 0, 6}, Command{"set", 0, 6}, Command{"min", 0, 8}, Command{"min", 0, 0}, Command{"min", 0, 2}, Command{"min", 0, 7}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-6), ip(-6), ip(-6), ip(-7), ip(-7), ip(-7), ip(8), ip(1), (*int)(nil), ip(1), ip(-7), (*int)(nil), ip(1), ip(-6)})
	})
	run("point replacements 7", func() {
		values := []int{7, 8, -2, 3, -1, 3, -4, 2}
		commands := []Command{Command{"min", 0, 0}, Command{"min", 0, 8}, Command{"set", 0, 1}, Command{"min", 0, 3}, Command{"set", 0, 3}, Command{"set", 0, 1}, Command{"min", 0, 8}, Command{"min", 0, 1}, Command{"min", 0, 6}, Command{"set", 0, 1}, Command{"set", 0, 8}, Command{"set", 0, 7}, Command{"min", 0, 3}, Command{"min", 0, 3}, Command{"min", 0, 4}, Command{"set", 0, 6}, Command{"min", 0, 0}, Command{"min", 0, 1}, Command{"set", 0, 2}, Command{"set", 0, 4}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{(*int)(nil), ip(-4), ip(-2), ip(-4), ip(1), ip(-2), ip(-2), ip(-2), ip(-2), (*int)(nil), ip(6)})
	})
	run("point replacements 8", func() {
		values := []int{-7, 7, -4, -1, -8, -7, 3, 1}
		commands := []Command{Command{"set", 0, 5}, Command{"min", 0, 5}, Command{"min", 0, 4}, Command{"min", 0, 4}, Command{"set", 0, 7}, Command{"min", 0, 4}, Command{"min", 0, 4}, Command{"set", 0, 1}, Command{"min", 0, 7}, Command{"set", 0, 1}, Command{"min", 0, 6}, Command{"set", 0, 2}, Command{"min", 0, 3}, Command{"set", 0, 2}, Command{"min", 0, 1}, Command{"min", 0, 6}, Command{"min", 0, 1}, Command{"min", 0, 6}, Command{"set", 0, 7}, Command{"set", 0, 2}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-8), ip(-4), ip(-4), ip(-4), ip(-4), ip(-8), ip(-8), ip(-4), ip(2), ip(-8), ip(2), ip(-8)})
	})
	run("point replacements 9", func() {
		values := []int{0, -8, 7, -2, -6, -1, 1, -1}
		commands := []Command{Command{"min", 0, 3}, Command{"min", 0, 5}, Command{"set", 0, 1}, Command{"set", 0, 3}, Command{"set", 0, 7}, Command{"min", 0, 0}, Command{"set", 0, 1}, Command{"min", 0, 1}, Command{"min", 0, 5}, Command{"set", 0, 1}, Command{"set", 0, 8}, Command{"set", 0, 2}, Command{"min", 0, 1}, Command{"min", 0, 1}, Command{"set", 0, 0}, Command{"set", 0, 2}, Command{"min", 0, 0}, Command{"min", 0, 3}, Command{"set", 0, 4}, Command{"set", 0, 6}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-8), ip(-8), (*int)(nil), ip(1), ip(-8), ip(2), ip(2), (*int)(nil), ip(-8)})
	})
	run("point replacements 10", func() {
		values := []int{8, -3, -2, -2, 5, 5, 4, -7}
		commands := []Command{Command{"min", 0, 2}, Command{"min", 0, 3}, Command{"min", 0, 0}, Command{"set", 0, 8}, Command{"min", 0, 5}, Command{"min", 0, 6}, Command{"set", 0, 5}, Command{"set", 0, 6}, Command{"min", 0, 5}, Command{"min", 0, 3}, Command{"set", 0, 2}, Command{"min", 0, 1}, Command{"min", 0, 0}, Command{"set", 0, 0}, Command{"set", 0, 4}, Command{"set", 0, 2}, Command{"set", 0, 0}, Command{"min", 0, 1}, Command{"min", 0, 2}, Command{"set", 0, 6}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-3), ip(-3), (*int)(nil), ip(-3), ip(-3), ip(-3), ip(-3), ip(2), (*int)(nil), ip(0), ip(-3)})
	})
	run("point replacements 11", func() {
		values := []int{-3, 0, -8, -2, -6, 6, 5, -3}
		commands := []Command{Command{"min", 0, 3}, Command{"min", 0, 2}, Command{"set", 0, 6}, Command{"set", 0, 0}, Command{"min", 0, 2}, Command{"min", 0, 0}, Command{"set", 0, 7}, Command{"set", 0, 0}, Command{"min", 0, 1}, Command{"min", 0, 8}, Command{"set", 0, 8}, Command{"set", 0, 7}, Command{"min", 0, 8}, Command{"min", 0, 7}, Command{"set", 0, 8}, Command{"min", 0, 4}, Command{"set", 0, 1}, Command{"min", 0, 1}, Command{"min", 0, 7}, Command{"set", 0, 2}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []*int{ip(-8), ip(-3), ip(0), (*int)(nil), ip(0), ip(-8), ip(-8), ip(-8), ip(-8), ip(1), ip(-8)})
	})
	run("invalid input", func() {
		values := []int{1}
		commands := []Command{Command{"set", 1, 2}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		_, err := fn(values, commands)
		bad(err)
	})
	run("invalid input", func() {
		values := []int{1}
		commands := []Command{Command{"min", 0, 2}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		_, err := fn(values, commands)
		bad(err)
	})
	run("invalid input", func() {
		values := []int{1}
		commands := []Command{Command{"add", 0, 2}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		_, err := fn(values, commands)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
