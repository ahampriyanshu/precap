package main

type Settlement struct {
	Debtor, Creditor string
	Amount           int
}
type ExpenseSharing struct{}

func SplitEqual(t int, a []string) (map[string]int, error) {
	panic("Implement SplitEqual in exercise.go")
}
func NewExpenseSharing(a []string) (*ExpenseSharing, error) {
	panic("Implement NewExpenseSharing in exercise.go")
}
func (m *ExpenseSharing) AddExpense(id, p string, t int, a []string) (bool, error) {
	panic("Implement AddExpense in exercise.go")
}
func (m *ExpenseSharing) Settle(id, d, c string, a int) (bool, error) {
	panic("Implement Settle in exercise.go")
}
func (m *ExpenseSharing) Balances() map[string]int { panic("Implement Balances in exercise.go") }
func (m *ExpenseSharing) SuggestSettlements() []Settlement {
	panic("Implement SuggestSettlements in exercise.go")
}
