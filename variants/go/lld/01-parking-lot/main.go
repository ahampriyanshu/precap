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
		run("smallest compatible then ID", func() {
			s := []Spot{{"V", "van"}, {"C2", "car"}, {"C1", "car"}}
			before := snap(s)
			equal(need(ChooseSpot(s, "car")), sp("C1"))
			equal(snap(s), before)
		})
		run("empty and compatibility", func() {
			equal(need(ChooseSpot([]Spot{}, "car")), (*string)(nil))
			equal(need(ChooseSpot([]Spot{{"C", "car"}}, "van")), (*string)(nil))
			equal(need(ChooseSpot([]Spot{{"C", "car"}}, "motorcycle")), sp("C"))
		})
		run("validate entire inventory", func() {
			invalid(ChooseSpot([]Spot{{"A", "car"}, {"X", "bus"}}, "car"))
			invalid(ChooseSpot([]Spot{{"A", "car"}, {"A", "van"}}, "car"))
			invalid(ChooseSpot([]Spot{{"", "car"}}, "car"))
			invalid(ChooseSpot([]Spot{}, "bus"))
		})
	} else {
		run("allocation and release sequence", func() {
			l := need(NewParkingLot([]Spot{{"V", "van"}, {"C2", "car"}, {"C1", "car"}, {"M", "motorcycle"}}))
			equal(need(l.Park("one", "car")), &Ticket{1, "one", "car", "C1"})
			equal(need(l.Park("two", "car")).SpotID, "C2")
			equal(need(l.Park("bike", "motorcycle")).SpotID, "M")
			equal(l.Release(1), &Ticket{1, "one", "car", "C1"})
			equal(l.Release(1), (*Ticket)(nil))
		})
		run("full failure does not consume ID", func() {
			l := need(NewParkingLot([]Spot{{"A", "car"}}))
			equal(need(l.Park("one", "car")).TicketID, 1)
			equal(need(l.Park("two", "car")), (*Ticket)(nil))
			l.Release(1)
			equal(need(l.Park("two", "car")).TicketID, 2)
		})
		run("duplicate and invalid requests atomic", func() {
			l := need(NewParkingLot([]Spot{{"A", "car"}, {"B", "car"}}))
			need(l.Park("one", "car"))
			invalid(l.Park("one", "motorcycle"))
			invalid(l.Park("", "car"))
			invalid(l.Park("x", "bus"))
			equal(need(l.Park("two", "car")).TicketID, 2)
		})
		run("constructor and snapshots detached", func() {
			s := []Spot{{"A", "car"}}
			l := need(NewParkingLot(s))
			s[0].ID = "bad"
			t := need(l.Park("one", "car"))
			t.SpotID = "bad"
			a := l.ActiveTickets()
			a[0].VehicleID = "bad"
			equal(l.Release(1).SpotID, "A")
			v := l.AvailableSpots()
			v[0].ID = "bad"
			equal(l.AvailableSpots(), []Spot{{"A", "car"}})
		})
		run("invalid inventories and empty lot", func() {
			invalid(NewParkingLot([]Spot{{"A", "car"}, {"A", "van"}}))
			invalid(NewParkingLot([]Spot{{"X", "bus"}}))
			l := need(NewParkingLot(nil))
			equal(l.ActiveTickets(), []Ticket{})
			equal(l.AvailableSpots(), []Spot{})
			equal(need(l.Park("a", "car")), (*Ticket)(nil))
		})
		run("independent repeated lifecycle", func() {
			a := need(NewParkingLot([]Spot{{"A", "car"}}))
			b := need(NewParkingLot([]Spot{{"A", "car"}}))
			for i := 1; i <= 40; i++ {
				t := need(a.Park("same", "car"))
				equal(t.TicketID, i)
				equal(a.Release(i), t)
			}
			equal(need(b.Park("same", "car")).TicketID, 1)
		})
	}
	finish()
}
