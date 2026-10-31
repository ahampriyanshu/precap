# Polymorphism and composition

Runtime polymorphism lets a caller use behavior through a stable interface. A virtual destructor is necessary when deleting derived objects through a base owner. Mark overrides explicitly so a const or parameter mismatch becomes a compiler diagnostic rather than an accidental unrelated method.

```cpp
struct Operation {
 virtual ~Operation()=default;
 virtual Int apply(Int value) const=0;
};
```

Passing a derived object by base value slices away its derived state. A reference or pointer preserves dynamic dispatch. An abstract base cannot be stored by value, so a vector of `unique_ptr<Operation>` expresses both heterogeneous behavior and exclusive lifetime. Prefer composition when behavior is a collaborator rather than an is-a relationship; a Pipeline owns operations without inheriting from each operation type.

An interface has behavioral promises beyond method signatures. Each operation must accept the values the pipeline supplies and preserve the error contract. Liskov substitution fails if one implementation unexpectedly mutates shared state or narrows accepted arguments. A const virtual method promises no mutation through its own members unless marked mutable; it does not make external pointees immutable.

```cpp
std::vector<std::unique_ptr<Operation>> operations;
// Each operation transforms the previous result, in insertion order.
```

Throwing from a later operation should propagate normally. Do not catch every failure and return zero, because zero may be a valid result and would erase error information. Owning behavior makes lifetime obvious: destroying the pipeline destroys its operations exactly once. A null operation is rejected at insertion rather than causing a deferred crash during execution. This is a small composition exercise, not a requirement to build class hierarchies for plain records.

## Practice

Provided Operation/Add/Multiply are supporting types. Prototype dispatches apply through const Operation&. Final Pipeline.add takes unique ownership of a nonnull operation; reject null with invalid_argument without adding. run applies operations in insertion order, starting from supplied value; empty pipeline returns it. Propagate operation exceptions. Destroy owned operations exactly once when the pipeline dies. Arithmetic test inputs fit Int. No copying of operations is required.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp
struct Operation {virtual ~Operation()=default;virtual Int apply(Int value) const=0;};
struct Add final:Operation {Int delta;explicit Add(Int delta):delta(delta){} Int apply(Int value)const override{return value+delta;}};
struct Multiply final:Operation {Int factor;explicit Multiply(Int factor):factor(factor){} Int apply(Int value)const override{return value*factor;}};
inline Int prototype(const Operation& operation,Int value);
class Pipeline { public:
Pipeline();
void add(std::unique_ptr<Operation> operation);
Int run(Int value) const;
Int size() const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
