package main

type KeyValueStore struct{}
type TransactionalStore struct{}

func NewKeyValueStore() *KeyValueStore        { panic("Implement NewKeyValueStore in exercise.go") }
func (s *KeyValueStore) Set(k, v string)      { panic("Implement Set in exercise.go") }
func (s *KeyValueStore) Get(k string) *string { panic("Implement Get in exercise.go") }
func (s *KeyValueStore) Delete(k string) bool { panic("Implement Delete in exercise.go") }
func NewTransactionalStore() *TransactionalStore {
	panic("Implement NewTransactionalStore in exercise.go")
}
func (s *TransactionalStore) Set(k, v string)        { panic("Implement Set in exercise.go") }
func (s *TransactionalStore) Get(k string) *string   { panic("Implement Get in exercise.go") }
func (s *TransactionalStore) Delete(k string) bool   { panic("Implement Delete in exercise.go") }
func (s *TransactionalStore) Begin() int             { panic("Implement Begin in exercise.go") }
func (s *TransactionalStore) Commit() (int, error)   { panic("Implement Commit in exercise.go") }
func (s *TransactionalStore) Rollback() (int, error) { panic("Implement Rollback in exercise.go") }
func (s *TransactionalStore) Depth() int             { panic("Implement Depth in exercise.go") }
func (s *TransactionalStore) Snapshot(p string) map[string]string {
	panic("Implement Snapshot in exercise.go")
}
