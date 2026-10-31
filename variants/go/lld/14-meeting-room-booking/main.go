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
		run("half-open overlap and sorted slots", func() {
			c := NewRoomCalendar()
			yes(c.Reserve(2, 4))
			yes(c.Reserve(0, 2))
			no(c.Reserve(1, 3))
			no(c.Reserve(2, 4))
			equal(c.Slots(), [][2]int{{0, 2}, {2, 4}})
		})
		run("invalid interval snapshots and instances", func() {
			c := NewRoomCalendar()
			yes(c.Reserve(0, 1))
			invalid(c.Reserve(-1, 1))
			invalid(c.Reserve(2, 2))
			v := c.Slots()
			v[0][0] = 99
			equal(c.Slots(), [][2]int{{0, 1}})
			equal(NewRoomCalendar().Slots(), [][2]int{})
		})
	} else {
		run("capacity then ID deterministic allocation", func() {
			m := need(NewMeetingRoomBooking(map[string]int{"B": 4, "A": 4, "C": 8}))
			equal(need(m.Book("x", 0, 2, 3, 2)), []string{"A", "B"})
			equal(need(m.Book("y", 0, 2, 3, 1)), []string{"C"})
			equal(need(m.Schedule("A")), []Reservation{{"x", 0, 2, 3}})
		})
		run("overlap shapes and touching accepted", func() {
			m := need(NewMeetingRoomBooking(map[string]int{"A": 2}))
			need(m.Book("x", 2, 5, 1, 1))
			for i, p := range [][2]int{{1, 3}, {3, 4}, {4, 6}, {1, 6}, {2, 5}} {
				equal(need(m.Book(fmt.Sprint(i), p[0], p[1], 1, 1)), []string(nil))
			}
			equal(need(m.Book("left", 0, 2, 1, 1)), []string{"A"})
			equal(need(m.Book("right", 5, 7, 1, 1)), []string{"A"})
		})
		run("multi-room failure atomic failed ID reusable", func() {
			m := need(NewMeetingRoomBooking(map[string]int{"A": 2, "B": 2}))
			need(m.Book("occupied", 0, 2, 1, 1))
			equal(need(m.Book("retry", 0, 2, 1, 2)), []string(nil))
			equal(need(m.Schedule("B")), []Reservation{})
			ok(m.Cancel("occupied"))
			equal(need(m.Book("retry", 0, 2, 1, 2)), []string{"A", "B"})
		})
		run("capacity rejection cancellation and lifetime identity", func() {
			m := need(NewMeetingRoomBooking(map[string]int{"A": 2}))
			equal(need(m.Book("x", 0, 2, 3, 1)), []string(nil))
			need(m.Book("x", 0, 2, 2, 1))
			ok(m.Cancel("x"))
			ok(!m.Cancel("x"))
			equal(m.Allocation("x"), []string(nil))
			equal(need(m.Book("x", 2, 4, 1, 1)), []string(nil))
			equal(need(m.Book("new", 0, 2, 1, 1)), []string{"A"})
		})
		run("cancel one booking preserves adjacent others", func() {
			m := need(NewMeetingRoomBooking(map[string]int{"A": 2}))
			need(m.Book("a", 0, 2, 1, 1))
			need(m.Book("b", 2, 4, 1, 1))
			ok(m.Cancel("a"))
			equal(need(m.Schedule("A")), []Reservation{{"b", 2, 4, 1}})
		})
		run("validation precedes successful ID check", func() {
			m := need(NewMeetingRoomBooking(map[string]int{"A": 2}))
			need(m.Book("x", 0, 2, 1, 1))
			invalid(m.Book("x", 0, 2, 0, 1))
			invalid(m.Book("x", -1, 2, 1, 1))
			invalid(m.Book("x", 1, 1, 1, 1))
			invalid(m.Book("x", 0, 2, 1, 0))
			invalid(m.Book("", 0, 2, 1, 1))
			invalid(m.Schedule("missing"))
			equal(need(m.Schedule("A")), []Reservation{{"x", 0, 2, 1}})
		})
		run("constructor input and result ownership independent catalogs", func() {
			invalid(NewMeetingRoomBooking(map[string]int{"": 2}))
			invalid(NewMeetingRoomBooking(map[string]int{"A": 0}))
			rooms := map[string]int{"A": 2}
			m := need(NewMeetingRoomBooking(rooms))
			rooms["A"] = 0
			r := need(m.Book("x", 0, 2, 2, 1))
			r[0] = "bad"
			a := m.Allocation("x")
			a[0] = "bad"
			s := need(m.Schedule("A"))
			s[0].Seats = 99
			equal(m.Allocation("x"), []string{"A"})
			equal(need(m.Schedule("A"))[0].Seats, 2)
			equal(need(NewMeetingRoomBooking(nil)).Allocation("x"), []string(nil))
		})
	}
	finish()
}
