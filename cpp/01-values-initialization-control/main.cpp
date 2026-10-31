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
if(!final){test::run("signed categories and endpoints",[&]{CHECK(prototype(-1)=="negative");CHECK(prototype(0)=="zero");CHECK(prototype(1)=="positive");CHECK(prototype(std::numeric_limits<Int>::min())=="negative");CHECK(prototype(std::numeric_limits<Int>::max())=="positive");});}
else{test::run("strict grammar signs and zero presence",[&]{CHECK(solve("0")==0);CHECK(solve("-0")==0);CHECK(solve("+00042")==42);CHECK(solve("-17")==-17);for(auto s:{"","+","-"," 1","1 ","1x","--1","1_0"})CHECK(!solve(s));});test::run("overflow checked before arithmetic",[&]{CHECK(solve("9223372036854775807")==std::numeric_limits<Int>::max());CHECK(solve("-9223372036854775808")==std::numeric_limits<Int>::min());CHECK(!solve("9223372036854775808"));CHECK(!solve("-9223372036854775809"));CHECK(!solve("999999999999999999999999999999999999"));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
