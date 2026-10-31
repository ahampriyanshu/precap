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
		run("ASCII runs case punctuation and digits", func() {
			equal(Tokenize("Go, GO! api_42"), []string{"go", "go", "api", "42"})
			equal(Tokenize("café 東京 K"), []string{"caf", "k"})
			equal(Tokenize("!!!"), []string{})
		})
		run("duplicates order and fresh lists", func() {
			a := Tokenize("b a b")
			a[0] = "bad"
			equal(Tokenize("b a b"), []string{"b", "a", "b"})
			equal(Tokenize(""), []string{})
		})
	} else {
		run("lifecycle duplicates and stats", func() {
			s := NewSearchEngine()
			yes(s.Add("a", "Go go"))
			yes(s.Add("empty", "!!!"))
			no(s.Add("a", "bad"))
			equal(need(s.Get("a")), sp("Go go"))
			equal(s.Stats(), SearchStats{2, 2})
			no(s.Update("missing", "x"))
			no(s.Delete("missing"))
			equal(s.Stats(), SearchStats{2, 2})
		})
		run("term frequency ties and whole tokens", func() {
			s := NewSearchEngine()
			yes(s.Add("b", "art art cart"))
			yes(s.Add("a", "art art"))
			yes(s.Add("c", "cart"))
			equal(need(s.Search("ART!", 10)), []Hit{{"a", 2}, {"b", 2}})
			equal(need(s.Search("art", 1)), []Hit{{"a", 2}})
		})
		run("phrases order punctuation and overlaps", func() {
			s := NewSearchEngine()
			yes(s.Add("a", "go go go"))
			yes(s.Add("b", "go, now go"))
			equal(need(s.SearchPhrase("go GO", 10)), []Hit{{"a", 2}})
			equal(need(s.SearchPhrase("now go", 10)), []Hit{{"b", 1}})
			equal(need(s.SearchPhrase("go", 10)), need(s.Search("go", 10)))
		})
		run("updates clear stale postings and token counts", func() {
			s := NewSearchEngine()
			yes(s.Add("a", "red red blue"))
			yes(s.Update("a", "green"))
			equal(need(s.Search("red", 10)), []Hit{})
			equal(need(s.SearchPhrase("red blue", 10)), []Hit{})
			equal(s.Stats(), SearchStats{1, 1})
			yes(s.Delete("a"))
			equal(s.Stats(), SearchStats{})
			yes(s.Add("a", "blue"))
			equal(need(s.Search("green", 10)), []Hit{})
		})
		run("query validation even zero and empty phrases", func() {
			s := NewSearchEngine()
			invalid(s.Search("", 0))
			invalid(s.Search("two words", 0))
			invalid(s.Search("one", -1))
			invalid(s.SearchPhrase("", -1))
			equal(need(s.SearchPhrase("!!!", 10)), []Hit{})
			equal(need(s.Search("one", 0)), []Hit{})
		})
		run("snapshots IDs and independent engines", func() {
			a, b := NewSearchEngine(), NewSearchEngine()
			invalid(a.Add("", "x"))
			invalid(a.Get(""))
			invalid(a.Update("", "x"))
			invalid(a.Delete(""))
			yes(a.Add("x", "token"))
			p := need(a.Get("x"))
			*p = "bad"
			v := need(a.Search("token", 10))
			v[0].Score = 99
			equal(need(a.Search("token", 10)), []Hit{{"x", 1}})
			equal(b.Stats(), SearchStats{})
		})
	}
	finish()
}
