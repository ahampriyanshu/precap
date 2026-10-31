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
		run("deposit withdrawal and initial state", func() {
			a := NewBalanceAccount()
			equal(a.Balance(), 0)
			equal(need(a.Deposit(10)), 10)
			yes(a.Withdraw(4))
			equal(a.Balance(), 6)
			no(a.Withdraw(7))
			equal(a.Balance(), 6)
		})
		run("invalid amounts and independent balances", func() {
			a, b := NewBalanceAccount(), NewBalanceAccount()
			invalid(a.Deposit(0))
			invalid(a.Withdraw(-1))
			need(a.Deposit(8))
			equal(b.Balance(), 0)
		})
	} else {
		run("create duplicate missing and amount validation", func() {
			b := NewBank()
			yes(b.CreateAccount("a"))
			need(b.Deposit("a", 10))
			no(b.CreateAccount("a"))
			equal(need(b.Balance("a")), ip(10))
			equal(need(b.Balance("missing")), (*int)(nil))
			invalid(b.Deposit("missing", 0))
			equal(need(b.Deposit("missing", 1)), (*int)(nil))
		})
		run("atomic transfer and conservation", func() {
			b := NewBank()
			yes(b.CreateAccount("a"))
			yes(b.CreateAccount("b"))
			need(b.Deposit("a", 100))
			equal(need(b.Transfer("r", "a", "b", 30)), &TransferResult{70, 30})
			equal(*need(b.Balance("a"))+*need(b.Balance("b")), 100)
			equal(need(b.Transfer("fail", "b", "a", 40)), (*TransferResult)(nil))
			equal(need(b.Balance("b")), ip(30))
		})
		run("retry returns original result after subsequent change", func() {
			b := NewBank()
			yes(b.CreateAccount("a"))
			yes(b.CreateAccount("b"))
			need(b.Deposit("a", 20))
			r := need(b.Transfer("r", "a", "b", 8))
			r.SourceBalance = 999
			need(b.Deposit("a", 10))
			equal(need(b.Transfer("r", "a", "b", 8)), &TransferResult{12, 8})
			invalid(b.Transfer("r", "a", "b", 9))
			equal(need(b.Balance("a")), ip(22))
		})
		run("failed ID retry and same-account rejection", func() {
			b := NewBank()
			yes(b.CreateAccount("a"))
			yes(b.CreateAccount("b"))
			equal(need(b.Transfer("r", "a", "b", 5)), (*TransferResult)(nil))
			need(b.Deposit("a", 5))
			equal(need(b.Transfer("r", "a", "b", 5)), &TransferResult{0, 5})
			equal(need(b.Transfer("x", "b", "b", 1)), (*TransferResult)(nil))
			equal(need(b.Transfer("x", "b", "missing", 1)), (*TransferResult)(nil))
		})
		run("ranking ties limits and snapshots", func() {
			b := NewBank()
			for _, id := range []string{"c", "b", "a"} {
				yes(b.CreateAccount(id))
				need(b.Deposit(id, 10))
			}
			need(b.Transfer("r", "b", "c", 3))
			need(b.Transfer("s", "a", "c", 3))
			equal(need(b.TopSpenders(10)), []Spending{{"a", 3}, {"b", 3}, {"c", 0}})
			equal(need(b.TopSpenders(0)), []Spending{})
			invalid(b.TopSpenders(-1))
			s := need(b.TopSpenders(1))
			s[0].Total = 999
			equal(need(b.TopSpenders(1)), []Spending{{"a", 3}})
		})
		run("invalid IDs and independent instances", func() {
			a, b := NewBank(), NewBank()
			invalid(a.CreateAccount(""))
			invalid(a.Balance(""))
			yes(a.CreateAccount("x"))
			equal(need(b.Balance("x")), (*int)(nil))
			invalid(a.Transfer("", "x", "x", 1))
			equal(need(a.Balance("x")), ip(0))
		})
	}
	finish()
}
