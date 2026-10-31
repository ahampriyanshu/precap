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
		run("exact free title and sorted IDs", func() {
			a := []AvailableCopy{{"B", "Go", true}, {"A", "Go", true}, {"C", "go", true}, {"D", "Go", false}}
			before := snap(a)
			equal(AvailableCopies(a, "Go"), []string{"A", "B"})
			equal(AvailableCopies(a, "missing"), []string{})
			equal(snap(a), before)
		})
		run("fresh result and empty catalog", func() {
			a := []AvailableCopy{{"A", "T", true}}
			x := AvailableCopies(a, "T")
			x[0] = "bad"
			equal(AvailableCopies(a, "T"), []string{"A"})
			equal(AvailableCopies(nil, "T"), []string{})
		})
	} else {
		run("copy identity and exhaustion", func() {
			l := need(NewLibrary([]BookCopy{{"B", "T"}, {"A", "T"}}))
			equal(need(l.Borrow("m1", "T")), sp("A"))
			equal(need(l.Borrow("m2", "T")), sp("B"))
			equal(need(l.Borrow("m3", "T")), (*string)(nil))
			invalid(l.Borrow("m1", "T"))
			equal(len(l.Loans()), 2)
		})
		run("return ownership and repeated release", func() {
			l := need(NewLibrary([]BookCopy{{"A", "T"}}))
			need(l.Borrow("m", "T"))
			invalid(l.ReturnCopy("A", "other"))
			equal(len(l.Loans()), 1)
			yes(l.ReturnCopy("A", "m"))
			no(l.ReturnCopy("A", "m"))
			no(l.ReturnCopy("missing", "m"))
			equal(need(l.Borrow("m", "T")), sp("A"))
		})
		run("title case and unknown do not create loans", func() {
			l := need(NewLibrary([]BookCopy{{"A", "Go"}}))
			equal(need(l.Borrow("m", "go")), (*string)(nil))
			equal(need(l.Available("Go")), []string{"A"})
			equal(l.Loans(), []Loan{})
		})
		run("validate all IDs and catalog", func() {
			invalid(NewLibrary([]BookCopy{{"A", "T"}, {"A", "X"}}))
			invalid(NewLibrary([]BookCopy{{"", "T"}}))
			invalid(NewLibrary([]BookCopy{{"A", ""}}))
			l := need(NewLibrary(nil))
			invalid(l.Borrow("", "T"))
			invalid(l.Borrow("m", ""))
			invalid(l.ReturnCopy("", "m"))
			invalid(l.Available(""))
			equal(l.Loans(), []Loan{})
		})
		run("input snapshots and independent instances", func() {
			c := []BookCopy{{"A", "T"}}
			a := need(NewLibrary(c))
			b := need(NewLibrary(c))
			c[0].Title = "bad"
			need(a.Borrow("m", "T"))
			v := a.Loans()
			v[0].MemberID = "bad"
			equal(a.Loans(), []Loan{{"A", "T", "m"}})
			equal(need(b.Available("T")), []string{"A"})
		})
		run("bounded borrow return lifecycle", func() {
			l := need(NewLibrary([]BookCopy{{"A", "T"}}))
			for i := 0; i < 40; i++ {
				equal(need(l.Borrow("m", "T")), sp("A"))
				yes(l.ReturnCopy("A", "m"))
				equal(l.Loans(), []Loan{})
			}
		})
	}
	finish()
}
