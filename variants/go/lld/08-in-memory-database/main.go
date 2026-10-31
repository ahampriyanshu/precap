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
		run("record isolation overwrite and empty value", func() {
			s := NewRecordStore()
			s.Set("k", "f", "")
			equal(s.Get("k", "f"), sp(""))
			s.Set("k", "f", "new")
			equal(s.Get("k", "f"), sp("new"))
			equal(s.Get("other", "f"), (*string)(nil))
		})
		run("ordered prefix detached scan and instances", func() {
			a, b := NewRecordStore(), NewRecordStore()
			a.Set("k", "b", "2")
			a.Set("k", "a", "1")
			equal(a.Scan("k", ""), []Field{{"a", "1"}, {"b", "2"}})
			v := a.Scan("k", "a")
			v[0].Value = "bad"
			equal(a.Get("k", "a"), sp("1"))
			equal(b.Scan("k", ""), []Field{})
		})
	} else {
		run("TTL boundary and historical lookup", func() {
			d := NewTemporalDatabase()
			must(d.Set(2, "k", "f", "v", ip(3)))
			equal(need(d.Get(4, "k", "f")), sp("v"))
			equal(need(d.Get(5, "k", "f")), (*string)(nil))
			equal(need(d.GetAt(5, "k", "f", 4)), sp("v"))
			equal(need(d.GetAt(5, "k", "f", 1)), (*string)(nil))
		})
		run("expired overwrite never revives older value", func() {
			d := NewTemporalDatabase()
			must(d.Set(0, "k", "f", "old", nil))
			must(d.Set(2, "k", "f", "new", ip(1)))
			equal(need(d.Get(3, "k", "f")), (*string)(nil))
			equal(need(d.GetAt(3, "k", "f", 1)), sp("old"))
		})
		run("delete history recreate and CAS lifetime", func() {
			d := NewTemporalDatabase()
			must(d.Set(0, "k", "f", "a", nil))
			yes(d.Delete(1, "k", "f"))
			no(d.Delete(1, "k", "f"))
			must(d.Set(2, "k", "f", "b", ip(2)))
			no(d.CompareAndSet(2, "k", "f", "bad", "x", nil))
			yes(d.CompareAndSet(3, "k", "f", "b", "c", nil))
			equal(need(d.Get(9, "k", "f")), sp("c"))
			equal(need(d.GetAt(9, "k", "f", 1)), (*string)(nil))
			equal(need(d.GetAt(9, "k", "f", 0)), sp("a"))
		})
		run("same timestamp processed order", func() {
			d := NewTemporalDatabase()
			must(d.Set(1, "k", "f", "a", nil))
			must(d.Set(1, "k", "f", "b", nil))
			equal(need(d.GetAt(1, "k", "f", 1)), sp("b"))
			yes(d.Delete(1, "k", "f"))
			equal(need(d.GetAt(1, "k", "f", 1)), (*string)(nil))
		})
		run("invalid TTL lookback preserve clock", func() {
			d := NewTemporalDatabase()
			must(d.Set(1, "k", "f", "v", nil))
			bad(d.Set(10, "k", "f", "bad", ip(0)))
			invalid(d.CompareAndSet(10, "missing", "f", "x", "y", ip(-1)))
			invalid(d.GetAt(10, "k", "f", 11))
			equal(need(d.Get(2, "k", "f")), sp("v"))
			invalid(d.Get(1, "k", "f"))
			invalid(d.Get(-1, "k", "f"))
		})
		run("valid failed reads mutations advance time", func() {
			d := NewTemporalDatabase()
			no(d.Delete(5, "missing", "f"))
			bad(d.Set(4, "k", "f", "v", nil))
			no(d.CompareAndSet(6, "missing", "f", "x", "v", nil))
			invalid(d.Get(5, "missing", "f"))
			equal(need(d.Get(7, "missing", "f")), (*string)(nil))
			invalid(d.Get(6, "missing", "f"))
		})
		run("scan prefix empty values and detached outputs", func() {
			d := NewTemporalDatabase()
			must(d.Set(0, "", "b", "2", nil))
			must(d.Set(0, "", "a", "", nil))
			must(d.Set(0, "", "ax", "gone", ip(1)))
			equal(need(d.Scan(1, "", "a")), []Field{{"a", ""}})
			v := need(d.Scan(1, "", ""))
			v[0].Value = "bad"
			p := need(d.Get(1, "", "a"))
			*p = "bad"
			equal(need(d.Get(1, "", "a")), sp(""))
			equal(need(NewTemporalDatabase().Scan(0, "", "")), []Field{})
		})
	}
	finish()
}
