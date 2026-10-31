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
	run("terminal and duplicate", func() {
		words := []string{"cold", "colder", "coal", "cold"}
		prefix := "co"
		limit := 3
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{"coal", "cold", "colder"})
	})
	run("empty word and case", func() {
		words := []string{"", "A", "a"}
		prefix := ""
		limit := 9
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{"", "A", "a"})
	})
	run("empty word list", func() {
		words := []string{}
		prefix := "x"
		limit := 2
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{})
	})
	run("zero limit", func() {
		words := []string{"a"}
		prefix := "a"
		limit := 0
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{})
	})
	run("prefix='' limit=1", func() {
		words := []string{"caa", "a", "cabb", "ac", "ccb", "bbb", "cb", "baab", "c", "c", "", "", "bcba", "bbaa", "aa", "a", "ab", "cab", "a", "ccc"}
		prefix := ""
		limit := 1
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{""})
	})
	run("prefix='' limit=3", func() {
		words := []string{"aab", "aaa", "a", "bca", "ccac", "c", "c", "", "caaa", "", "acb", "", "bcaa", "cb", "aa", "a", "cca", "", "", "cbab"}
		prefix := ""
		limit := 3
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{"", "a", "aa"})
	})
	run("prefix='' limit=8", func() {
		words := []string{"bb", "", "b", "ccb", "c", "aa", "cac", "", "", "bc", "a", "c", "a", "a", "bbb", "ccca", "ac", "c", "bcc", "bc"}
		prefix := ""
		limit := 8
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{"", "a", "aa", "ac", "b", "bb", "bbb", "bc"})
	})
	run("prefix='a' limit=1", func() {
		words := []string{"", "", "bcba", "aa", "", "b", "", "acbc", "bcb", "", "", "b", "bbbb", "aaa", "", "a", "bb", "b", "aac", "bcb"}
		prefix := "a"
		limit := 1
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{"a"})
	})
	run("prefix='a' limit=3", func() {
		words := []string{"bbaa", "cba", "", "", "aca", "", "b", "ca", "c", "a", "a", "c", "ca", "acac", "b", "bcb", "abc", "acba", "bba", "bb"}
		prefix := "a"
		limit := 3
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{"a", "abc", "aca"})
	})
	run("prefix='a' limit=8", func() {
		words := []string{"aa", "cc", "bc", "abb", "c", "", "", "", "c", "bcaa", "c", "bb", "cbc", "ba", "baba", "aba", "ac", "", "cba", "c"}
		prefix := "a"
		limit := 8
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{"aa", "aba", "abb", "ac"})
	})
	run("prefix='ab' limit=1", func() {
		words := []string{"a", "bab", "cac", "baa", "a", "c", "", "bac", "", "ccb", "bccb", "ac", "cb", "bbab", "c", "bb", "", "", "accb", "ab"}
		prefix := "ab"
		limit := 1
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{"ab"})
	})
	run("prefix='ab' limit=3", func() {
		words := []string{"cbaa", "", "ba", "ccc", "bc", "aacb", "cbb", "ac", "baba", "a", "cacb", "ccc", "aca", "b", "", "a", "c", "bbc", "baba", ""}
		prefix := "ab"
		limit := 3
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{})
	})
	run("prefix='ab' limit=8", func() {
		words := []string{"b", "a", "ca", "ba", "cbc", "acaa", "b", "cc", "bbca", "b", "", "baa", "a", "", "c", "", "c", "c", "bab", "c"}
		prefix := "ab"
		limit := 8
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{})
	})
	run("prefix='z' limit=1", func() {
		words := []string{"a", "ccb", "cbb", "cb", "a", "", "bb", "cc", "", "cca", "cbbb", "", "acba", "cab", "", "", "", "cc", "bac", "ba"}
		prefix := "z"
		limit := 1
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{})
	})
	run("prefix='z' limit=3", func() {
		words := []string{"", "bcc", "", "c", "ac", "ac", "aab", "cba", "bbcc", "b", "abac", "ba", "bba", "abcc", "c", "ac", "", "a", "bbcc", "cbb"}
		prefix := "z"
		limit := 3
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{})
	})
	run("prefix='z' limit=8", func() {
		words := []string{"cab", "c", "a", "ab", "c", "", "", "aabb", "c", "aa", "a", "cac", "cba", "", "", "cb", "ac", "ac", "", ""}
		prefix := "z"
		limit := 8
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		got, err := fn(words, prefix, limit)
		must(err)
		equal(got, []string{})
	})
	run("invalid input", func() {
		words := []string{"a"}
		prefix := ""
		limit := -1
		before_words := snap(words)
		defer func() { equal(snap(words), before_words) }()
		_, err := fn(words, prefix, limit)
		bad(err)
	})
	if stage == "final" {
	}

	finish()
}
