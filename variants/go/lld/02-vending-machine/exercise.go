package main

type Product struct {
	Code         string
	Price, Stock int
}
type Stock struct{ Price, Stock int }
type Sale struct {
	Code   string
	Change int
}
type VendingMachine struct{}

func ChangeDue(p, a int) (int, error) { panic("Implement ChangeDue in exercise.go") }
func NewVendingMachine(a []Product) (*VendingMachine, error) {
	panic("Implement NewVendingMachine in exercise.go")
}
func (m *VendingMachine) Insert(a int) (int, error)      { panic("Implement Insert in exercise.go") }
func (m *VendingMachine) Balance() int                   { panic("Implement Balance in exercise.go") }
func (m *VendingMachine) Select(c string) (*Sale, error) { panic("Implement Select in exercise.go") }
func (m *VendingMachine) Refund() int                    { panic("Implement Refund in exercise.go") }
func (m *VendingMachine) Inventory() map[string]Stock    { panic("Implement Inventory in exercise.go") }
