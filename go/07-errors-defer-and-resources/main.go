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

type fakeSource struct {
	data                     []byte
	readErr, closeErr        error
	panicRead, mutateOnClose bool
	events                   []string
}

func (s *fakeSource) ReadAll() ([]byte, error) {
	s.events = append(s.events, "read")
	if s.panicRead {
		panic("source panic")
	}
	return s.data, s.readErr
}
func (s *fakeSource) Close() error {
	s.events = append(s.events, "close")
	if s.mutateOnClose && len(s.data) > 0 {
		s.data[0] = 99
	}
	return s.closeErr
}
func main() {
	stage := stageFlag()
	_ = stage
	if stage == "prototype" {
		run("successful owned resource and copy", func() {
			s := &fakeSource{data: []byte{1, 2}}
			v := need(Prototype(s))
			equal(v, []byte{1, 2})
			equal(s.events, []string{"read", "close"})
			v[0] = 99
			equal(s.data, []byte{1, 2})
		})
		run("read error precedence and close error", func() {
			read, closeErr := errors.New("read"), errors.New("close")
			s := &fakeSource{readErr: read, closeErr: closeErr}
			v, e := Prototype(s)
			ok(v == nil && errors.Is(e, read))
			equal(s.events, []string{"read", "close"})
			v, e = Prototype(&fakeSource{closeErr: closeErr})
			ok(v == nil && errors.Is(e, closeErr))
			invalid(Prototype(nil))
		})
	} else {
		run("success close once and detach before close mutation", func() {
			s := &fakeSource{data: []byte{1, 2}, mutateOnClose: true}
			equal(need(Solve(s)), []byte{1, 2})
			equal(s.data[0], byte(99))
			equal(s.events, []string{"read", "close"})
		})
		run("read and close failure precedence", func() {
			a, b := errors.New("read"), errors.New("close")
			s := &fakeSource{data: []byte{1}, readErr: a, closeErr: b}
			v, e := Solve(s)
			ok(v == nil && errors.Is(e, a))
			equal(s.events, []string{"read", "close"})
			v, e = Solve(&fakeSource{closeErr: b})
			ok(v == nil && errors.Is(e, b))
		})
		run("defer closes while panic propagates", func() {
			s := &fakeSource{panicRead: true}
			func() { defer func() { equal(recover(), "source panic") }(); Solve(s); panic("panic swallowed") }()
			equal(s.events, []string{"read", "close"})
		})
		run("nil source empty success fresh buffers", func() {
			invalid(Solve(nil))
			a := need(Solve(&fakeSource{}))
			ok(a != nil)
			equal(len(a), 0)
			s := &fakeSource{data: []byte{1}}
			v := need(Solve(s))
			v[0] = 9
			equal(s.data[0], byte(1))
		})
	}
	finish()
}
