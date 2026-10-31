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
		run("CRUD overwrite empty and deletion", func() {
			s := NewKeyValueStore()
			equal(s.Get("x"), (*string)(nil))
			s.Set("", "")
			equal(s.Get(""), sp(""))
			s.Set("x", "a")
			s.Set("x", "b")
			equal(s.Get("x"), sp("b"))
			ok(s.Delete("x"))
			ok(!s.Delete("x"))
			s.Set("x", "c")
			equal(s.Get("x"), sp("c"))
		})
		run("detached values and instances", func() {
			a, b := NewKeyValueStore(), NewKeyValueStore()
			a.Set("x", "v")
			p := a.Get("x")
			*p = "bad"
			equal(a.Get("x"), sp("v"))
			equal(b.Get("x"), (*string)(nil))
		})
	} else {
		run("base CRUD and invalid boundaries", func() {
			s := NewTransactionalStore()
			s.Set("", "")
			equal(s.Get(""), sp(""))
			invalid(s.Commit())
			invalid(s.Rollback())
			equal(s.Depth(), 0)
			equal(s.Get(""), sp(""))
			ok(s.Delete(""))
			ok(!s.Delete(""))
		})
		run("rollback restores writes and deletions", func() {
			s := NewTransactionalStore()
			s.Set("x", "base")
			s.Set("keep", "v")
			equal(s.Begin(), 1)
			s.Set("x", "new")
			ok(s.Delete("keep"))
			s.Set("new", "v")
			equal(need(s.Rollback()), 0)
			equal(s.Snapshot(""), map[string]string{"x": "base", "keep": "v"})
		})
		run("inner commit undone by outer rollback", func() {
			s := NewTransactionalStore()
			s.Set("x", "base")
			s.Begin()
			s.Set("x", "outer")
			s.Begin()
			s.Set("x", "inner")
			equal(need(s.Commit()), 1)
			equal(s.Get("x"), sp("inner"))
			equal(need(s.Rollback()), 0)
			equal(s.Get("x"), sp("base"))
		})
		run("inner rollback leaves outer edits and commit persists", func() {
			s := NewTransactionalStore()
			s.Begin()
			s.Set("a", "outer")
			s.Begin()
			s.Delete("a")
			equal(s.Get("a"), (*string)(nil))
			s.Set("a", "inner")
			need(s.Rollback())
			equal(s.Get("a"), sp("outer"))
			need(s.Commit())
			equal(s.Get("a"), sp("outer"))
		})
		run("three frames close one at a time", func() {
			s := NewTransactionalStore()
			for i := 1; i <= 3; i++ {
				equal(s.Begin(), i)
			}
			s.Set("x", "v")
			equal(need(s.Commit()), 2)
			equal(need(s.Rollback()), 1)
			equal(s.Get("x"), (*string)(nil))
			equal(s.Depth(), 1)
		})
		run("prefix snapshots and instances detached", func() {
			s, b := NewTransactionalStore(), NewTransactionalStore()
			s.Set("Ab", "1")
			s.Set("Aa", "2")
			s.Set("ab", "3")
			v := s.Snapshot("A")
			equal(v, map[string]string{"Ab": "1", "Aa": "2"})
			v["Aa"] = "bad"
			equal(s.Get("Aa"), sp("2"))
			equal(b.Snapshot(""), map[string]string{})
		})
	}
	finish()
}
