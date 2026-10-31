package main

type Event struct {
	Key   string
	Delta int
}
type Counter struct{}

func Prototype(a []Event) map[string]int    { panic("Implement Prototype in exercise.go") }
func (c *Counter) Add(k string, d int) int  { panic("Implement Add in exercise.go") }
func (c *Counter) Get(k string) int         { panic("Implement Get in exercise.go") }
func (c *Counter) Snapshot() map[string]int { panic("Implement Snapshot in exercise.go") }
func (c *Counter) Drain() map[string]int    { panic("Implement Drain in exercise.go") }
