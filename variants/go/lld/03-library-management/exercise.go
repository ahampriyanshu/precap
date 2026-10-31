package main

type AvailableCopy struct {
	ID, Title string
	Available bool
}
type BookCopy struct{ ID, Title string }
type Loan struct{ CopyID, Title, MemberID string }
type Library struct{}

func AvailableCopies(a []AvailableCopy, t string) []string {
	panic("Implement AvailableCopies in exercise.go")
}
func NewLibrary(a []BookCopy) (*Library, error)        { panic("Implement NewLibrary in exercise.go") }
func (l *Library) Borrow(m, t string) (*string, error) { panic("Implement Borrow in exercise.go") }
func (l *Library) ReturnCopy(id, m string) (bool, error) {
	panic("Implement ReturnCopy in exercise.go")
}
func (l *Library) Available(t string) ([]string, error) { panic("Implement Available in exercise.go") }
func (l *Library) Loans() []Loan                        { panic("Implement Loans in exercise.go") }
