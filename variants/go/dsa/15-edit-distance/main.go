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
	run("three different edits", func() {
		left := "kitten"
		right := "sitting"
		equal(fn(left, right), 3)
	})
	run("no transposition shortcut", func() {
		left := "ab"
		right := "ba"
		equal(fn(left, right), 2)
	})
	run("empty boundary", func() {
		left := ""
		right := "abc"
		equal(fn(left, right), 3)
	})
	run("no normalization", func() {
		left := "é"
		right := "e"
		equal(fn(left, right), 1)
	})
	run("string pair 0", func() {
		left := ""
		right := "abacca"
		equal(fn(left, right), 6)
	})
	run("string pair 1", func() {
		left := "c"
		right := "bcabbb"
		equal(fn(left, right), 5)
	})
	run("string pair 2", func() {
		left := "ac"
		right := "bcabca"
		equal(fn(left, right), 4)
	})
	run("string pair 3", func() {
		left := "aca"
		right := "cbbcab"
		equal(fn(left, right), 4)
	})
	run("string pair 4", func() {
		left := "babb"
		right := "cbaaba"
		equal(fn(left, right), 3)
	})
	run("string pair 5", func() {
		left := "baccc"
		right := "abcbcb"
		equal(fn(left, right), 4)
	})
	run("string pair 6", func() {
		left := "baccbc"
		right := "baabba"
		equal(fn(left, right), 3)
	})
	run("string pair 7", func() {
		left := "aabbcba"
		right := "cbaaaa"
		equal(fn(left, right), 5)
	})
	run("string pair 8", func() {
		left := "bbbbabba"
		right := "bcaccc"
		equal(fn(left, right), 6)
	})
	run("string pair 9", func() {
		left := "acaabbbbb"
		right := "ababbc"
		equal(fn(left, right), 5)
	})
	run("string pair 10", func() {
		left := "ccbbcccbbc"
		right := "bccaca"
		equal(fn(left, right), 7)
	})
	run("string pair 11", func() {
		left := "aababcabbcc"
		right := "bccbcc"
		equal(fn(left, right), 6)
	})
	run("string pair 12", func() {
		left := "cababbaabccc"
		right := "bbaaba"
		equal(fn(left, right), 7)
	})
	if stage == "final" {
	}

	finish()
}
