package main

type TransferResult struct{ SourceBalance, TargetBalance int }
type Spending struct {
	AccountID string
	Total     int
}
type BalanceAccount struct{}
type Bank struct{}

func NewBalanceAccount() *BalanceAccount               { panic("Implement NewBalanceAccount in exercise.go") }
func (a *BalanceAccount) Balance() int                 { panic("Implement Balance in exercise.go") }
func (a *BalanceAccount) Deposit(v int) (int, error)   { panic("Implement Deposit in exercise.go") }
func (a *BalanceAccount) Withdraw(v int) (bool, error) { panic("Implement Withdraw in exercise.go") }
func NewBank() *Bank                                   { panic("Implement NewBank in exercise.go") }
func (b *Bank) CreateAccount(id string) (bool, error) {
	panic("Implement CreateAccount in exercise.go")
}
func (b *Bank) Balance(id string) (*int, error)        { panic("Implement Balance in exercise.go") }
func (b *Bank) Deposit(id string, a int) (*int, error) { panic("Implement Deposit in exercise.go") }
func (b *Bank) Transfer(id, s, t string, a int) (*TransferResult, error) {
	panic("Implement Transfer in exercise.go")
}
func (b *Bank) TopSpenders(n int) ([]Spending, error) { panic("Implement TopSpenders in exercise.go") }
