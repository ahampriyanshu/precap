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
 test::run("old minimum increases",[&]{
  auto a0=Vec<Int>{1LL,5LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,9LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"min",1LL,1LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{1LL},Opt<Int>{5LL},Opt<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty values",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"min",0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 0",[&]{
  auto a0=Vec<Int>{-8LL,7LL,2LL,-2LL,-6LL,2LL,-9LL,2LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-8LL},Opt<Int>{-6LL},Opt<Int>{-9LL},Opt<Int>{-2LL},Opt<Int>{-2LL},Opt<Int>{-2LL},Opt<Int>{-6LL},Opt<Int>{-9LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 1",[&]{
  auto a0=Vec<Int>{0LL,4LL,8LL,-1LL,-7LL,-1LL,-1LL,0LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"min",0LL,7LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-1LL},Opt<Int>{-7LL},Opt<Int>{},Opt<Int>{},Opt<Int>{-7LL},Opt<Int>{-7LL},Opt<Int>{},Opt<Int>{-7LL},Opt<Int>{-1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 2",[&]{
  auto a0=Vec<Int>{-3LL,-2LL,-1LL,5LL,-4LL,-7LL,3LL,-5LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"set",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-7LL},Opt<Int>{-2LL},Opt<Int>{-7LL},Opt<Int>{-2LL},Opt<Int>{-7LL},Opt<Int>{-7LL},Opt<Int>{-2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 3",[&]{
  auto a0=Vec<Int>{5LL,-7LL,-8LL,7LL,1LL,0LL,4LL,6LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"min",0LL,7LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-8LL},Opt<Int>{},Opt<Int>{-8LL},Opt<Int>{2LL},Opt<Int>{2LL},Opt<Int>{-8LL},Opt<Int>{-8LL},Opt<Int>{-8LL},Opt<Int>{-8LL},Opt<Int>{-8LL},Opt<Int>{-8LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 4",[&]{
  auto a0=Vec<Int>{1LL,-3LL,2LL,8LL,-1LL,6LL,-9LL,5LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,4LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-3LL},Opt<Int>{-3LL},Opt<Int>{-3LL},Opt<Int>{},Opt<Int>{-3LL},Opt<Int>{-3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 5",[&]{
  auto a0=Vec<Int>{-7LL,8LL,7LL,3LL,3LL,0LL,-4LL,-2LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,4LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,7LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{0LL},Opt<Int>{0LL},Opt<Int>{2LL},Opt<Int>{-4LL},Opt<Int>{7LL},Opt<Int>{3LL},Opt<Int>{4LL},Opt<Int>{-4LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 6",[&]{
  auto a0=Vec<Int>{3LL,1LL,-6LL,7LL,0LL,-2LL,5LL,-7LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,7LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-6LL},Opt<Int>{-6LL},Opt<Int>{-6LL},Opt<Int>{-7LL},Opt<Int>{-7LL},Opt<Int>{-7LL},Opt<Int>{8LL},Opt<Int>{1LL},Opt<Int>{},Opt<Int>{1LL},Opt<Int>{-7LL},Opt<Int>{},Opt<Int>{1LL},Opt<Int>{-6LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 7",[&]{
  auto a0=Vec<Int>{7LL,8LL,-2LL,3LL,-1LL,3LL,-4LL,2LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,4LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{},Opt<Int>{-4LL},Opt<Int>{-2LL},Opt<Int>{-4LL},Opt<Int>{1LL},Opt<Int>{-2LL},Opt<Int>{-2LL},Opt<Int>{-2LL},Opt<Int>{-2LL},Opt<Int>{},Opt<Int>{6LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 8",[&]{
  auto a0=Vec<Int>{-7LL,7LL,-4LL,-1LL,-8LL,-7LL,3LL,1LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-8LL},Opt<Int>{-4LL},Opt<Int>{-4LL},Opt<Int>{-4LL},Opt<Int>{-4LL},Opt<Int>{-8LL},Opt<Int>{-8LL},Opt<Int>{-4LL},Opt<Int>{2LL},Opt<Int>{-8LL},Opt<Int>{2LL},Opt<Int>{-8LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 9",[&]{
  auto a0=Vec<Int>{0LL,-8LL,7LL,-2LL,-6LL,-1LL,1LL,-1LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-8LL},Opt<Int>{-8LL},Opt<Int>{},Opt<Int>{1LL},Opt<Int>{-8LL},Opt<Int>{2LL},Opt<Int>{2LL},Opt<Int>{},Opt<Int>{-8LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 10",[&]{
  auto a0=Vec<Int>{8LL,-3LL,-2LL,-2LL,5LL,5LL,4LL,-7LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,5LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"min",0LL,5LL},std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-3LL},Opt<Int>{-3LL},Opt<Int>{},Opt<Int>{-3LL},Opt<Int>{-3LL},Opt<Int>{-3LL},Opt<Int>{-3LL},Opt<Int>{2LL},Opt<Int>{},Opt<Int>{0LL},Opt<Int>{-3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point replacements 11",[&]{
  auto a0=Vec<Int>{-3LL,0LL,-8LL,-2LL,-6LL,6LL,5LL,-3LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"min",0LL,3LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"set",0LL,6LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,2LL},std::tuple<std::string,Int,Int>{"min",0LL,0LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,0LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"set",0LL,7LL},std::tuple<std::string,Int,Int>{"min",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,8LL},std::tuple<std::string,Int,Int>{"min",0LL,4LL},std::tuple<std::string,Int,Int>{"set",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,1LL},std::tuple<std::string,Int,Int>{"min",0LL,7LL},std::tuple<std::string,Int,Int>{"set",0LL,2LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Opt<Int>>{Opt<Int>{-8LL},Opt<Int>{-3LL},Opt<Int>{0LL},Opt<Int>{},Opt<Int>{0LL},Opt<Int>{-8LL},Opt<Int>{-8LL},Opt<Int>{-8LL},Opt<Int>{-8LL},Opt<Int>{1LL},Opt<Int>{-8LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"set",1LL,2LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"min",0LL,2LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"add",0LL,2LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
