package main

type Field struct{ Name, Value string }
type RecordStore struct{}
type TemporalDatabase struct{}

func NewRecordStore() *RecordStore              { panic("Implement NewRecordStore in exercise.go") }
func (s *RecordStore) Set(k, f, v string)       { panic("Implement Set in exercise.go") }
func (s *RecordStore) Get(k, f string) *string  { panic("Implement Get in exercise.go") }
func (s *RecordStore) Scan(k, p string) []Field { panic("Implement Scan in exercise.go") }
func NewTemporalDatabase() *TemporalDatabase    { panic("Implement NewTemporalDatabase in exercise.go") }
func (s *TemporalDatabase) Set(t int, k, f, v string, ttl *int) error {
	panic("Implement Set in exercise.go")
}
func (s *TemporalDatabase) Get(t int, k, f string) (*string, error) {
	panic("Implement Get in exercise.go")
}
func (s *TemporalDatabase) Delete(t int, k, f string) (bool, error) {
	panic("Implement Delete in exercise.go")
}
func (s *TemporalDatabase) CompareAndSet(t int, k, f, e, v string, ttl *int) (bool, error) {
	panic("Implement CompareAndSet in exercise.go")
}
func (s *TemporalDatabase) Scan(t int, k, p string) ([]Field, error) {
	panic("Implement Scan in exercise.go")
}
func (s *TemporalDatabase) GetAt(t int, k, f string, a int) (*string, error) {
	panic("Implement GetAt in exercise.go")
}
