#include "exercise.hpp"
#include <iostream>
#include <sstream>
namespace test {
inline int assertions=0, failures=0, suites=0;
inline void check(bool condition, const char* expression, int line) {
 ++assertions; if(!condition) throw std::runtime_error(std::string("line ")+std::to_string(line)+": "+expression);
}
template<class E, class F> void raises(F&& f) {
 ++assertions; try { f(); } catch(const E&) { return; }
 throw std::runtime_error("expected exception type was not thrown");
}
template<class F> void run(const std::string& name,F&& f) {
 ++suites; try { f(); std::cout << "PASS " << name << '\n'; }
 catch(const std::exception& e) { ++failures; std::cerr << "FAIL " << name << ": " << e.what() << '\n'; }
 catch(...) { ++failures; std::cerr << "FAIL " << name << ": unknown exception\n"; }
}
}
#define CHECK(...) test::check((__VA_ARGS__), #__VA_ARGS__, __LINE__)
#define INVALID(...) test::raises<std::invalid_argument>([&]{ (void)(__VA_ARGS__); })
int main(int argc,char** argv) {
 std::string stage="final";
 if(argc==3 && std::string(argv[1])=="--stage") stage=argv[2];
 else if(argc!=1) { std::cerr << "usage: ./practice --stage prototype|final\n"; return 2; }
 if(stage!="prototype" && stage!="final") {std::cerr << "unknown stage\n"; return 2;}
 const bool final=stage=="final";
if(!final){test::run("exclusive cloned ownership and deep values",[&]{Resource a{"a",{1,2}};auto b=prototype(a);CHECK(b&&b.get()!=&a);CHECK(b->id=="a"&&b->values==a.values);b->values[0]=8;CHECK(a.values[0]==1);auto moved=std::move(b);CHECK(!b&&moved);});}
else{test::run("shared identity weak lifetime pruning and independent caches",[&]{ResourceCache c;auto a=c.acquire("x"),b=c.acquire("x");CHECK(a==b);a->values.push_back(4);CHECK(b->values==Vec<Int>({4}));std::weak_ptr<Resource> weak=a;a.reset();CHECK(!weak.expired());b.reset();CHECK(weak.expired());CHECK(c.slots()==1);auto fresh=c.acquire("x");CHECK(fresh->values.empty());auto y=c.acquire("y");y.reset();CHECK(c.prune()==1);CHECK(c.slots()==1);INVALID(c.acquire(""));CHECK(c.slots()==1);ResourceCache other;CHECK(other.acquire("x")!=fresh);fresh.reset();CHECK(c.prune()==1);CHECK(c.prune()==0);});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
