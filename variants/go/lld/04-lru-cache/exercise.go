package main

type CacheItem struct {
	Key   string
	Value int
}
type LRUCache struct{}

func TouchOrder(a []string, k string) []string         { panic("Implement TouchOrder in exercise.go") }
func NewLRUCache(c int) (*LRUCache, error)             { panic("Implement NewLRUCache in exercise.go") }
func (c *LRUCache) Put(k string, v int) error          { panic("Implement Put in exercise.go") }
func (c *LRUCache) Get(k string, d *int) (*int, error) { panic("Implement Get in exercise.go") }
func (c *LRUCache) Delete(k string) (bool, error)      { panic("Implement Delete in exercise.go") }
func (c *LRUCache) Items() []CacheItem                 { panic("Implement Items in exercise.go") }
