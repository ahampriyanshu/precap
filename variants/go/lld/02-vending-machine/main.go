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
		run("exact and excess change", func() {
			equal(need(ChangeDue(5, 5)), 0)
			equal(need(ChangeDue(5, 9)), 4)
			equal(need(ChangeDue(0, 0)), 0)
		})
		run("invalid payments", func() { invalid(ChangeDue(-1, 5)); invalid(ChangeDue(1, -1)); invalid(ChangeDue(9, 8)) })
	} else {
		run("purchase change and stock", func() {
			m := need(NewVendingMachine([]Product{{"A", 5, 2}, {"B", 3, 1}}))
			equal(need(m.Insert(3)), 3)
			equal(need(m.Insert(5)), 8)
			equal(need(m.Select("A")), &Sale{"A", 3})
			equal(m.Balance(), 0)
			equal(m.Inventory()["A"], Stock{5, 1})
			equal(m.Inventory()["B"], Stock{3, 1})
		})
		run("insufficient and unknown preserve money", func() {
			m := need(NewVendingMachine([]Product{{"A", 5, 1}}))
			need(m.Insert(4))
			before := snap(m.Inventory())
			invalid(m.Select("A"))
			invalid(m.Select("X"))
			equal(m.Balance(), 4)
			equal(snap(m.Inventory()), before)
		})
		run("sold out exact sale and refund once", func() {
			m := need(NewVendingMachine([]Product{{"A", 5, 1}}))
			need(m.Insert(5))
			equal(need(m.Select("A")).Change, 0)
			need(m.Insert(8))
			invalid(m.Select("A"))
			equal(m.Refund(), 8)
			equal(m.Refund(), 0)
			equal(need(m.Insert(2)), 2)
		})
		run("invalid insert and constructor", func() {
			invalid(NewVendingMachine([]Product{{"", 1, 0}}))
			invalid(NewVendingMachine([]Product{{"A", 0, 0}}))
			invalid(NewVendingMachine([]Product{{"A", 1, -1}}))
			invalid(NewVendingMachine([]Product{{"A", 1, 0}, {"A", 2, 1}}))
			m := need(NewVendingMachine(nil))
			invalid(m.Insert(0))
			invalid(m.Insert(-2))
			equal(m.Balance(), 0)
		})
		run("input snapshots and instances", func() {
			p := []Product{{"A", 2, 2}}
			a := need(NewVendingMachine(p))
			b := need(NewVendingMachine(p))
			p[0].Stock = 0
			s := a.Inventory()
			s["A"] = Stock{99, 0}
			delete(s, "A")
			need(a.Insert(2))
			need(a.Select("A"))
			equal(a.Inventory()["A"].Stock, 1)
			equal(b.Inventory()["A"].Stock, 2)
		})
		run("bounded money conservation", func() {
			m := need(NewVendingMachine([]Product{{"A", 3, 30}}))
			inserted, spent, returned := 0, 0, 0
			for i := 0; i < 30; i++ {
				need(m.Insert(5))
				inserted += 5
				s := need(m.Select("A"))
				spent += 3
				returned += s.Change
				equal(inserted, spent+returned+m.Balance())
			}
			equal(m.Inventory()["A"].Stock, 0)
		})
	}
	finish()
}
