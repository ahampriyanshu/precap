package main

type QueuedTask struct {
	ID   int
	Name string
}
type Task struct {
	ID               int
	Name             string
	Priority         int
	Status           string
	Worker           *string
	ExpiresAt, Token *int
}
type PriorityQueue struct{}
type TaskScheduler struct{}

func NewPriorityQueue() *PriorityQueue               { panic("Implement NewPriorityQueue in exercise.go") }
func (q *PriorityQueue) Add(n string, p int) int     { panic("Implement Add in exercise.go") }
func (q *PriorityQueue) Pop() *QueuedTask            { panic("Implement Pop in exercise.go") }
func NewTaskScheduler() *TaskScheduler               { panic("Implement NewTaskScheduler in exercise.go") }
func (s *TaskScheduler) AddTask(n string, p int) int { panic("Implement AddTask in exercise.go") }
func (s *TaskScheduler) AddWorker(w string, c int) (bool, error) {
	panic("Implement AddWorker in exercise.go")
}
func (s *TaskScheduler) Dispatch(t int, w string, l int) (*Task, error) {
	panic("Implement Dispatch in exercise.go")
}
func (s *TaskScheduler) Complete(t, id, tok int) (bool, error) {
	panic("Implement Complete in exercise.go")
}
func (s *TaskScheduler) GetTask(t, id int) (*Task, error) { panic("Implement GetTask in exercise.go") }
func (s *TaskScheduler) Active(t int, w string) ([]Task, error) {
	panic("Implement Active in exercise.go")
}
