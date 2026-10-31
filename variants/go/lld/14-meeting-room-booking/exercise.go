package main

type Reservation struct {
	ID                string
	Start, End, Seats int
}
type RoomCalendar struct{}
type MeetingRoomBooking struct{}

func NewRoomCalendar() *RoomCalendar                   { panic("Implement NewRoomCalendar in exercise.go") }
func (c *RoomCalendar) Reserve(a, b int) (bool, error) { panic("Implement Reserve in exercise.go") }
func (c *RoomCalendar) Slots() [][2]int                { panic("Implement Slots in exercise.go") }
func NewMeetingRoomBooking(r map[string]int) (*MeetingRoomBooking, error) {
	panic("Implement NewMeetingRoomBooking in exercise.go")
}
func (m *MeetingRoomBooking) Book(id string, a, b, seats, count int) ([]string, error) {
	panic("Implement Book in exercise.go")
}
func (m *MeetingRoomBooking) Cancel(id string) bool { panic("Implement Cancel in exercise.go") }
func (m *MeetingRoomBooking) Allocation(id string) []string {
	panic("Implement Allocation in exercise.go")
}
func (m *MeetingRoomBooking) Schedule(r string) ([]Reservation, error) {
	panic("Implement Schedule in exercise.go")
}
