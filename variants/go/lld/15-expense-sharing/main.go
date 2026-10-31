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
		run("remainder sorted zero and input unchanged", func() {
			a := []string{"c", "a", "b"}
			equal(need(SplitEqual(10, a)), map[string]int{"a": 4, "b": 3, "c": 3})
			equal(a, []string{"c", "a", "b"})
			equal(need(SplitEqual(1, a)), map[string]int{"a": 1, "b": 0, "c": 0})
			equal(need(SplitEqual(0, a)), map[string]int{"a": 0, "b": 0, "c": 0})
		})
		run("invalid split amounts and members", func() {
			invalid(SplitEqual(-1, []string{"a"}))
			invalid(SplitEqual(1, nil))
			invalid(SplitEqual(1, []string{"a", "a"}))
			invalid(SplitEqual(1, []string{""}))
		})
	} else {
		run("constructor and zero initial conservation", func() {
			invalid(NewExpenseSharing(nil))
			invalid(NewExpenseSharing([]string{"a", "a"}))
			invalid(NewExpenseSharing([]string{""}))
			m := need(NewExpenseSharing([]string{"c", "a", "b"}))
			equal(m.Balances(), map[string]int{"a": 0, "b": 0, "c": 0})
			equal(m.SuggestSettlements(), []Settlement{})
		})
		run("exact split payer excluded and self expense", func() {
			m := need(NewExpenseSharing([]string{"a", "b", "c"}))
			yes(m.AddExpense("e", "a", 10, []string{"b", "c"}))
			equal(m.Balances(), map[string]int{"a": 10, "b": -5, "c": -5})
			yes(m.AddExpense("self", "a", 9, []string{"a"}))
			equal(m.Balances(), map[string]int{"a": 10, "b": -5, "c": -5})
		})
		run("expense retry canonical membership conflict atomic", func() {
			m := need(NewExpenseSharing([]string{"a", "b", "c"}))
			yes(m.AddExpense("e", "a", 10, []string{"c", "b", "a"}))
			before := snap(m.Balances())
			no(m.AddExpense("e", "a", 10, []string{"a", "b", "c"}))
			invalid(m.AddExpense("e", "a", 11, []string{"a", "b", "c"}))
			invalid(m.AddExpense("e", "b", 10, []string{"a", "b", "c"}))
			equal(snap(m.Balances()), before)
		})
		run("invalid expense fails without consuming ID", func() {
			m := need(NewExpenseSharing([]string{"a", "b"}))
			invalid(m.AddExpense("e", "a", 1, []string{"missing"}))
			invalid(m.AddExpense("e", "a", 0, []string{"a"}))
			invalid(m.AddExpense("e", "a", 1, []string{"a", "a"}))
			invalid(m.AddExpense("", "a", 1, []string{"a"}))
			yes(m.AddExpense("e", "a", 2, []string{"a", "b"}))
			equal(m.Balances(), map[string]int{"a": 1, "b": -1})
		})
		run("partial settlement exact replay after zero balances", func() {
			m := need(NewExpenseSharing([]string{"a", "b"}))
			yes(m.AddExpense("e", "a", 10, []string{"b"}))
			yes(m.Settle("s1", "b", "a", 4))
			yes(m.Settle("s2", "b", "a", 6))
			no(m.Settle("s1", "b", "a", 4))
			no(m.Settle("s2", "b", "a", 6))
			equal(m.Balances(), map[string]int{"a": 0, "b": 0})
			invalid(m.Settle("s1", "b", "a", 5))
		})
		run("failed settlement ID reusable roles and bounds", func() {
			m := need(NewExpenseSharing([]string{"a", "b"}))
			invalid(m.Settle("s", "b", "a", 1))
			yes(m.AddExpense("e", "a", 4, []string{"b"}))
			invalid(m.Settle("x", "a", "b", 1))
			invalid(m.Settle("x", "b", "a", 5))
			invalid(m.Settle("x", "a", "a", 1))
			yes(m.Settle("s", "b", "a", 1))
			equal(m.Balances(), map[string]int{"a": 3, "b": -3})
		})
		run("shared operation namespace and structural validation", func() {
			m := need(NewExpenseSharing([]string{"a", "b"}))
			yes(m.AddExpense("e", "a", 4, []string{"b"}))
			invalid(m.Settle("e", "b", "a", 1))
			yes(m.Settle("s", "b", "a", 1))
			invalid(m.AddExpense("s", "a", 1, []string{"b"}))
			invalid(m.Settle("s", "b", "a", 0))
			equal(m.Balances(), map[string]int{"a": 3, "b": -3})
		})
		run("deterministic suggestions split creditors detached inputs", func() {
			members := []string{"d", "c", "b", "a"}
			m := need(NewExpenseSharing(members))
			members[0] = "bad"
			yes(m.AddExpense("e1", "a", 5, []string{"c"}))
			yes(m.AddExpense("e2", "b", 3, []string{"c", "d"}))
			before := snap(m.Balances())
			equal(m.SuggestSettlements(), []Settlement{{"c", "a", 5}, {"c", "b", 2}, {"d", "b", 1}})
			v := m.SuggestSettlements()
			v[0].Amount = 999
			b := m.Balances()
			b["a"] = 999
			equal(snap(m.Balances()), before)
			total := 0
			for _, x := range m.Balances() {
				total += x
			}
			equal(total, 0)
			equal(need(NewExpenseSharing([]string{"a"})).Balances(), map[string]int{"a": 0})
		})
	}
	finish()
}
