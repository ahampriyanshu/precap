package main

type Decision struct {
	Allowed bool
	History []int
}
type SlidingWindowLimiter struct{}

func AllowRequest(a []int, l, w, n int) (Decision, error) {
	panic("Implement AllowRequest in exercise.go")
}
func NewSlidingWindowLimiter(l, w int) (*SlidingWindowLimiter, error) {
	panic("Implement NewSlidingWindowLimiter in exercise.go")
}
func (l *SlidingWindowLimiter) Allow(c string, n int) (bool, error) {
	panic("Implement Allow in exercise.go")
}
func (l *SlidingWindowLimiter) History(c string) ([]int, error) {
	panic("Implement History in exercise.go")
}
