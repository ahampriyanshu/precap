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
if(!final){test::run("constructor and bounded stock invariant",[&]{CHECK(prototype(5,{2,4,1})==ReservationSnapshot{5,3});CHECK(prototype(0,{0,1})==ReservationSnapshot{0,0});INVALID(Stock(-1));Stock s(5);CHECK(s.reserve(5));CHECK(!s.reserve(1));INVALID(s.release(6));CHECK(s.snapshot().used==5);s.release(5);CHECK(s.snapshot().used==0);});}
else{test::run("scope exit cleanup normal and exception unwinding",[&]{Stock s(5);CHECK(s.reserve(1));CHECK(solve(s,3,false)==ReservationSnapshot{5,4});CHECK(s.snapshot()==ReservationSnapshot{5,1});test::raises<std::runtime_error>([&]{solve(s,3,true);});CHECK(s.snapshot().used==1);CHECK(solve(s,9,true)==ReservationSnapshot{5,1});INVALID(solve(s,-1,false));CHECK(s.snapshot().used==1);CHECK(solve(s,0,false).used==1);});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
