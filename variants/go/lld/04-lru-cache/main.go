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
		run("move existing and append missing", func() {
			a := []string{"a", "b", "c"}
			equal(TouchOrder(a, "b"), []string{"a", "c", "b"})
			equal(a, []string{"a", "b", "c"})
			equal(TouchOrder(a, "d"), []string{"a", "b", "c", "d"})
		})
		run("empty and repeated touch", func() {
			equal(TouchOrder(nil, "a"), []string{"a"})
			a := TouchOrder([]string{"a"}, "a")
			a[0] = "x"
			equal(TouchOrder([]string{"a"}, "a"), []string{"a"})
		})
	} else {
		run("refresh before eviction", func() {
			c := need(NewLRUCache(2))
			must(c.Put("a", 0))
			must(c.Put("b", 2))
			equal(need(c.Get("a", nil)), ip(0))
			must(c.Put("c", 3))
			equal(c.Items(), []CacheItem{{"a", 0}, {"c", 3}})
			equal(need(c.Get("b", nil)), (*int)(nil))
		})
		run("update no duplicate and miss preserves order", func() {
			c := need(NewLRUCache(2))
			must(c.Put("a", 1))
			must(c.Put("b", 2))
			must(c.Put("a", -8))
			d := ip(9)
			ok(need(c.Get("missing", d)) == d)
			equal(c.Items(), []CacheItem{{"b", 2}, {"a", -8}})
		})
		run("zero capacity and one capacity", func() {
			z := need(NewLRUCache(0))
			must(z.Put("x", 1))
			equal(z.Items(), []CacheItem{})
			c := need(NewLRUCache(1))
			for i := 0; i < 30; i++ {
				must(c.Put("x", i))
				equal(len(c.Items()), 1)
			}
			must(c.Put("y", 0))
			equal(c.Items(), []CacheItem{{"y", 0}})
		})
		run("delete idempotent order", func() {
			c := need(NewLRUCache(3))
			for _, k := range []string{"a", "b", "c"} {
				must(c.Put(k, 1))
			}
			yes(c.Delete("b"))
			no(c.Delete("b"))
			equal(c.Items(), []CacheItem{{"a", 1}, {"c", 1}})
		})
		run("invalid keys preserve order", func() {
			invalid(NewLRUCache(-1))
			c := need(NewLRUCache(2))
			must(c.Put("a", 1))
			before := snap(c.Items())
			bad(c.Put("", 2))
			invalid(c.Get("", nil))
			invalid(c.Delete(""))
			equal(snap(c.Items()), before)
		})
		run("detached values snapshots and independent instances", func() {
			a := need(NewLRUCache(1))
			b := need(NewLRUCache(1))
			must(a.Put("x", 3))
			p := need(a.Get("x", nil))
			*p = 99
			s := a.Items()
			s[0].Value = 88
			equal(a.Items(), []CacheItem{{"x", 3}})
			equal(b.Items(), []CacheItem{})
		})
	}
	finish()
}
