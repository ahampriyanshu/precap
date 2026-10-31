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
if(!final){test::run("strict expiration boundary overfull and invalid histories",[&]{Vec<Int>a{0,1,1};auto before=a;CHECK(allow_request(a,2,2,2)==std::pair<bool,Vec<Int>>{false,{1,1}});CHECK(a==before);CHECK(allow_request({0},1,2,2)==std::pair<bool,Vec<Int>>{true,{2}});INVALID(allow_request({2,1},3,5,3));INVALID(allow_request({},0,1,0));});}
else{test::run("denial advances per-client time and snapshots",[&]{SlidingWindowLimiter l(1,2);CHECK(l.allow("a",0));CHECK(!l.allow("a",1));INVALID(l.allow("a",0));CHECK(l.allow("b",0));CHECK(l.allow("a",2));auto h=l.history("a");h.clear();CHECK(l.history("a")==Vec<Int>({2}));CHECK(l.history("unknown").empty());INVALID(l.allow("",3));CHECK(!l.allow("a",2));CHECK(l.allow("a",20));SlidingWindowLimiter other(1,1);CHECK(other.history("a").empty());INVALID(SlidingWindowLimiter(1,0));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("denied requests do not enter history and reads never expire",[&]{SlidingWindowLimiter l(2,3);CHECK(l.allow("a",0));CHECK(l.allow("a",1));CHECK(!l.allow("a",2));CHECK(l.history("a")==Vec<Int>({0,1}));CHECK(l.history("a")==Vec<Int>({0,1}));CHECK(l.allow("a",3));CHECK(l.history("a")==Vec<Int>({1,3}));CHECK(!l.allow("a",3));INVALID(l.allow("a",2));CHECK(l.history("a")==Vec<Int>({1,3}));CHECK(l.allow("b",0));INVALID(l.history(""));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
