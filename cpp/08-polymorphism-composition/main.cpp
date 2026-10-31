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
struct Failing final:Operation {Int apply(Int)const override{throw std::runtime_error("step");}};
struct Watched final:Operation {Int* destroyed;explicit Watched(Int& n):destroyed(&n){}~Watched()override{++*destroyed;}Int apply(Int v)const override{return v-1;}};
if(!final){test::run("dynamic dispatch through const base reference",[&]{Add a(3);Multiply m(4);CHECK(prototype(a,2)==5);CHECK(prototype(m,2)==8);Failing f;test::raises<std::runtime_error>([&]{prototype(f,1);});});}
else{test::run("owned composition order null rejection cleanup and failures",[&]{Int destroyed=0;{Pipeline p;CHECK(p.run(7)==7);p.add(std::make_unique<Add>(2));p.add(std::make_unique<Multiply>(3));CHECK(p.run(4)==18);auto op=std::make_unique<Watched>(destroyed);p.add(std::move(op));CHECK(!op);CHECK(p.run(4)==17);INVALID(p.add(nullptr));CHECK(p.size()==3);CHECK(destroyed==0);}CHECK(destroyed==1);Pipeline bad;bad.add(std::make_unique<Failing>());test::raises<std::runtime_error>([&]{bad.run(2);});});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
