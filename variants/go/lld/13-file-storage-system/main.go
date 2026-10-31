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
		run("unique uploads zero bytes and missing", func() {
			c := NewFileCatalog()
			yes(c.Upload("x", 0))
			no(c.Upload("x", 9))
			equal(c.Get("x"), ip(0))
			equal(c.Get("missing"), (*int)(nil))
		})
		run("metadata validation and detached instance state", func() {
			a, b := NewFileCatalog(), NewFileCatalog()
			invalid(a.Upload("", 1))
			invalid(a.Upload("x", -1))
			yes(a.Upload("X", 2))
			p := a.Get("X")
			*p = 99
			equal(a.Get("X"), ip(2))
			equal(a.Get("x"), (*int)(nil))
			equal(b.Get("X"), (*int)(nil))
		})
	} else {
		run("quota boundary duplicates and failure preservation", func() {
			s := need(NewFileStorage(5))
			yes(s.Upload("a", 5, nil))
			no(s.Upload("b", 1, nil))
			no(s.Upload("a", 0, nil))
			equal(s.Usage(), 5)
			equal(s.Get("a").Size, 5)
			ok(s.Delete("a"))
			ok(!s.Delete("a"))
			equal(s.Usage(), 0)
			yes(s.Upload("b", 5, nil))
		})
		run("expiry exact boundary quota and name reuse", func() {
			s := need(NewFileStorage(5))
			yes(s.Upload("a", 5, ip(3)))
			must(s.AdvanceTo(2))
			equal(s.Get("a").ExpiresAt, ip(3))
			must(s.AdvanceTo(3))
			equal(s.Get("a"), (*File)(nil))
			equal(s.Usage(), 0)
			must(s.AdvanceTo(3))
			yes(s.Upload("a", 5, nil))
		})
		run("copy preserves absolute expiry and charges twice", func() {
			s := need(NewFileStorage(10))
			yes(s.Upload("a", 4, ip(5)))
			must(s.AdvanceTo(3))
			yes(s.Copy("a", "b"))
			equal(s.Get("b"), &File{"b", 4, ip(5)})
			equal(s.Usage(), 8)
			must(s.AdvanceTo(5))
			equal(s.Usage(), 0)
			no(s.Copy("a", "c"))
		})
		run("failed copy conditions atomic and validation first", func() {
			s := need(NewFileStorage(4))
			yes(s.Upload("a", 3, nil))
			no(s.Copy("a", "b"))
			no(s.Copy("a", "a"))
			no(s.Copy("missing", "b"))
			invalid(s.Copy("missing", ""))
			equal(s.Usage(), 3)
		})
		run("search numeric ties prefix case and limits", func() {
			s := need(NewFileStorage(20))
			yes(s.Upload("a2", 3, nil))
			yes(s.Upload("a1", 3, nil))
			yes(s.Upload("A", 5, nil))
			equal(need(s.Search("a", 10)), []File{{"a1", 3, nil}, {"a2", 3, nil}})
			equal(need(s.Search("", 1)), []File{{"A", 5, nil}})
			equal(need(s.Search("", 0)), []File{})
			invalid(s.Search("", -1))
		})
		run("invalid metadata and clock preserve expiry", func() {
			invalid(NewFileStorage(-1))
			s := need(NewFileStorage(10))
			yes(s.Upload("a", 2, ip(4)))
			must(s.AdvanceTo(1))
			invalid(s.Upload("a", 2, ip(0)))
			invalid(s.Upload("", 0, nil))
			invalid(s.Upload("x", -1, nil))
			bad(s.AdvanceTo(0))
			bad(s.AdvanceTo(-1))
			equal(s.Get("a").ExpiresAt, ip(4))
			equal(s.Usage(), 2)
		})
		run("zero quota detached expiry input and snapshots", func() {
			s := need(NewFileStorage(0))
			ttl := ip(3)
			yes(s.Upload("zero", 0, ttl))
			*ttl = 99
			p := s.Get("zero")
			*p.ExpiresAt = 0
			v := need(s.Search("", 10))
			*v[0].ExpiresAt = 0
			equal(s.Get("zero").ExpiresAt, ip(3))
			equal(need(NewFileStorage(0)).Get("zero"), (*File)(nil))
			must(s.AdvanceTo(3))
			equal(s.Get("zero"), (*File)(nil))
		})
	}
	finish()
}
