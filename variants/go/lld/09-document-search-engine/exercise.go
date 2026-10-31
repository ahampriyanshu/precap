package main

type Hit struct {
	DocumentID string
	Score      int
}
type SearchStats struct{ Documents, Tokens int }
type SearchEngine struct{}

func Tokenize(t string) []string                          { panic("Implement Tokenize in exercise.go") }
func NewSearchEngine() *SearchEngine                      { panic("Implement NewSearchEngine in exercise.go") }
func (s *SearchEngine) Add(id, t string) (bool, error)    { panic("Implement Add in exercise.go") }
func (s *SearchEngine) Get(id string) (*string, error)    { panic("Implement Get in exercise.go") }
func (s *SearchEngine) Update(id, t string) (bool, error) { panic("Implement Update in exercise.go") }
func (s *SearchEngine) Delete(id string) (bool, error)    { panic("Implement Delete in exercise.go") }
func (s *SearchEngine) Search(t string, n int) ([]Hit, error) {
	panic("Implement Search in exercise.go")
}
func (s *SearchEngine) SearchPhrase(t string, n int) ([]Hit, error) {
	panic("Implement SearchPhrase in exercise.go")
}
func (s *SearchEngine) Stats() SearchStats { panic("Implement Stats in exercise.go") }
