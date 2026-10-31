package main

type Draft struct {
	Name               string
	Ingredients, Steps []string
}
type Recipe struct {
	ID                 string
	Version            int
	Name               string
	Ingredients, Steps []string
}
type RecipeDraft struct{}
type RecipeManager struct{}

func NewRecipeDraft(n string, i, s []string) *RecipeDraft {
	panic("Implement NewRecipeDraft in exercise.go")
}
func (d *RecipeDraft) Snapshot() Draft { panic("Implement Snapshot in exercise.go") }
func NewRecipeManager() *RecipeManager { panic("Implement NewRecipeManager in exercise.go") }
func (m *RecipeManager) AddUser(u string, p []string) (bool, error) {
	panic("Implement AddUser in exercise.go")
}
func (m *RecipeManager) Add(u, n string, i, s []string) (*string, error) {
	panic("Implement Add in exercise.go")
}
func (m *RecipeManager) Update(u, id, n string, i, s []string) (*int, error) {
	panic("Implement Update in exercise.go")
}
func (m *RecipeManager) Get(u, id string, v *int) *Recipe { panic("Implement Get in exercise.go") }
func (m *RecipeManager) History(u, id string) []Recipe    { panic("Implement History in exercise.go") }
func (m *RecipeManager) Rollback(u, id string, v int) *int {
	panic("Implement Rollback in exercise.go")
}
func (m *RecipeManager) ByIngredient(u, i string) []string {
	panic("Implement ByIngredient in exercise.go")
}
