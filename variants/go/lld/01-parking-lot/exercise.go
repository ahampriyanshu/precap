package main

type Spot struct{ ID, Kind string }
type Ticket struct {
	TicketID                       int
	VehicleID, VehicleKind, SpotID string
}
type ParkingLot struct{}

func ChooseSpot(s []Spot, k string) (*string, error)    { panic("Implement ChooseSpot in exercise.go") }
func NewParkingLot(s []Spot) (*ParkingLot, error)       { panic("Implement NewParkingLot in exercise.go") }
func (l *ParkingLot) Park(v, k string) (*Ticket, error) { panic("Implement Park in exercise.go") }
func (l *ParkingLot) Release(id int) *Ticket            { panic("Implement Release in exercise.go") }
func (l *ParkingLot) ActiveTickets() []Ticket           { panic("Implement ActiveTickets in exercise.go") }
func (l *ParkingLot) AvailableSpots() []Spot            { panic("Implement AvailableSpots in exercise.go") }
