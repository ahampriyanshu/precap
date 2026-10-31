package main

type MeterSnapshot struct {
	Label string
	Total int
}
type Meter struct{}

func AddValue(s MeterSnapshot, d int) (MeterSnapshot, error) {
	panic("Implement AddValue in exercise.go")
}
func NewMeter(l string) (*Meter, error)  { panic("Implement NewMeter in exercise.go") }
func (m *Meter) Add(d int) (int, error)  { panic("Implement Add in exercise.go") }
func (m *Meter) Reset() int              { panic("Implement Reset in exercise.go") }
func (m *Meter) Snapshot() MeterSnapshot { panic("Implement Snapshot in exercise.go") }
