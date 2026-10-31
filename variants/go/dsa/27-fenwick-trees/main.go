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
	run("correction invalidates prefix", func() {
		values := []int{2, 4, 6}
		commands := []Command{Command{"sum", 0, 3}, Command{"add", 0, -5}, Command{"sum", 0, 2}, Command{"sum", 2, 2}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{12, 1, 0})
	})
	run("empty values", func() {
		values := []int{}
		commands := []Command{Command{"sum", 0, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{0})
	})
	run("point additions 0", func() {
		values := []int{3, 3, 7, 0, 0, 2, 8, 4}
		commands := []Command{Command{"sum", 0, 3}, Command{"sum", 0, 4}, Command{"sum", 0, 1}, Command{"sum", 0, 7}, Command{"add", 0, 7}, Command{"add", 0, 6}, Command{"sum", 0, 6}, Command{"add", 0, 3}, Command{"add", 0, 8}, Command{"sum", 0, 3}, Command{"sum", 0, 1}, Command{"sum", 0, 6}, Command{"add", 0, 5}, Command{"sum", 0, 6}, Command{"sum", 0, 7}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{13, 13, 3, 23, 28, 37, 27, 39, 44, 52})
	})
	run("point additions 1", func() {
		values := []int{0, 9, 2, 4, 1, 8, 3, 6}
		commands := []Command{Command{"sum", 0, 4}, Command{"add", 0, 0}, Command{"add", 0, 6}, Command{"add", 0, 4}, Command{"add", 0, 7}, Command{"add", 0, 6}, Command{"add", 0, 4}, Command{"sum", 0, 8}, Command{"add", 0, 1}, Command{"sum", 0, 7}, Command{"add", 0, 1}, Command{"add", 0, 6}, Command{"sum", 0, 4}, Command{"add", 0, 8}, Command{"add", 0, 8}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{15, 60, 55, 50})
	})
	run("point additions 2", func() {
		values := []int{1, 5, 8, 7, 6, 6, 7, 9}
		commands := []Command{Command{"sum", 0, 7}, Command{"add", 0, 3}, Command{"sum", 0, 4}, Command{"sum", 0, 2}, Command{"add", 0, 8}, Command{"sum", 0, 4}, Command{"add", 0, 8}, Command{"add", 0, 2}, Command{"add", 0, 0}, Command{"add", 0, 4}, Command{"add", 0, 8}, Command{"add", 0, 2}, Command{"sum", 0, 7}, Command{"add", 0, 4}, Command{"add", 0, 6}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{40, 24, 9, 32, 75})
	})
	run("point additions 3", func() {
		values := []int{6, 0, 5, 1, 6, 6, 3, 2}
		commands := []Command{Command{"sum", 0, 3}, Command{"sum", 0, 4}, Command{"add", 0, 8}, Command{"sum", 0, 8}, Command{"sum", 0, 2}, Command{"add", 0, 0}, Command{"add", 0, 8}, Command{"sum", 0, 7}, Command{"sum", 0, 8}, Command{"sum", 0, 0}, Command{"sum", 0, 8}, Command{"sum", 0, 6}, Command{"add", 0, 1}, Command{"sum", 0, 5}, Command{"sum", 0, 4}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{11, 12, 37, 14, 43, 45, 0, 45, 40, 35, 29})
	})
	run("point additions 4", func() {
		values := []int{5, 6, 0, 6, 3, 5, 9, 2}
		commands := []Command{Command{"sum", 0, 8}, Command{"add", 0, 4}, Command{"sum", 0, 1}, Command{"add", 0, 6}, Command{"add", 0, 0}, Command{"sum", 0, 8}, Command{"sum", 0, 6}, Command{"sum", 0, 3}, Command{"sum", 0, 1}, Command{"add", 0, 0}, Command{"sum", 0, 0}, Command{"add", 0, 1}, Command{"add", 0, 3}, Command{"sum", 0, 8}, Command{"add", 0, 4}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{36, 9, 46, 35, 21, 15, 0, 50})
	})
	run("point additions 5", func() {
		values := []int{1, 6, 4, 3, 7, 9, 6, 0}
		commands := []Command{Command{"add", 0, 0}, Command{"add", 0, 8}, Command{"sum", 0, 8}, Command{"sum", 0, 6}, Command{"add", 0, 6}, Command{"sum", 0, 2}, Command{"sum", 0, 6}, Command{"add", 0, 7}, Command{"sum", 0, 5}, Command{"add", 0, 6}, Command{"sum", 0, 7}, Command{"add", 0, 0}, Command{"add", 0, 0}, Command{"sum", 0, 6}, Command{"sum", 0, 6}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{44, 38, 21, 44, 42, 63, 57, 57})
	})
	run("point additions 6", func() {
		values := []int{1, 0, 9, 2, 9, 0, 1, 7}
		commands := []Command{Command{"sum", 0, 6}, Command{"sum", 0, 5}, Command{"sum", 0, 3}, Command{"add", 0, 6}, Command{"add", 0, 7}, Command{"sum", 0, 6}, Command{"add", 0, 4}, Command{"add", 0, 0}, Command{"sum", 0, 6}, Command{"add", 0, 7}, Command{"add", 0, 4}, Command{"sum", 0, 8}, Command{"sum", 0, 5}, Command{"add", 0, 0}, Command{"sum", 0, 8}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{21, 21, 10, 34, 38, 57, 49, 57})
	})
	run("point additions 7", func() {
		values := []int{6, 1, 1, 2, 7, 0, 0, 9}
		commands := []Command{Command{"sum", 0, 2}, Command{"add", 0, 7}, Command{"sum", 0, 0}, Command{"sum", 0, 5}, Command{"add", 0, 7}, Command{"add", 0, 7}, Command{"sum", 0, 8}, Command{"add", 0, 6}, Command{"add", 0, 8}, Command{"sum", 0, 8}, Command{"add", 0, 8}, Command{"add", 0, 2}, Command{"add", 0, 4}, Command{"add", 0, 8}, Command{"add", 0, 2}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{7, 0, 24, 47, 61})
	})
	run("point additions 8", func() {
		values := []int{3, 3, 0, 3, 5, 1, 5, 1}
		commands := []Command{Command{"add", 0, 4}, Command{"add", 0, 5}, Command{"add", 0, 6}, Command{"add", 0, 4}, Command{"sum", 0, 1}, Command{"add", 0, 5}, Command{"sum", 0, 1}, Command{"sum", 0, 4}, Command{"sum", 0, 3}, Command{"add", 0, 7}, Command{"sum", 0, 5}, Command{"sum", 0, 2}, Command{"add", 0, 4}, Command{"add", 0, 1}, Command{"sum", 0, 1}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{22, 27, 33, 30, 45, 37, 39})
	})
	run("point additions 9", func() {
		values := []int{3, 2, 3, 1, 2, 3, 3, 6}
		commands := []Command{Command{"sum", 0, 6}, Command{"sum", 0, 7}, Command{"sum", 0, 7}, Command{"sum", 0, 1}, Command{"sum", 0, 0}, Command{"sum", 0, 8}, Command{"sum", 0, 8}, Command{"sum", 0, 6}, Command{"sum", 0, 3}, Command{"add", 0, 8}, Command{"sum", 0, 8}, Command{"sum", 0, 1}, Command{"add", 0, 7}, Command{"add", 0, 8}, Command{"add", 0, 8}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{14, 17, 17, 3, 0, 23, 23, 14, 8, 31, 11})
	})
	run("point additions 10", func() {
		values := []int{6, 0, 6, 3, 2, 9, 2, 8}
		commands := []Command{Command{"add", 0, 2}, Command{"add", 0, 5}, Command{"add", 0, 2}, Command{"sum", 0, 5}, Command{"sum", 0, 6}, Command{"add", 0, 7}, Command{"sum", 0, 5}, Command{"add", 0, 4}, Command{"sum", 0, 6}, Command{"add", 0, 8}, Command{"sum", 0, 7}, Command{"sum", 0, 2}, Command{"sum", 0, 5}, Command{"sum", 0, 2}, Command{"add", 0, 4}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{26, 35, 33, 46, 56, 34, 45, 34})
	})
	run("point additions 11", func() {
		values := []int{1, 8, 3, 3, 8, 7, 2, 8}
		commands := []Command{Command{"add", 0, 5}, Command{"sum", 0, 2}, Command{"add", 0, 5}, Command{"add", 0, 1}, Command{"add", 0, 1}, Command{"add", 0, 3}, Command{"sum", 0, 3}, Command{"sum", 0, 8}, Command{"sum", 0, 7}, Command{"sum", 0, 1}, Command{"sum", 0, 1}, Command{"add", 0, 5}, Command{"add", 0, 0}, Command{"add", 0, 1}, Command{"sum", 0, 8}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(values, commands)
		must(err)
		equal(got, []int{14, 27, 55, 47, 16, 16, 61})
	})
	run("invalid input", func() {
		values := []int{}
		commands := []Command{Command{"add", 0, 1}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		_, err := fn(values, commands)
		bad(err)
	})
	run("invalid input", func() {
		values := []int{1}
		commands := []Command{Command{"sum", 1, 0}}
		before_values := snap(values)
		defer func() { equal(snap(values), before_values) }()
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		_, err := fn(values, commands)
		bad(err)
	})
	run("invalid input", func() {
		values := []int{1}
		commands := []Command{Command{"set", 0, 1}}
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
