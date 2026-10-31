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
	run("ties and empty sequence", func() {
		feeds := [][]int{[]int{}, []int{1, 4}, []int{1, 2, 8}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{1, 1, 2, 4, 8})
	})
	run("no sequences", func() {
		feeds := [][]int{}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{})
	})
	run("all empty", func() {
		feeds := [][]int{[]int{}, []int{}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{})
	})
	run("1 feeds", func() {
		feeds := [][]int{[]int{-8, 14, 16}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-8, 14, 16})
	})
	run("2 feeds", func() {
		feeds := [][]int{[]int{-9, -8, -7, -6}, []int{}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-9, -8, -7, -6})
	})
	run("3 feeds", func() {
		feeds := [][]int{[]int{-5, 0, 4, 14}, []int{-7, -5, -3, -2, -1, 6, 15}, []int{1, 3, 5, 6, 16, 18}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-7, -5, -5, -3, -2, -1, 0, 1, 3, 4, 5, 6, 6, 14, 15, 16, 18})
	})
	run("4 feeds", func() {
		feeds := [][]int{[]int{-10, -7, 4, 5, 9, 10, 18}, []int{}, []int{-1, -1, -1, 9, 16, 18}, []int{-8, 0, 14, 18}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -8, -7, -1, -1, -1, 0, 4, 5, 9, 9, 10, 14, 16, 18, 18, 18})
	})
	run("5 feeds", func() {
		feeds := [][]int{[]int{-7, 16, 17}, []int{}, []int{13}, []int{-1, 0}, []int{2, 17}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-7, -1, 0, 2, 13, 16, 17, 17})
	})
	run("6 feeds", func() {
		feeds := [][]int{[]int{-9}, []int{3}, []int{-5, -4, 4}, []int{-3}, []int{-10, -9, 12}, []int{-10, -7, -6, -2, 1, 14}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -10, -9, -9, -7, -6, -5, -4, -3, -2, 1, 3, 4, 12, 14})
	})
	run("7 feeds", func() {
		feeds := [][]int{[]int{0, 4, 5, 19}, []int{1, 8}, []int{-10, -1, 5, 5, 7, 15, 17}, []int{16}, []int{0, 0, 5, 17}, []int{-7}, []int{-4, 0, 1, 2, 7, 19}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -7, -4, -1, 0, 0, 0, 0, 1, 1, 2, 4, 5, 5, 5, 5, 7, 7, 8, 15, 16, 17, 17, 19, 19})
	})
	run("8 feeds", func() {
		feeds := [][]int{[]int{5, 16, 16, 17}, []int{-5, 9, 11}, []int{-2, 2, 18, 19}, []int{-10, -6, 11, 15, 15, 19}, []int{-3, -1, 6, 10}, []int{-9, -3, 4, 4, 10, 12}, []int{-8, -2, 10, 16}, []int{6}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -9, -8, -6, -5, -3, -3, -2, -2, -1, 2, 4, 4, 5, 6, 6, 9, 10, 10, 10, 11, 11, 12, 15, 15, 16, 16, 16, 17, 18, 19, 19})
	})
	run("9 feeds", func() {
		feeds := [][]int{[]int{17}, []int{-9, -8, -1, 4, 8, 12}, []int{-10, -8, 0, 5, 18, 19}, []int{7, 8, 12}, []int{-7, -7, -1, 10, 11, 15, 17}, []int{0, 4, 8, 10, 11, 16, 18}, []int{-10, -1, 17}, []int{-10, -10, 13}, []int{-4, -3, -1, 11, 13}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -10, -10, -10, -9, -8, -8, -7, -7, -4, -3, -1, -1, -1, -1, 0, 0, 4, 4, 5, 7, 8, 8, 8, 10, 10, 11, 11, 11, 12, 12, 13, 13, 15, 16, 17, 17, 17, 18, 18, 19})
	})
	run("10 feeds", func() {
		feeds := [][]int{[]int{7, 10, 17}, []int{-4, -2, 6, 11, 15}, []int{-9, -7, 4, 4, 5, 12, 12}, []int{-2}, []int{-8, 10}, []int{4, 8, 19}, []int{-9, -8, -6, -3, -1, 0}, []int{-8, -5, 5, 6, 8, 13}, []int{-10, -6, -2, -2, 4, 15, 16}, []int{-3, -3, 3, 4, 8}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -9, -9, -8, -8, -8, -7, -6, -6, -5, -4, -3, -3, -3, -2, -2, -2, -2, -1, 0, 3, 4, 4, 4, 4, 4, 5, 5, 6, 6, 7, 8, 8, 8, 10, 10, 11, 12, 12, 13, 15, 15, 16, 17, 19})
	})
	run("11 feeds", func() {
		feeds := [][]int{[]int{0, 0, 4, 6}, []int{-9, 1, 5, 9, 16}, []int{-4, 0, 4, 7, 13, 16}, []int{-6, -5, -3, 5}, []int{18}, []int{}, []int{-8, 1, 5, 10, 12, 18}, []int{4, 19}, []int{-1, 4, 16}, []int{-6, -3, 1, 15}, []int{-10, -9, -9, -7, 5, 7, 11}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -9, -9, -9, -8, -7, -6, -6, -5, -4, -3, -3, -1, 0, 0, 0, 1, 1, 1, 4, 4, 4, 4, 5, 5, 5, 5, 6, 7, 7, 9, 10, 11, 12, 13, 15, 16, 16, 16, 18, 18, 19})
	})
	run("12 feeds", func() {
		feeds := [][]int{[]int{-8, -8, -1, 5, 18}, []int{-1, 3, 5, 10}, []int{-9, -7, -2, 0, 1, 13, 14}, []int{-4, 15}, []int{-4, 1, 4, 4, 8, 13}, []int{-9, -2, 4, 11, 17, 18, 19}, []int{-4, 6, 16, 16}, []int{1, 16}, []int{}, []int{}, []int{-9, -7, 2, 7, 8}, []int{-8, 10}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-9, -9, -9, -8, -8, -8, -7, -7, -4, -4, -4, -2, -2, -1, -1, 0, 1, 1, 1, 2, 3, 4, 4, 4, 5, 5, 6, 7, 8, 8, 10, 10, 11, 13, 13, 14, 15, 16, 16, 16, 17, 18, 18, 19})
	})
	run("13 feeds", func() {
		feeds := [][]int{[]int{}, []int{0, 5, 6, 8, 15}, []int{-7}, []int{-9, -7, -1, 7, 19}, []int{-9, -8, 6, 15}, []int{-5, 2, 3, 10, 14}, []int{-9, -6, -6, 13, 18}, []int{-1, 0, 4, 8, 15, 16}, []int{-10, -4, 3, 15, 17}, []int{-8, 0, 4, 6, 11}, []int{-10, -6, -4}, []int{8}, []int{-10, -6, 11, 17, 17}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -10, -10, -9, -9, -9, -8, -8, -7, -7, -6, -6, -6, -6, -5, -4, -4, -1, -1, 0, 0, 0, 2, 3, 3, 4, 4, 5, 6, 6, 6, 7, 8, 8, 8, 10, 11, 11, 13, 14, 15, 15, 15, 15, 16, 17, 17, 17, 18, 19})
	})
	run("14 feeds", func() {
		feeds := [][]int{[]int{-2, 1, 11, 13, 13, 14, 18}, []int{-5, 18}, []int{-5}, []int{-10, -2, 0, 5, 11, 13, 14}, []int{-7, 4, 5, 13, 16}, []int{-7, -1, 9, 16}, []int{}, []int{16}, []int{4, 5, 6, 19}, []int{}, []int{-8, 0, 1, 3, 7, 18}, []int{}, []int{6, 10, 10, 13, 16}, []int{-9, -8, -1, 19}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -9, -8, -8, -7, -7, -5, -5, -2, -2, -1, -1, 0, 0, 1, 1, 3, 4, 4, 5, 5, 5, 6, 6, 7, 9, 10, 10, 11, 11, 13, 13, 13, 13, 13, 14, 14, 16, 16, 16, 16, 18, 18, 18, 19, 19})
	})
	run("15 feeds", func() {
		feeds := [][]int{[]int{-1, 11, 13}, []int{-8, 2, 10}, []int{-10, -4, -1, 2, 6, 8, 9}, []int{4}, []int{-6, -2, 3, 3, 7, 16, 16}, []int{}, []int{-3, 7, 14, 18}, []int{-8, -6, 1, 15, 16, 16}, []int{16}, []int{2, 6, 6, 8, 13, 17}, []int{-5, -4, 10}, []int{-3, -3, 1, 8, 12, 18}, []int{-3, 7, 13, 15, 16}, []int{-9, -9, -2, 0, 1, 3}, []int{-2, 4, 4, 8, 17, 18}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -9, -9, -8, -8, -6, -6, -5, -4, -4, -3, -3, -3, -3, -2, -2, -2, -1, -1, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 10, 10, 11, 12, 13, 13, 13, 14, 15, 15, 16, 16, 16, 16, 16, 16, 17, 17, 18, 18, 18})
	})
	run("16 feeds", func() {
		feeds := [][]int{[]int{-10, 10, 14}, []int{-9, -6, 11, 17}, []int{2}, []int{-8, -2, 13, 17, 18}, []int{-8, -6, 3, 16}, []int{-9, -6, 9, 9, 12, 15}, []int{-5, 5, 10, 16, 19}, []int{-8, -4, 15, 19}, []int{6, 19}, []int{-2, -1, 8, 11, 16}, []int{}, []int{}, []int{}, []int{-6, -5, -1, -1, 0, 9, 12}, []int{-8, -6, -6}, []int{1}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -9, -9, -8, -8, -8, -8, -6, -6, -6, -6, -6, -6, -5, -5, -4, -2, -2, -1, -1, -1, 0, 1, 2, 3, 5, 6, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 18, 19, 19, 19})
	})
	run("17 feeds", func() {
		feeds := [][]int{[]int{-10, -9, 3}, []int{-9, -3, -1, 14}, []int{2, 5, 15}, []int{-5, 5}, []int{-7, -3, 16, 18}, []int{13, 19}, []int{-6, 19}, []int{-3, -3, 7, 9, 11, 14}, []int{}, []int{}, []int{-7, 5, 7, 7, 8, 9}, []int{-9, 15}, []int{}, []int{-9, -4, -4, 5, 10, 14, 15}, []int{-1, 1, 9, 9, 9}, []int{-2, -1, 5, 9, 14}, []int{-5, 3}}
		before_feeds := snap(feeds)
		defer func() { equal(snap(feeds), before_feeds) }()
		equal(fn(feeds), []int{-10, -9, -9, -9, -9, -7, -7, -6, -5, -5, -4, -4, -3, -3, -3, -3, -2, -1, -1, -1, 1, 2, 3, 3, 5, 5, 5, 5, 5, 7, 7, 7, 8, 9, 9, 9, 9, 9, 9, 10, 11, 13, 14, 14, 14, 14, 15, 15, 15, 16, 18, 19, 19})
	})
	if stage == "final" {
	}

	finish()
}
