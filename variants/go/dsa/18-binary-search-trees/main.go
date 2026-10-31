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
	run("two-child deletion", func() {
		commands := []BSTCommand{BSTCommand{"add", 5}, BSTCommand{"add", 3}, BSTCommand{"add", 8}, BSTCommand{"add", 6}, BSTCommand{"remove", 5}, BSTCommand{"floor", 7}, BSTCommand{"contains", 5}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(6)}, BSTResult{Kind: "bool", Bool: false}})
	})
	run("duplicate and missing", func() {
		commands := []BSTCommand{BSTCommand{"add", 2}, BSTCommand{"add", 2}, BSTCommand{"remove", 9}, BSTCommand{"floor", 1}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}})
	})
	run("no commands", func() {
		commands := []BSTCommand{}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{})
	})
	run("command history 0", func() {
		commands := []BSTCommand{BSTCommand{"remove", -5}, BSTCommand{"floor", 0}, BSTCommand{"floor", 9}, BSTCommand{"contains", -2}, BSTCommand{"contains", 4}, BSTCommand{"contains", 7}, BSTCommand{"remove", -2}, BSTCommand{"contains", 2}, BSTCommand{"floor", 1}, BSTCommand{"remove", 0}, BSTCommand{"remove", 8}, BSTCommand{"contains", 9}, BSTCommand{"contains", 5}, BSTCommand{"add", -1}, BSTCommand{"floor", 9}, BSTCommand{"add", 1}, BSTCommand{"remove", -4}, BSTCommand{"floor", -2}, BSTCommand{"add", 6}, BSTCommand{"add", -4}, BSTCommand{"remove", 8}, BSTCommand{"floor", -3}, BSTCommand{"floor", 9}, BSTCommand{"add", 9}, BSTCommand{"contains", 2}, BSTCommand{"contains", -3}, BSTCommand{"add", 6}, BSTCommand{"contains", -2}, BSTCommand{"add", 7}, BSTCommand{"contains", 8}, BSTCommand{"add", 8}, BSTCommand{"floor", 6}, BSTCommand{"contains", -3}, BSTCommand{"add", 3}, BSTCommand{"contains", 7}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(-1)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "floor", Value: ip(6)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(6)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}})
	})
	run("command history 1", func() {
		commands := []BSTCommand{BSTCommand{"remove", -1}, BSTCommand{"contains", 6}, BSTCommand{"add", 0}, BSTCommand{"floor", 2}, BSTCommand{"floor", 6}, BSTCommand{"remove", 8}, BSTCommand{"add", 5}, BSTCommand{"add", 7}, BSTCommand{"floor", -2}, BSTCommand{"contains", -4}, BSTCommand{"remove", 4}, BSTCommand{"remove", 3}, BSTCommand{"remove", -5}, BSTCommand{"contains", 7}, BSTCommand{"add", -4}, BSTCommand{"contains", 0}, BSTCommand{"contains", 4}, BSTCommand{"floor", 8}, BSTCommand{"add", -3}, BSTCommand{"floor", 1}, BSTCommand{"add", 0}, BSTCommand{"add", -4}, BSTCommand{"add", -5}, BSTCommand{"add", 1}, BSTCommand{"contains", -5}, BSTCommand{"contains", -5}, BSTCommand{"add", 7}, BSTCommand{"floor", 0}, BSTCommand{"add", 5}, BSTCommand{"floor", 1}, BSTCommand{"remove", 5}, BSTCommand{"contains", -1}, BSTCommand{"add", 1}, BSTCommand{"remove", -2}, BSTCommand{"floor", 1}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(0)}, BSTResult{Kind: "floor", Value: ip(0)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(7)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(0)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(0)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(1)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(1)}})
	})
	run("command history 2", func() {
		commands := []BSTCommand{BSTCommand{"add", 7}, BSTCommand{"remove", 7}, BSTCommand{"contains", 5}, BSTCommand{"floor", 2}, BSTCommand{"contains", 7}, BSTCommand{"remove", 8}, BSTCommand{"remove", 4}, BSTCommand{"remove", 1}, BSTCommand{"add", -4}, BSTCommand{"floor", 3}, BSTCommand{"remove", -5}, BSTCommand{"floor", 5}, BSTCommand{"floor", 0}, BSTCommand{"contains", 8}, BSTCommand{"floor", -5}, BSTCommand{"remove", -3}, BSTCommand{"floor", 5}, BSTCommand{"contains", 4}, BSTCommand{"contains", -5}, BSTCommand{"contains", 3}, BSTCommand{"add", 2}, BSTCommand{"remove", -1}, BSTCommand{"add", 3}, BSTCommand{"add", 0}, BSTCommand{"add", -3}, BSTCommand{"add", 7}, BSTCommand{"contains", 7}, BSTCommand{"contains", 8}, BSTCommand{"remove", 1}, BSTCommand{"contains", 7}, BSTCommand{"floor", -4}, BSTCommand{"contains", -5}, BSTCommand{"contains", 2}, BSTCommand{"add", -1}, BSTCommand{"add", -4}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}})
	})
	run("command history 3", func() {
		commands := []BSTCommand{BSTCommand{"floor", 0}, BSTCommand{"floor", 2}, BSTCommand{"add", -1}, BSTCommand{"add", 2}, BSTCommand{"add", -4}, BSTCommand{"remove", 9}, BSTCommand{"remove", -4}, BSTCommand{"contains", 8}, BSTCommand{"add", 2}, BSTCommand{"add", 4}, BSTCommand{"contains", -1}, BSTCommand{"contains", 1}, BSTCommand{"remove", -5}, BSTCommand{"remove", -5}, BSTCommand{"remove", 4}, BSTCommand{"add", 4}, BSTCommand{"remove", -5}, BSTCommand{"contains", -2}, BSTCommand{"remove", -3}, BSTCommand{"floor", 8}, BSTCommand{"floor", -3}, BSTCommand{"floor", 0}, BSTCommand{"floor", 0}, BSTCommand{"contains", 9}, BSTCommand{"floor", 9}, BSTCommand{"contains", -2}, BSTCommand{"contains", 8}, BSTCommand{"remove", -5}, BSTCommand{"add", 0}, BSTCommand{"floor", 5}, BSTCommand{"remove", -5}, BSTCommand{"remove", 7}, BSTCommand{"contains", 1}, BSTCommand{"add", 7}, BSTCommand{"contains", 6}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "floor"}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(4)}, BSTResult{Kind: "floor"}, BSTResult{Kind: "floor", Value: ip(-1)}, BSTResult{Kind: "floor", Value: ip(-1)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}})
	})
	run("command history 4", func() {
		commands := []BSTCommand{BSTCommand{"contains", 0}, BSTCommand{"remove", -4}, BSTCommand{"contains", -4}, BSTCommand{"floor", 6}, BSTCommand{"add", 6}, BSTCommand{"floor", 6}, BSTCommand{"remove", 2}, BSTCommand{"add", 6}, BSTCommand{"add", 7}, BSTCommand{"remove", -1}, BSTCommand{"contains", 6}, BSTCommand{"contains", 9}, BSTCommand{"contains", 0}, BSTCommand{"remove", 0}, BSTCommand{"floor", 7}, BSTCommand{"remove", 4}, BSTCommand{"contains", -4}, BSTCommand{"add", 1}, BSTCommand{"remove", 9}, BSTCommand{"floor", -1}, BSTCommand{"remove", 0}, BSTCommand{"floor", 8}, BSTCommand{"add", -4}, BSTCommand{"remove", 5}, BSTCommand{"remove", 0}, BSTCommand{"add", 7}, BSTCommand{"add", 7}, BSTCommand{"contains", 7}, BSTCommand{"contains", 2}, BSTCommand{"floor", -5}, BSTCommand{"add", 0}, BSTCommand{"add", 0}, BSTCommand{"remove", 0}, BSTCommand{"contains", -2}, BSTCommand{"floor", 8}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(6)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(7)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(7)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(7)}})
	})
	run("command history 5", func() {
		commands := []BSTCommand{BSTCommand{"contains", -3}, BSTCommand{"add", 7}, BSTCommand{"remove", 5}, BSTCommand{"add", 3}, BSTCommand{"remove", 3}, BSTCommand{"remove", 5}, BSTCommand{"contains", -3}, BSTCommand{"floor", 5}, BSTCommand{"add", -4}, BSTCommand{"floor", 0}, BSTCommand{"floor", 5}, BSTCommand{"add", 7}, BSTCommand{"floor", -3}, BSTCommand{"contains", 5}, BSTCommand{"contains", 3}, BSTCommand{"add", 3}, BSTCommand{"remove", -5}, BSTCommand{"floor", 5}, BSTCommand{"floor", -1}, BSTCommand{"add", 9}, BSTCommand{"contains", 3}, BSTCommand{"contains", -1}, BSTCommand{"remove", 0}, BSTCommand{"remove", -1}, BSTCommand{"floor", 0}, BSTCommand{"add", 3}, BSTCommand{"contains", 0}, BSTCommand{"add", 9}, BSTCommand{"add", 1}, BSTCommand{"add", -5}, BSTCommand{"remove", 2}, BSTCommand{"remove", 4}, BSTCommand{"add", -4}, BSTCommand{"add", 7}, BSTCommand{"floor", 4}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(3)}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(3)}})
	})
	run("command history 6", func() {
		commands := []BSTCommand{BSTCommand{"remove", -1}, BSTCommand{"add", 4}, BSTCommand{"contains", 2}, BSTCommand{"contains", 5}, BSTCommand{"add", -1}, BSTCommand{"add", -3}, BSTCommand{"remove", 8}, BSTCommand{"add", 6}, BSTCommand{"floor", 7}, BSTCommand{"contains", 6}, BSTCommand{"add", 4}, BSTCommand{"floor", -1}, BSTCommand{"contains", 6}, BSTCommand{"add", 3}, BSTCommand{"contains", 6}, BSTCommand{"remove", 8}, BSTCommand{"contains", 4}, BSTCommand{"floor", 0}, BSTCommand{"add", -3}, BSTCommand{"floor", -2}, BSTCommand{"floor", 6}, BSTCommand{"contains", 6}, BSTCommand{"contains", 3}, BSTCommand{"contains", -1}, BSTCommand{"add", -2}, BSTCommand{"remove", 3}, BSTCommand{"add", -4}, BSTCommand{"contains", 0}, BSTCommand{"add", -1}, BSTCommand{"add", 9}, BSTCommand{"remove", -1}, BSTCommand{"floor", -5}, BSTCommand{"remove", 0}, BSTCommand{"floor", 4}, BSTCommand{"add", 5}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(6)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(-1)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(-1)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(-3)}, BSTResult{Kind: "floor", Value: ip(6)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(4)}, BSTResult{Kind: "bool", Bool: true}})
	})
	run("command history 7", func() {
		commands := []BSTCommand{BSTCommand{"add", 9}, BSTCommand{"floor", -5}, BSTCommand{"contains", 1}, BSTCommand{"contains", -1}, BSTCommand{"add", 7}, BSTCommand{"contains", -3}, BSTCommand{"add", 0}, BSTCommand{"add", 7}, BSTCommand{"contains", 0}, BSTCommand{"contains", 3}, BSTCommand{"remove", 2}, BSTCommand{"add", 1}, BSTCommand{"floor", 0}, BSTCommand{"floor", 6}, BSTCommand{"add", 6}, BSTCommand{"add", -5}, BSTCommand{"contains", 8}, BSTCommand{"add", 1}, BSTCommand{"contains", -3}, BSTCommand{"add", -4}, BSTCommand{"floor", 5}, BSTCommand{"floor", -5}, BSTCommand{"floor", 4}, BSTCommand{"remove", 2}, BSTCommand{"floor", 0}, BSTCommand{"contains", -2}, BSTCommand{"contains", 6}, BSTCommand{"add", 9}, BSTCommand{"floor", 1}, BSTCommand{"floor", 2}, BSTCommand{"remove", 6}, BSTCommand{"contains", 8}, BSTCommand{"add", -5}, BSTCommand{"remove", 4}, BSTCommand{"remove", -2}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(0)}, BSTResult{Kind: "floor", Value: ip(1)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(1)}, BSTResult{Kind: "floor", Value: ip(-5)}, BSTResult{Kind: "floor", Value: ip(1)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(0)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(1)}, BSTResult{Kind: "floor", Value: ip(1)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}})
	})
	run("command history 8", func() {
		commands := []BSTCommand{BSTCommand{"contains", 5}, BSTCommand{"contains", -5}, BSTCommand{"remove", 6}, BSTCommand{"floor", -3}, BSTCommand{"remove", -3}, BSTCommand{"contains", 4}, BSTCommand{"floor", -1}, BSTCommand{"remove", 7}, BSTCommand{"contains", 6}, BSTCommand{"contains", 9}, BSTCommand{"add", -2}, BSTCommand{"contains", 8}, BSTCommand{"remove", -5}, BSTCommand{"floor", -3}, BSTCommand{"contains", 1}, BSTCommand{"contains", -3}, BSTCommand{"add", -5}, BSTCommand{"contains", 3}, BSTCommand{"add", 9}, BSTCommand{"add", -2}, BSTCommand{"remove", 8}, BSTCommand{"remove", -2}, BSTCommand{"add", 2}, BSTCommand{"contains", 0}, BSTCommand{"floor", 4}, BSTCommand{"remove", -4}, BSTCommand{"add", -4}, BSTCommand{"contains", 0}, BSTCommand{"add", 3}, BSTCommand{"add", -2}, BSTCommand{"contains", 5}, BSTCommand{"add", 4}, BSTCommand{"add", 1}, BSTCommand{"floor", 4}, BSTCommand{"floor", 8}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(2)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(4)}, BSTResult{Kind: "floor", Value: ip(4)}})
	})
	run("command history 9", func() {
		commands := []BSTCommand{BSTCommand{"floor", -1}, BSTCommand{"add", 4}, BSTCommand{"floor", 7}, BSTCommand{"floor", 6}, BSTCommand{"floor", 6}, BSTCommand{"remove", -2}, BSTCommand{"floor", 8}, BSTCommand{"remove", 7}, BSTCommand{"add", 5}, BSTCommand{"floor", 2}, BSTCommand{"remove", 0}, BSTCommand{"contains", -4}, BSTCommand{"floor", 0}, BSTCommand{"remove", 7}, BSTCommand{"remove", -4}, BSTCommand{"remove", -5}, BSTCommand{"contains", 6}, BSTCommand{"remove", 8}, BSTCommand{"remove", 2}, BSTCommand{"contains", 1}, BSTCommand{"remove", -2}, BSTCommand{"floor", -1}, BSTCommand{"floor", 8}, BSTCommand{"contains", 5}, BSTCommand{"floor", -5}, BSTCommand{"add", 0}, BSTCommand{"remove", 1}, BSTCommand{"floor", 1}, BSTCommand{"contains", -5}, BSTCommand{"contains", 2}, BSTCommand{"remove", 4}, BSTCommand{"add", -1}, BSTCommand{"floor", -1}, BSTCommand{"remove", 9}, BSTCommand{"contains", 1}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(4)}, BSTResult{Kind: "floor", Value: ip(4)}, BSTResult{Kind: "floor", Value: ip(4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "floor", Value: ip(5)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(0)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(-1)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}})
	})
	run("command history 10", func() {
		commands := []BSTCommand{BSTCommand{"remove", 0}, BSTCommand{"add", 1}, BSTCommand{"contains", -4}, BSTCommand{"remove", 3}, BSTCommand{"contains", 3}, BSTCommand{"remove", 8}, BSTCommand{"contains", 1}, BSTCommand{"remove", 3}, BSTCommand{"floor", -2}, BSTCommand{"add", 3}, BSTCommand{"floor", -2}, BSTCommand{"contains", -5}, BSTCommand{"add", -5}, BSTCommand{"add", -4}, BSTCommand{"contains", -3}, BSTCommand{"floor", -3}, BSTCommand{"remove", -4}, BSTCommand{"contains", -2}, BSTCommand{"remove", 8}, BSTCommand{"remove", 3}, BSTCommand{"add", 3}, BSTCommand{"add", 8}, BSTCommand{"add", 0}, BSTCommand{"contains", 6}, BSTCommand{"contains", 0}, BSTCommand{"floor", 5}, BSTCommand{"contains", -5}, BSTCommand{"floor", -5}, BSTCommand{"contains", 4}, BSTCommand{"floor", 9}, BSTCommand{"add", 7}, BSTCommand{"floor", 2}, BSTCommand{"contains", 2}, BSTCommand{"contains", -5}, BSTCommand{"add", -1}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(3)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(-5)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(8)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(1)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}})
	})
	run("command history 11", func() {
		commands := []BSTCommand{BSTCommand{"floor", -2}, BSTCommand{"floor", 1}, BSTCommand{"floor", 1}, BSTCommand{"add", 5}, BSTCommand{"contains", 9}, BSTCommand{"floor", -5}, BSTCommand{"floor", 4}, BSTCommand{"floor", -3}, BSTCommand{"contains", -5}, BSTCommand{"floor", 1}, BSTCommand{"remove", 6}, BSTCommand{"remove", 6}, BSTCommand{"add", 4}, BSTCommand{"remove", 2}, BSTCommand{"floor", -3}, BSTCommand{"floor", 2}, BSTCommand{"add", -4}, BSTCommand{"add", 7}, BSTCommand{"add", 2}, BSTCommand{"remove", 6}, BSTCommand{"add", 1}, BSTCommand{"remove", 3}, BSTCommand{"contains", 3}, BSTCommand{"floor", 7}, BSTCommand{"remove", 7}, BSTCommand{"contains", 8}, BSTCommand{"remove", 4}, BSTCommand{"floor", 2}, BSTCommand{"floor", 0}, BSTCommand{"contains", 1}, BSTCommand{"remove", -3}, BSTCommand{"add", -3}, BSTCommand{"floor", -4}, BSTCommand{"remove", 4}, BSTCommand{"remove", -1}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		got, err := fn(commands)
		must(err)
		equal(got, []BSTResult{BSTResult{Kind: "floor"}, BSTResult{Kind: "floor"}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "floor"}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor"}, BSTResult{Kind: "floor"}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "floor", Value: ip(7)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(2)}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: true}, BSTResult{Kind: "floor", Value: ip(-4)}, BSTResult{Kind: "bool", Bool: false}, BSTResult{Kind: "bool", Bool: false}})
	})
	run("invalid input", func() {
		commands := []BSTCommand{BSTCommand{"unknown", 1}}
		before_commands := snap(commands)
		defer func() { equal(snap(commands), before_commands) }()
		_, err := fn(commands)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
