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
if(!final){test::run("first occurrence pointer identity const reads and absent",[&]{Vec<Int> v{2,1,2};CHECK(prototype(v,2)==v.data());CHECK(prototype(v,1)==v.data()+1);CHECK(!prototype(v,9));CHECK(!prototype({},1));});}
else{test::run("borrowed subspan preserves address and observes owner mutation",[&]{Vec<Int> v{1,2,3,2,3},n{2,3};auto out=solve(v,n);CHECK(out&&out->size()==2);CHECK(out->data()==v.data()+1);v[1]=8;CHECK((*out)[0]==8);CHECK(!solve(v,Vec<Int>{9}));CHECK(!solve(v,Vec<Int>{1,2,3,4,5,6}));CHECK(solve(v,{})->data()==v.data());CHECK(solve({},{})->empty());CHECK(v==Vec<Int>({1,8,3,2,3}));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
