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
static_assert(std::is_copy_constructible_v<Packet> && std::is_move_constructible_v<Packet>);
if(!final){test::run("by-value parameter copies lvalues and owns nested storage",[&]{Packet a{{1,2}};auto b=prototype(a,3);CHECK(a.values==Vec<Int>({1,2}));CHECK(b.values==Vec<Int>({1,2,3}));b.values[0]=9;CHECK(a.values[0]==1);CHECK(prototype(Packet{},4).values==Vec<Int>({4}));});}
else{test::run("drain transfers inner allocation order and validates before move",[&]{Vec<Packet>source{{{1,2}},{{3}},{{4,5}}};auto p0=source[0].values.data(),p1=source[1].values.data();auto before=source;INVALID(solve(source,4));INVALID(solve(source,-1));CHECK(source==before);CHECK(solve(source,0).empty());auto out=solve(source,2);CHECK(out==Vec<Packet>({{{1,2}},{{3}}}));CHECK(out[0].values.data()==p0&&out[1].values.data()==p1);CHECK(source==Vec<Packet>({{{4,5}}}));out[0].values[0]=8;CHECK(source[0].values[0]==4);auto rest=solve(source,1);CHECK(source.empty());CHECK(rest[0].values==Vec<Int>({4,5}));CHECK(solve(source,0).empty());});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
