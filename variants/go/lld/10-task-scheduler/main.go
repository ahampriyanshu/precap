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
		run("empty priority and numeric ties", func() {
			q := NewPriorityQueue()
			equal(q.Pop(), (*QueuedTask)(nil))
			for i := 1; i <= 12; i++ {
				equal(q.Add("same", 0), i)
			}
			for i := 1; i <= 12; i++ {
				equal(q.Pop(), &QueuedTask{i, "same"})
			}
			equal(q.Add("high", 9), 13)
			q.Add("low", -1)
			equal(q.Pop(), &QueuedTask{13, "high"})
		})
		run("independent queues do not reuse identifiers", func() {
			a, b := NewPriorityQueue(), NewPriorityQueue()
			a.Add("x", 1)
			a.Pop()
			equal(a.Add("y", 1), 2)
			equal(b.Add("z", 1), 1)
		})
	} else {
		run("pending snapshot priority and numeric ties", func() {
			s := NewTaskScheduler()
			for i := 1; i <= 12; i++ {
				equal(s.AddTask("x", 0), i)
			}
			yes(s.AddWorker("w", 12))
			for i := 1; i <= 12; i++ {
				t := need(s.Dispatch(0, "w", 10))
				equal(t.ID, i)
				equal(t.Token, ip(i))
				equal(t.Status, "running")
			}
			equal(need(s.GetTask(0, 999)), (*Task)(nil))
		})
		run("capacity duplicates and failed dispatch tokens", func() {
			s := NewTaskScheduler()
			s.AddTask("low", -1)
			s.AddTask("high", 2)
			yes(s.AddWorker("w", 1))
			no(s.AddWorker("w", 9))
			invalid(s.AddWorker("w", 0))
			equal(need(s.Dispatch(0, "unknown", 3)), (*Task)(nil))
			a := need(s.Dispatch(0, "w", 3))
			equal(a.ID, 2)
			equal(a.Token, ip(1))
			equal(need(s.Dispatch(0, "w", 3)), (*Task)(nil))
			yes(s.Complete(0, a.ID, *a.Token))
			b := need(s.Dispatch(0, "w", 3))
			equal(b.Token, ip(2))
		})
		run("expiry boundary requeues and fences stale completion", func() {
			s := NewTaskScheduler()
			id := s.AddTask("x", 1)
			yes(s.AddWorker("w", 1))
			a := need(s.Dispatch(0, "w", 5))
			equal(need(s.GetTask(4, id)).Status, "running")
			equal(need(s.GetTask(5, id)).Status, "pending")
			b := need(s.Dispatch(5, "w", 5))
			equal(b.Token, ip(2))
			no(s.Complete(5, id, *a.Token))
			yes(s.Complete(5, id, *b.Token))
			equal(need(s.GetTask(5, id)), &Task{ID: id, Name: "x", Priority: 1, Status: "done"})
			no(s.Complete(5, id, *b.Token))
		})
		run("separate workers active order and wrong token", func() {
			s := NewTaskScheduler()
			for i := 0; i < 3; i++ {
				s.AddTask("x", i)
			}
			yes(s.AddWorker("a", 2))
			yes(s.AddWorker("b", 1))
			x := need(s.Dispatch(0, "a", 4))
			need(s.Dispatch(0, "b", 4))
			need(s.Dispatch(0, "a", 4))
			v := need(s.Active(0, "a"))
			equal(v[0].ID, 1)
			equal(v[1].ID, 3)
			no(s.Complete(0, x.ID, 999))
			equal(len(need(s.Active(0, "a"))), 2)
			equal(need(s.Active(0, "unknown")), []Task{})
		})
		run("invalid duration does not expire or advance", func() {
			s := NewTaskScheduler()
			id := s.AddTask("x", 1)
			yes(s.AddWorker("w", 1))
			need(s.Dispatch(0, "w", 5))
			invalid(s.Dispatch(20, "w", 0))
			equal(need(s.GetTask(1, id)).Status, "running")
			invalid(s.GetTask(0, id))
			invalid(s.Dispatch(-1, "w", 1))
			equal(need(s.GetTask(1, id)).Token, ip(1))
		})
		run("valid failed requests advance time and expire", func() {
			s := NewTaskScheduler()
			id := s.AddTask("x", 1)
			yes(s.AddWorker("w", 1))
			need(s.Dispatch(0, "w", 2))
			equal(need(s.Dispatch(3, "unknown", 1)), (*Task)(nil))
			invalid(s.GetTask(2, id))
			equal(need(s.GetTask(3, id)).Status, "pending")
			no(s.Complete(4, 999, 1))
			invalid(s.Active(3, "w"))
		})
		run("deep snapshot and instance isolation", func() {
			a, b := NewTaskScheduler(), NewTaskScheduler()
			id := a.AddTask("x", 1)
			yes(a.AddWorker("w", 1))
			t := need(a.Dispatch(0, "w", 9))
			*t.Token = 999
			*t.Worker = "bad"
			v := need(a.Active(0, "w"))
			*v[0].ExpiresAt = 0
			equal(need(a.GetTask(0, id)).Token, ip(1))
			equal(need(b.GetTask(0, id)), (*Task)(nil))
			equal(b.AddTask("x", 1), 1)
		})
	}
	finish()
}
