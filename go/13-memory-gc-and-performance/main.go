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
		run("range values and empty ranges", func() {
			equal(need(Prototype([]byte{1, 2, 3}, [][2]int{{0, 2}, {1, 1}})), [][]byte{{1, 2}, {}})
			equal(need(Prototype(nil, nil)), [][]byte{})
		})
		run("invalid bounds preserve source", func() { a := []byte{1, 2}; invalid(Prototype(a, [][2]int{{0, 1}, {-1, 1}})); equal(a, []byte{1, 2}) })
	} else {
		run("overlapping copies independent tight capacity", func() {
			a := make([]byte, 4, 1024)
			copy(a, []byte{1, 2, 3, 4})
			v := need(Solve(a, [][2]int{{0, 3}, {1, 4}, {2, 2}}))
			equal(v, [][]byte{{1, 2, 3}, {2, 3, 4}, {}})
			for _, b := range v {
				equal(cap(b), len(b))
				ok(b != nil)
			}
			v[0][1] = 99
			equal(v[1], []byte{2, 3, 4})
			equal(a, []byte{1, 2, 3, 4})
			a[2] = 88
			equal(v[1], []byte{2, 3, 4})
		})
		run("all invalid shapes preserve inputs", func() {
			a := []byte{1, 2}
			for _, q := range [][][2]int{{{-1, 1}}, {{1, 0}}, {{0, 3}}, {{0, 1}, {2, 3}}} {
				before := snap(q)
				invalid(Solve(a, q))
				equal(snap(q), before)
				equal(a, []byte{1, 2})
			}
			equal(need(Solve(nil, nil)), [][]byte{})
		})
		run("trim clears original tail retains identity and caps prefix", func() {
			p, q, r := &Payload{Data: []byte{1}}, &Payload{Data: []byte{2}}, &Payload{Data: []byte{3}}
			a := []*Payload{p, q, r}
			v := need(TrimPointers(a, 1))
			ok(len(v) == 1 && cap(v) == 1 && v[0] == p)
			ok(a[1] == nil && a[2] == nil)
			v[0].Data[0] = 9
			equal(p.Data[0], byte(9))
			v = append(v, &Payload{})
			ok(a[1] == nil)
		})
		run("trim zero all nil and invalid atomicity", func() {
			p := &Payload{}
			a := []*Payload{p, nil}
			invalid(TrimPointers(a, -1))
			invalid(TrimPointers(a, 3))
			ok(a[0] == p && a[1] == nil)
			v := need(TrimPointers(a, 2))
			ok(len(v) == 2 && cap(v) == 2)
			v = need(TrimPointers(a, 0))
			equal(len(v), 0)
			equal(cap(v), 0)
			ok(a[0] == nil && a[1] == nil)
			equal(need(TrimPointers(nil, 0)), ([]*Payload)(nil))
		})
	}
	finish()
}
