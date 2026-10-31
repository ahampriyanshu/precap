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

func need[T any](v T, e error) T  { must(e); return v }
func yes(v bool, e error)         { must(e); ok(v) }
func no(v bool, e error)          { must(e); ok(!v) }
func invalid[T any](v T, e error) { bad(e) }
func sp(s string) *string         { return &s }

func main() {
	stage := stageFlag()
	_ = stage
	if stage == "prototype" {
		run("ASCII and empty", func() { equal(need(Prototype("a1!")), TextStats{3, 3, 1, 1}); equal(need(Prototype("")), TextStats{}) })
		run("multibyte Unicode categories", func() { equal(need(Prototype("é١🙂")), TextStats{8, 3, 1, 1}) })
		run("invalid bytes rejected", func() { invalid(Prototype(string([]byte{0xff}))) })
	} else {
		run("byte and rune units", func() { equal(need(Solve("é١🙂")), TextStats{8, 3, 1, 1}) })
		run("combining and precomposed remain distinct", func() {
			equal(need(Solve("é")), TextStats{3, 2, 1, 0})
			equal(need(Solve("é")), TextStats{2, 1, 1, 0})
		})
		run("literal replacement rune valid", func() { equal(need(Solve("�")), TextStats{3, 1, 0, 0}); invalid(Solve(string([]byte{0xef, 0xbf}))) })
		run("NUL and whitespace are valid nonletters", func() {
			equal(need(Solve(string([]byte{0, 32, 10}))), TextStats{3, 3, 0, 0})
			equal(need(Solve("")), TextStats{})
		})
		run("malformed continuation and surrogate encoding", func() { invalid(Solve(string([]byte{0xc3, 0x28}))); invalid(Solve(string([]byte{0xed, 0xa0, 0x80}))) })
	}
	finish()
}
