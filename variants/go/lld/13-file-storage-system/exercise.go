package main

type File struct {
	Name      string
	Size      int
	ExpiresAt *int
}
type FileCatalog struct{}
type FileStorage struct{}

func NewFileCatalog() *FileCatalog                          { panic("Implement NewFileCatalog in exercise.go") }
func (c *FileCatalog) Upload(n string, s int) (bool, error) { panic("Implement Upload in exercise.go") }
func (c *FileCatalog) Get(n string) *int                    { panic("Implement Get in exercise.go") }
func NewFileStorage(q int) (*FileStorage, error)            { panic("Implement NewFileStorage in exercise.go") }
func (s *FileStorage) AdvanceTo(t int) error                { panic("Implement AdvanceTo in exercise.go") }
func (s *FileStorage) Upload(n string, v int, ttl *int) (bool, error) {
	panic("Implement Upload in exercise.go")
}
func (s *FileStorage) Get(n string) *File             { panic("Implement Get in exercise.go") }
func (s *FileStorage) Copy(a, b string) (bool, error) { panic("Implement Copy in exercise.go") }
func (s *FileStorage) Delete(n string) bool           { panic("Implement Delete in exercise.go") }
func (s *FileStorage) Usage() int                     { panic("Implement Usage in exercise.go") }
func (s *FileStorage) Search(p string, n int) ([]File, error) {
	panic("Implement Search in exercise.go")
}
