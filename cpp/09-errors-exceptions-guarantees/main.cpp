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
if(!final){test::run("absence differs from stored zero",[&]{CHECK(prototype({0,4},0)==0);CHECK(prototype({0,4},1)==4);CHECK(!prototype({0,4},-1));CHECK(!prototype({},0));});}
else{test::run("candidate rollback after callback and later validation failures",[&]{Vec<Int>v{1,2};auto before=v;Int calls=0;test::raises<std::runtime_error>([&]{solve(v,{{0,3},{1,4}},[&](Int i){++calls;if(i==1)throw std::runtime_error("callback");});});CHECK(calls==2&&v==before);INVALID(solve(v,{{0,3},{9,1}},[](Int){}));CHECK(v==before);solve(v,{{0,3},{0,-1},{1,4}},[](Int){});CHECK(v==Vec<Int>({3,6}));Vec<Int>max{std::numeric_limits<Int>::max()};INVALID(solve(max,{{0,1}},[](Int){}));CHECK(max[0]==std::numeric_limits<Int>::max());solve(v,{},[](Int){throw std::runtime_error("unused");});CHECK(v==Vec<Int>({3,6}));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
