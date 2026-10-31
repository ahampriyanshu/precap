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
		run("accept deny and exact boundary", func() {
			equal(need(AllowRequest([]int{1, 2}, 2, 5, 3)), Decision{false, []int{1, 2}})
			equal(need(AllowRequest([]int{1, 2}, 2, 5, 6)), Decision{true, []int{2, 6}})
		})
		run("overfull and input ownership", func() {
			a := []int{4, 4, 4}
			equal(need(AllowRequest(a, 1, 10, 5)), Decision{false, []int{4, 4, 4}})
			equal(a, []int{4, 4, 4})
		})
		run("invalid histories and settings", func() {
			for _, h := range [][]int{{-1}, {2, 1}, {8}} {
				invalid(AllowRequest(h, 2, 3, 5))
			}
			invalid(AllowRequest(nil, 0, 1, 0))
			invalid(AllowRequest(nil, 1, 0, 0))
			invalid(AllowRequest(nil, 1, 1, -1))
		})
	} else {
		run("acceptance expiration and denial budgets", func() {
			l := need(NewSlidingWindowLimiter(2, 5))
			yes(l.Allow("a", 1))
			yes(l.Allow("a", 2))
			no(l.Allow("a", 3))
			no(l.Allow("a", 5))
			yes(l.Allow("a", 6))
			equal(need(l.History("a")), []int{2, 6})
		})
		run("denial advances observed clock", func() {
			l := need(NewSlidingWindowLimiter(1, 10))
			yes(l.Allow("a", 1))
			no(l.Allow("a", 8))
			invalid(l.Allow("a", 7))
			equal(need(l.History("a")), []int{1})
			yes(l.Allow("a", 11))
		})
		run("clients clocks independent and reads do not expire", func() {
			l := need(NewSlidingWindowLimiter(1, 2))
			yes(l.Allow("a", 100))
			yes(l.Allow("b", 0))
			equal(need(l.History("a")), []int{100})
			equal(need(l.History("new")), []int{})
			yes(l.Allow("a", 102))
			invalid(l.Allow("b", -1))
			equal(need(l.History("b")), []int{0})
		})
		run("validation and histories detached", func() {
			invalid(NewSlidingWindowLimiter(0, 1))
			invalid(NewSlidingWindowLimiter(1, -1))
			l := need(NewSlidingWindowLimiter(2, 5))
			invalid(l.Allow("", 0))
			invalid(l.History(""))
			yes(l.Allow("a", 0))
			h := need(l.History("a"))
			h[0] = 999
			equal(need(l.History("a")), []int{0})
		})
		run("equal timestamps window one and instances", func() {
			a := need(NewSlidingWindowLimiter(2, 1))
			b := need(NewSlidingWindowLimiter(2, 1))
			yes(a.Allow("x", 0))
			yes(a.Allow("x", 0))
			no(a.Allow("x", 0))
			yes(a.Allow("x", 1))
			equal(need(a.History("x")), []int{1})
			equal(need(b.History("x")), []int{})
		})
	}
	finish()
}
