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

func main() {
	stage := stageFlag()
	_ = stage
	fn := Solve
	if stage == "prototype" {
		fn = Prototype
	}
	run("multiplicity beats sets", func() {
		loaded := "ab"
		requested := "aaa"
		equal(fn(loaded, requested), map[rune]int{97: 2})
	})
	run("case and punctuation", func() {
		loaded := "A-b 2"
		requested := "BAAA!"
		equal(fn(loaded, requested), map[rune]int{97: 2})
	})
	run("empty strings", func() {
		loaded := ""
		requested := ""
		equal(fn(loaded, requested), map[rune]int{})
	})
	run("unicode letters", func() {
		loaded := "éÉ"
		requested := "ééé"
		equal(fn(loaded, requested), map[rune]int{233: 1})
	})
	run("casefold expansion", func() {
		loaded := "ß"
		requested := "SS"
		equal(fn(loaded, requested), map[rune]int{})
	})
	run("generated text 0", func() {
		loaded := ""
		requested := " a?A"
		equal(fn(loaded, requested), map[rune]int{97: 2})
	})
	run("generated text 1", func() {
		loaded := "C"
		requested := "A AbB"
		equal(fn(loaded, requested), map[rune]int{97: 2, 98: 2})
	})
	run("generated text 2", func() {
		loaded := "!a"
		requested := "?  ?BB"
		equal(fn(loaded, requested), map[rune]int{98: 2})
	})
	run("generated text 3", func() {
		loaded := "c b"
		requested := "?B abbb"
		equal(fn(loaded, requested), map[rune]int{97: 1, 98: 3})
	})
	run("generated text 4", func() {
		loaded := "AAAa"
		requested := " BBa??AB"
		equal(fn(loaded, requested), map[rune]int{98: 3})
	})
	run("generated text 5", func() {
		loaded := " !aca"
		requested := "??AAbA c?"
		equal(fn(loaded, requested), map[rune]int{97: 1, 98: 1})
	})
	run("generated text 6", func() {
		loaded := "bcaaaB"
		requested := "ABAbcBbAaA"
		equal(fn(loaded, requested), map[rune]int{97: 2, 98: 2})
	})
	run("generated text 7", func() {
		loaded := "C!BbA C"
		requested := "?cbBbbaA ?A"
		equal(fn(loaded, requested), map[rune]int{97: 2, 98: 2})
	})
	run("generated text 8", func() {
		loaded := "Cb!aBabA"
		requested := " b?bb abbba?"
		equal(fn(loaded, requested), map[rune]int{98: 3})
	})
	run("generated text 9", func() {
		loaded := "A!cAaC!aC"
		requested := "ba?aB?Ba?A BB"
		equal(fn(loaded, requested), map[rune]int{98: 5})
	})
	run("generated text 10", func() {
		loaded := " cB!cbBB c"
		requested := " bacAc?? Baaac"
		equal(fn(loaded, requested), map[rune]int{97: 5})
	})
	run("generated text 11", func() {
		loaded := "!baBBBabaa!"
		requested := "  BA?BA cBAaAbA"
		equal(fn(loaded, requested), map[rune]int{97: 2, 99: 1})
	})
	run("generated text 12", func() {
		loaded := "bB!bCbAAbbCc"
		requested := " bAAaABA a  BcBA"
		equal(fn(loaded, requested), map[rune]int{97: 5})
	})
	run("generated text 13", func() {
		loaded := "cCc!ba!bcbAcB"
		requested := "aB?AA  b Babc aaB"
		equal(fn(loaded, requested), map[rune]int{97: 4, 98: 1})
	})
	run("generated text 14", func() {
		loaded := "ABAaBaBaBCcCb!"
		requested := "A ABcB ?A?c?BAc b?"
		equal(fn(loaded, requested), map[rune]int{})
	})
	if stage == "final" {
	}

	finish()
}
