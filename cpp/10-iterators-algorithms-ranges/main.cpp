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
if(!final){test::run("sort unique empty negative and source preservation",[&]{Vec<Int>v{3,-1,3,2,-1};auto before=v;CHECK(prototype(v)==Vec<Int>({-1,2,3}));CHECK(v==before);CHECK(prototype({}).empty());});}
else{test::run("erase iteration self-alias and independent incoming",[&]{Vec<Int>v{3,-2,1,3},in{4,-3,1};auto before=in;solve(v,in,1);CHECK(v==Vec<Int>({1,3,4}));CHECK(in==before);solve(v,v,3);CHECK(v==Vec<Int>({3,4}));solve(v,{},5);CHECK(v.empty());Vec<Int>empty;solve(empty,empty,0);CHECK(empty.empty());Vec<Int>a{-1,-1,2};solve(a,a,-1);CHECK(a==Vec<Int>({-1,2}));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
