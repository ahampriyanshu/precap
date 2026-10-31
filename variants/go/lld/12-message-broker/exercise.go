package main

type Message struct{ ID, Payload string }
type Delivery struct {
	ID, Payload string
	Attempt     int
}
type DeadLetter struct {
	ID, Payload string
	Attempts    int
}
type MessageQueue struct{}
type MessageBroker struct{}

func NewMessageQueue() *MessageQueue              { panic("Implement NewMessageQueue in exercise.go") }
func (q *MessageQueue) Publish(id, p string) bool { panic("Implement Publish in exercise.go") }
func (q *MessageQueue) Consume() *Message         { panic("Implement Consume in exercise.go") }
func NewMessageBroker(n int) (*MessageBroker, error) {
	panic("Implement NewMessageBroker in exercise.go")
}
func (b *MessageBroker) Publish(id, p string) bool { panic("Implement Publish in exercise.go") }
func (b *MessageBroker) Subscribe(g string) bool   { panic("Implement Subscribe in exercise.go") }
func (b *MessageBroker) Poll(g string) *Delivery   { panic("Implement Poll in exercise.go") }
func (b *MessageBroker) Ack(g, id string) bool     { panic("Implement Ack in exercise.go") }
func (b *MessageBroker) Nack(g, id string) *string { panic("Implement Nack in exercise.go") }
func (b *MessageBroker) DeadLetters(g string) []DeadLetter {
	panic("Implement DeadLetters in exercise.go")
}
