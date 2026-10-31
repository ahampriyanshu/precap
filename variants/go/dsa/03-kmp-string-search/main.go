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
	run("overlapping matches", func() {
		text := "ababa"
		pattern := "aba"
		equal(fn(text, pattern), []int{0, 2})
	})
	run("repeated prefix", func() {
		text := "aaaaa"
		pattern := "aa"
		equal(fn(text, pattern), []int{0, 1, 2, 3})
	})
	run("all boundaries", func() {
		text := "abc"
		pattern := ""
		equal(fn(text, pattern), []int{0, 1, 2, 3})
	})
	run("empty text", func() {
		text := ""
		pattern := "x"
		equal(fn(text, pattern), []int{})
	})
	run("unicode indices", func() {
		text := "ééé"
		pattern := "éé"
		equal(fn(text, pattern), []int{0, 1})
	})
	run("generated transcript 0", func() {
		text := "aaaab"
		pattern := "bab"
		equal(fn(text, pattern), []int{})
	})
	run("generated transcript 1", func() {
		text := "abaaab"
		pattern := "abb"
		equal(fn(text, pattern), []int{})
	})
	run("generated transcript 2", func() {
		text := "babaaaa"
		pattern := "aab"
		equal(fn(text, pattern), []int{})
	})
	run("generated transcript 3", func() {
		text := "bbbaabab"
		pattern := "bba"
		equal(fn(text, pattern), []int{1})
	})
	run("generated transcript 4", func() {
		text := "bbbbbabba"
		pattern := "aab"
		equal(fn(text, pattern), []int{})
	})
	run("generated transcript 5", func() {
		text := "bbaaabbaab"
		pattern := "baa"
		equal(fn(text, pattern), []int{1, 6})
	})
	run("generated transcript 6", func() {
		text := "aaababaabbb"
		pattern := "abb"
		equal(fn(text, pattern), []int{7})
	})
	run("generated transcript 7", func() {
		text := "abaabaabbbab"
		pattern := "bba"
		equal(fn(text, pattern), []int{8})
	})
	run("generated transcript 8", func() {
		text := "babaaabbbbaba"
		pattern := "bba"
		equal(fn(text, pattern), []int{8})
	})
	run("generated transcript 9", func() {
		text := "bbaabbaaaabbbb"
		pattern := "aaa"
		equal(fn(text, pattern), []int{6, 7})
	})
	run("generated transcript 10", func() {
		text := "bbbaaabbaabaaab"
		pattern := "aaa"
		equal(fn(text, pattern), []int{3, 11})
	})
	run("generated transcript 11", func() {
		text := "baabaaabaabaaabb"
		pattern := "bba"
		equal(fn(text, pattern), []int{})
	})
	run("generated transcript 12", func() {
		text := "abbabbababbaababa"
		pattern := "bbb"
		equal(fn(text, pattern), []int{})
	})
	run("generated transcript 13", func() {
		text := "baabbbbbaaabaaaaab"
		pattern := "aaa"
		equal(fn(text, pattern), []int{8, 12, 13, 14})
	})
	run("generated transcript 14", func() {
		text := "bbbabbbbaaaabbaabaa"
		pattern := "abb"
		equal(fn(text, pattern), []int{3, 11})
	})
	run("generated transcript 15", func() {
		text := "bbabbbabaaaababaabba"
		pattern := "aaa"
		equal(fn(text, pattern), []int{8, 9})
	})
	run("generated transcript 16", func() {
		text := "ababaaabbbbbbaaabbbbb"
		pattern := "aaa"
		equal(fn(text, pattern), []int{4, 13})
	})
	run("generated transcript 17", func() {
		text := "abbbabbbbaabbaababbbab"
		pattern := "abb"
		equal(fn(text, pattern), []int{0, 4, 10, 16})
	})
	if stage == "final" {
		run("long repeated prefix", func() {
			text := "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"
			pattern := "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"
			equal(fn(text, pattern), []int{260})
		})
	}

	finish()
}
