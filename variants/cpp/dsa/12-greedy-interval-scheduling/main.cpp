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
 auto fn=final ? solve : prototype;
 test::run("earliest-start trap",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"long",0LL,10LL},std::tuple<std::string,Int,Int>{"a",1LL,2LL},std::tuple<std::string,Int,Int>{"b",2LL,3LL},std::tuple<std::string,Int,Int>{"c",3LL,4LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"a","b","c"});
  CHECK(a0 == before0);
 });
 test::run("tie and touching",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"b",0LL,2LL},std::tuple<std::string,Int,Int>{"a",0LL,2LL},std::tuple<std::string,Int,Int>{"c",2LL,3LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"a","c"});
  CHECK(a0 == before0);
 });
 test::run("empty schedule",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 1",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",4LL,8LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j0"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 2",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",8LL,13LL},std::tuple<std::string,Int,Int>{"j1",2LL,5LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j1","j0"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 3",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",5LL,9LL},std::tuple<std::string,Int,Int>{"j1",7LL,9LL},std::tuple<std::string,Int,Int>{"j2",6LL,11LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j0"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 4",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",-2LL,-1LL},std::tuple<std::string,Int,Int>{"j1",5LL,7LL},std::tuple<std::string,Int,Int>{"j2",-3LL,0LL},std::tuple<std::string,Int,Int>{"j3",2LL,6LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j0","j3"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 5",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",1LL,5LL},std::tuple<std::string,Int,Int>{"j1",0LL,2LL},std::tuple<std::string,Int,Int>{"j2",-2LL,-1LL},std::tuple<std::string,Int,Int>{"j3",4LL,6LL},std::tuple<std::string,Int,Int>{"j4",4LL,9LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j2","j1","j3"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 6",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",0LL,4LL},std::tuple<std::string,Int,Int>{"j1",1LL,2LL},std::tuple<std::string,Int,Int>{"j2",2LL,4LL},std::tuple<std::string,Int,Int>{"j3",0LL,3LL},std::tuple<std::string,Int,Int>{"j4",-1LL,3LL},std::tuple<std::string,Int,Int>{"j5",0LL,4LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j1","j2"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 7",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",2LL,6LL},std::tuple<std::string,Int,Int>{"j1",-2LL,1LL},std::tuple<std::string,Int,Int>{"j2",6LL,8LL},std::tuple<std::string,Int,Int>{"j3",-1LL,1LL},std::tuple<std::string,Int,Int>{"j4",-4LL,1LL},std::tuple<std::string,Int,Int>{"j5",9LL,12LL},std::tuple<std::string,Int,Int>{"j6",6LL,8LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j4","j0","j2","j5"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 8",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",8LL,9LL},std::tuple<std::string,Int,Int>{"j1",-1LL,2LL},std::tuple<std::string,Int,Int>{"j2",3LL,4LL},std::tuple<std::string,Int,Int>{"j3",6LL,9LL},std::tuple<std::string,Int,Int>{"j4",4LL,7LL},std::tuple<std::string,Int,Int>{"j5",3LL,4LL},std::tuple<std::string,Int,Int>{"j6",0LL,3LL},std::tuple<std::string,Int,Int>{"j7",9LL,12LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j1","j2","j4","j0","j7"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 9",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",-4LL,-1LL},std::tuple<std::string,Int,Int>{"j1",8LL,12LL},std::tuple<std::string,Int,Int>{"j2",6LL,8LL},std::tuple<std::string,Int,Int>{"j3",0LL,5LL},std::tuple<std::string,Int,Int>{"j4",1LL,4LL},std::tuple<std::string,Int,Int>{"j5",9LL,11LL},std::tuple<std::string,Int,Int>{"j6",2LL,3LL},std::tuple<std::string,Int,Int>{"j7",-4LL,-1LL},std::tuple<std::string,Int,Int>{"j8",6LL,11LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j0","j6","j2","j5"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 10",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",8LL,11LL},std::tuple<std::string,Int,Int>{"j1",-3LL,1LL},std::tuple<std::string,Int,Int>{"j2",-1LL,4LL},std::tuple<std::string,Int,Int>{"j3",7LL,10LL},std::tuple<std::string,Int,Int>{"j4",6LL,11LL},std::tuple<std::string,Int,Int>{"j5",0LL,5LL},std::tuple<std::string,Int,Int>{"j6",0LL,3LL},std::tuple<std::string,Int,Int>{"j7",-2LL,3LL},std::tuple<std::string,Int,Int>{"j8",1LL,3LL},std::tuple<std::string,Int,Int>{"j9",9LL,13LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j1","j8","j3"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 11",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",0LL,1LL},std::tuple<std::string,Int,Int>{"j1",2LL,5LL},std::tuple<std::string,Int,Int>{"j2",-3LL,-2LL},std::tuple<std::string,Int,Int>{"j3",-3LL,-2LL},std::tuple<std::string,Int,Int>{"j4",9LL,10LL},std::tuple<std::string,Int,Int>{"j5",-4LL,-1LL},std::tuple<std::string,Int,Int>{"j6",-4LL,0LL},std::tuple<std::string,Int,Int>{"j7",3LL,8LL},std::tuple<std::string,Int,Int>{"j8",-3LL,0LL},std::tuple<std::string,Int,Int>{"j9",9LL,14LL},std::tuple<std::string,Int,Int>{"j10",-1LL,0LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j2","j10","j0","j1","j4"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 12",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",2LL,6LL},std::tuple<std::string,Int,Int>{"j1",-4LL,-1LL},std::tuple<std::string,Int,Int>{"j2",-1LL,3LL},std::tuple<std::string,Int,Int>{"j3",-2LL,0LL},std::tuple<std::string,Int,Int>{"j4",2LL,7LL},std::tuple<std::string,Int,Int>{"j5",4LL,7LL},std::tuple<std::string,Int,Int>{"j6",4LL,7LL},std::tuple<std::string,Int,Int>{"j7",-3LL,2LL},std::tuple<std::string,Int,Int>{"j8",-2LL,3LL},std::tuple<std::string,Int,Int>{"j9",5LL,8LL},std::tuple<std::string,Int,Int>{"j10",6LL,11LL},std::tuple<std::string,Int,Int>{"j11",8LL,11LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j1","j2","j5","j11"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 13",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",2LL,4LL},std::tuple<std::string,Int,Int>{"j1",1LL,4LL},std::tuple<std::string,Int,Int>{"j2",6LL,10LL},std::tuple<std::string,Int,Int>{"j3",-2LL,2LL},std::tuple<std::string,Int,Int>{"j4",8LL,10LL},std::tuple<std::string,Int,Int>{"j5",2LL,5LL},std::tuple<std::string,Int,Int>{"j6",6LL,9LL},std::tuple<std::string,Int,Int>{"j7",3LL,7LL},std::tuple<std::string,Int,Int>{"j8",5LL,7LL},std::tuple<std::string,Int,Int>{"j9",4LL,8LL},std::tuple<std::string,Int,Int>{"j10",6LL,10LL},std::tuple<std::string,Int,Int>{"j11",1LL,3LL},std::tuple<std::string,Int,Int>{"j12",0LL,3LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j3","j0","j8","j4"});
  CHECK(a0 == before0);
 });
 test::run("generated schedule 14",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"j0",6LL,7LL},std::tuple<std::string,Int,Int>{"j1",0LL,5LL},std::tuple<std::string,Int,Int>{"j2",9LL,14LL},std::tuple<std::string,Int,Int>{"j3",1LL,2LL},std::tuple<std::string,Int,Int>{"j4",8LL,9LL},std::tuple<std::string,Int,Int>{"j5",7LL,11LL},std::tuple<std::string,Int,Int>{"j6",3LL,8LL},std::tuple<std::string,Int,Int>{"j7",7LL,8LL},std::tuple<std::string,Int,Int>{"j8",-4LL,1LL},std::tuple<std::string,Int,Int>{"j9",5LL,9LL},std::tuple<std::string,Int,Int>{"j10",9LL,10LL},std::tuple<std::string,Int,Int>{"j11",-3LL,0LL},std::tuple<std::string,Int,Int>{"j12",0LL,1LL},std::tuple<std::string,Int,Int>{"j13",0LL,3LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<std::string>{"j11","j12","j3","j0","j7","j4","j10"});
  CHECK(a0 == before0);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"x",2LL,2LL}}; auto before0=a0;
  INVALID(fn(a0));
  CHECK(a0 == before0);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
