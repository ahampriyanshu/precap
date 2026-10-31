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
		run("draft shape and nested ownership", func() {
			i, s := []string{"a", "a"}, []string{"mix"}
			d := NewRecipeDraft("", i, s)
			i[0] = "bad"
			s[0] = "bad"
			equal(d.Snapshot(), Draft{"", []string{"a", "a"}, []string{"mix"}})
			v := d.Snapshot()
			v.Ingredients[0] = "bad"
			equal(d.Snapshot().Ingredients, []string{"a", "a"})
		})
		run("empty drafts and independent instances", func() {
			a, b := NewRecipeDraft("a", nil, nil), NewRecipeDraft("b", nil, nil)
			equal(a.Snapshot(), Draft{"a", []string{}, []string{}})
			equal(b.Snapshot().Name, "b")
		})
	} else {
		run("creation permissions and failed ID allocation", func() {
			m := NewRecipeManager()
			yes(m.AddUser("w", []string{"write"}))
			yes(m.AddUser("r", []string{"read"}))
			equal(need(m.Add("r", "A", nil, nil)), (*string)(nil))
			equal(need(m.Add("w", "A", nil, nil)), sp("recipe1"))
			equal(need(m.Add("w", "A", nil, nil)), (*string)(nil))
			equal(need(m.Add("w", "B", nil, nil)), sp("recipe2"))
			equal(m.Get("w", "recipe1", nil), (*Recipe)(nil))
			equal(m.Get("r", "recipe1", nil).Version, 1)
		})
		run("user validation precedes duplicate and preserves permissions", func() {
			m := NewRecipeManager()
			yes(m.AddUser("u", []string{"read", "read"}))
			invalid(m.AddUser("u", []string{"admin"}))
			invalid(m.AddUser("", nil))
			no(m.AddUser("u", []string{"write"}))
			equal(need(m.Add("u", "A", nil, nil)), (*string)(nil))
		})
		run("rename index versions and append identical updates", func() {
			m := NewRecipeManager()
			yes(m.AddUser("u", []string{"read", "write"}))
			id := *need(m.Add("u", "A", []string{"x"}, []string{"one"}))
			equal(need(m.Update("u", id, "B", []string{"y"}, nil)), ip(2))
			equal(need(m.Update("u", id, "B", []string{"y"}, nil)), ip(3))
			equal(need(m.Add("u", "A", nil, nil)), sp("recipe2"))
			equal(m.Get("u", id, ip(1)).Name, "A")
			equal(len(m.History("u", id)), 3)
			equal(m.Get("u", id, ip(0)), (*Recipe)(nil))
		})
		run("rollback appends preserves future and collision atomic", func() {
			m := NewRecipeManager()
			yes(m.AddUser("u", []string{"read", "write"}))
			id := *need(m.Add("u", "A", nil, nil))
			need(m.Update("u", id, "B", nil, nil))
			equal(m.Rollback("u", id, 1), ip(3))
			equal(m.Get("u", id, ip(2)).Name, "B")
			need(m.Update("u", id, "C", nil, nil))
			need(m.Add("u", "A", nil, nil))
			equal(m.Rollback("u", id, 1), (*int)(nil))
			equal(len(m.History("u", id)), 4)
		})
		run("name validation missing versions and denied operations", func() {
			m := NewRecipeManager()
			invalid(m.Add("unknown", "", nil, nil))
			invalid(m.Update("unknown", "missing", "", nil, nil))
			equal(need(m.Update("unknown", "missing", "A", nil, nil)), (*int)(nil))
			equal(m.Get("unknown", "missing", nil), (*Recipe)(nil))
			equal(m.History("unknown", "missing"), []Recipe{})
			equal(m.Rollback("unknown", "missing", 1), (*int)(nil))
			equal(m.ByIngredient("unknown", "x"), []string{})
		})
		run("ingredient ordering duplicates latest only", func() {
			m := NewRecipeManager()
			yes(m.AddUser("u", []string{"read", "write"}))
			a := *need(m.Add("u", "B", []string{"x", "x"}, nil))
			b := *need(m.Add("u", "A", []string{"x"}, nil))
			equal(m.ByIngredient("u", "x"), []string{b, a})
			need(m.Update("u", b, "A", nil, nil))
			equal(m.ByIngredient("u", "x"), []string{a})
		})
		run("nested input history and snapshot copies", func() {
			m := NewRecipeManager()
			p := []string{"read", "write"}
			yes(m.AddUser("u", p))
			p[1] = "bad"
			i, s := []string{"x"}, []string{"mix"}
			id := *need(m.Add("u", "A", i, s))
			i[0] = "bad"
			s[0] = "bad"
			r := m.Get("u", id, nil)
			r.Ingredients[0] = "bad"
			h := m.History("u", id)
			h[0].Steps[0] = "bad"
			equal(m.Get("u", id, nil).Ingredients, []string{"x"})
			equal(m.Get("u", id, nil).Steps, []string{"mix"})
			equal(NewRecipeManager().History("u", id), []Recipe{})
		})
	}
	finish()
}
