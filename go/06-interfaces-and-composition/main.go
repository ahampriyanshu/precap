package main

import (
	"encoding/json"
	"errors"
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

type fakeReader struct {
	value, calls int
	err          error
}

func (r *fakeReader) ReadValue() (int, error) {
	if r == nil {
		return 0, errors.New("typed nil")
	}
	r.calls++
	return r.value, r.err
}
func main() {
	stage := stageFlag()
	_ = stage
	if stage == "prototype" {
		run("ordered readers and empty input", func() {
			a, b := &fakeReader{value: 2}, &fakeReader{value: 3}
			equal(need(Prototype([]ValueReader{a, b})), []int{2, 3})
			equal(a.calls, 1)
			equal(b.calls, 1)
			equal(need(Prototype(nil)), []int{})
		})
		run("fail fast and error identity", func() {
			sentinel := errors.New("unavailable")
			a, b := &fakeReader{err: sentinel}, &fakeReader{}
			v, e := Prototype([]ValueReader{a, b})
			ok(v == nil && errors.Is(e, sentinel))
			equal(b.calls, 0)
			invalid(Prototype([]ValueReader{nil}))
		})
	} else {
		run("composition and negative zero factors", func() {
			var _ ValueReader = (*ScaledReader)(nil)
			source := &fakeReader{value: 3}
			inner := &ScaledReader{Source: source, Factor: -2}
			outer := &ScaledReader{Source: inner, Factor: 4}
			equal(need(Solve([]ValueReader{outer})), []int{-24})
			equal(source.calls, 1)
			equal(need((&ScaledReader{Source: source, Factor: 0}).ReadValue()), 0)
		})
		run("fail fast underlying error and slice preserved", func() {
			sentinel := errors.New("read failed")
			a, b := &fakeReader{err: sentinel}, &fakeReader{value: 4}
			readers := []ValueReader{a, b}
			v, e := Solve(readers)
			ok(v == nil && errors.Is(e, sentinel))
			equal(b.calls, 0)
			ok(readers[0] == a && readers[1] == b)
		})
		run("nil interface versus typed nil implementation", func() {
			invalid(Solve([]ValueReader{nil}))
			var typed *fakeReader
			var iface ValueReader = typed
			ok(iface != nil)
			invalid(Solve([]ValueReader{iface}))
			invalid((&ScaledReader{Source: nil, Factor: 1}).ReadValue())
		})
		run("empty result fresh output and wrapped error", func() {
			equal(need(Solve(nil)), []int{})
			a := &fakeReader{value: 5}
			v := need(Solve([]ValueReader{a}))
			v[0] = 99
			equal(a.value, 5)
			sentinel := errors.New("inner")
			_, e := (&ScaledReader{Source: &fakeReader{err: sentinel}, Factor: 2}).ReadValue()
			ok(errors.Is(e, sentinel))
		})
	}
	finish()
}
