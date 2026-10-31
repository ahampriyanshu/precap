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
		run("FIFO empty and lifetime duplicates", func() {
			q := NewMessageQueue()
			equal(q.Consume(), (*Message)(nil))
			ok(q.Publish("a", "one"))
			ok(q.Publish("b", "two"))
			ok(!q.Publish("a", "bad"))
			equal(q.Consume(), &Message{"a", "one"})
			ok(!q.Publish("a", "bad"))
			equal(q.Consume(), &Message{"b", "two"})
			equal(q.Consume(), (*Message)(nil))
		})
		run("empty strings detached and independent queues", func() {
			a, b := NewMessageQueue(), NewMessageQueue()
			ok(a.Publish("", ""))
			m := a.Consume()
			m.Payload = "bad"
			equal(b.Consume(), (*Message)(nil))
			ok(!a.Publish("", "new"))
		})
	} else {
		run("FIFO ack wrong ID and repeated poll", func() {
			b := need(NewMessageBroker(2))
			ok(b.Publish("a", "A"))
			ok(b.Publish("b", "B"))
			ok(b.Subscribe("g"))
			equal(b.Poll("g"), &Delivery{"a", "A", 1})
			ok(!b.Ack("g", "b"))
			d := b.Poll("g")
			d.Payload = "bad"
			equal(b.Poll("g"), &Delivery{"a", "A", 1})
			ok(b.Ack("g", "a"))
			ok(!b.Ack("g", "a"))
			equal(b.Poll("g"), &Delivery{"b", "B", 1})
			ok(b.Ack("g", "b"))
			equal(b.Poll("g"), (*Delivery)(nil))
		})
		run("independent groups include old retained messages", func() {
			b := need(NewMessageBroker(2))
			b.Publish("a", "A")
			b.Subscribe("x")
			b.Poll("x")
			b.Ack("x", "a")
			ok(b.Subscribe("y"))
			equal(b.Poll("y"), &Delivery{"a", "A", 1})
			ok(!b.Subscribe("x"))
			equal(b.Poll("x"), (*Delivery)(nil))
		})
		run("retry blocks next and ack between retries invalid", func() {
			b := need(NewMessageBroker(2))
			b.Publish("a", "A")
			b.Publish("b", "B")
			b.Subscribe("g")
			b.Poll("g")
			equal(b.Nack("g", "a"), sp("retry"))
			ok(!b.Ack("g", "a"))
			equal(b.Nack("g", "a"), (*string)(nil))
			equal(b.Poll("g"), &Delivery{"a", "A", 2})
			ok(b.Ack("g", "a"))
			equal(b.Poll("g"), &Delivery{"b", "B", 1})
		})
		run("attempt limit dead letters exactly once group local", func() {
			b := need(NewMessageBroker(2))
			b.Publish("a", "A")
			b.Subscribe("x")
			b.Subscribe("y")
			b.Poll("x")
			b.Nack("x", "a")
			b.Poll("x")
			equal(b.Nack("x", "a"), sp("dead-letter"))
			equal(b.Nack("x", "a"), (*string)(nil))
			equal(b.DeadLetters("x"), []DeadLetter{{"a", "A", 2}})
			equal(b.DeadLetters("y"), []DeadLetter{})
			equal(b.Poll("y"), &Delivery{"a", "A", 1})
		})
		run("one attempt failure order and detached dead letters", func() {
			b := need(NewMessageBroker(1))
			b.Subscribe("g")
			for _, id := range []string{"a", "b"} {
				b.Publish(id, id)
				b.Poll("g")
				equal(b.Nack("g", id), sp("dead-letter"))
			}
			v := b.DeadLetters("g")
			v[0].Payload = "bad"
			equal(b.DeadLetters("g"), []DeadLetter{{"a", "a", 1}, {"b", "b", 1}})
		})
		run("unknown groups lifetime publish and independent instances", func() {
			invalid(NewMessageBroker(0))
			b := need(NewMessageBroker(2))
			equal(b.Poll("unknown"), (*Delivery)(nil))
			ok(!b.Ack("unknown", "a"))
			equal(b.Nack("unknown", "a"), (*string)(nil))
			equal(b.DeadLetters("unknown"), []DeadLetter{})
			ok(b.Publish("", ""))
			b.Subscribe("")
			b.Poll("")
			ok(b.Ack("", ""))
			ok(!b.Publish("", "new"))
			equal(need(NewMessageBroker(2)).DeadLetters(""), []DeadLetter{})
		})
	}
	finish()
}
