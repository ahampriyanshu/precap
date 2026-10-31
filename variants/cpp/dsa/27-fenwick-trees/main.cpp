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
 test::run("correction invalidates prefix",[&]{
  auto a0=Vec<Int>{2LL,4LL,6LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,3LL},std::tuple<std::string,Int,Int>{"add",0LL,-5LL},std::tuple<std::string,Int,Int>{"sum",0LL,2LL},std::tuple<std::string,Int,Int>{"sum",2LL,2LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{12LL,1LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty values",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 0",[&]{
  auto a0=Vec<Int>{3LL,3LL,7LL,0LL,0LL,2LL,8LL,4LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,3LL},std::tuple<std::string,Int,Int>{"sum",0LL,4LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,3LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,3LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,5LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{13LL,13LL,3LL,23LL,28LL,37LL,27LL,39LL,44LL,52LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 1",[&]{
  auto a0=Vec<Int>{0LL,9LL,2LL,4LL,1LL,8LL,3LL,6LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,1LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,1LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{15LL,60LL,55LL,50LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 2",[&]{
  auto a0=Vec<Int>{1LL,5LL,8LL,7LL,6LL,6LL,7LL,9LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,3LL},std::tuple<std::string,Int,Int>{"sum",0LL,4LL},std::tuple<std::string,Int,Int>{"sum",0LL,2LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,2LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,2LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{40LL,24LL,9LL,32LL,75LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 3",[&]{
  auto a0=Vec<Int>{6LL,0LL,5LL,1LL,6LL,6LL,3LL,2LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,3LL},std::tuple<std::string,Int,Int>{"sum",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,2LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,0LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,1LL},std::tuple<std::string,Int,Int>{"sum",0LL,5LL},std::tuple<std::string,Int,Int>{"sum",0LL,4LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{11LL,12LL,37LL,14LL,43LL,45LL,0LL,45LL,40LL,35LL,29LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 4",[&]{
  auto a0=Vec<Int>{5LL,6LL,0LL,6LL,3LL,5LL,9LL,2LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,3LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"sum",0LL,0LL},std::tuple<std::string,Int,Int>{"add",0LL,1LL},std::tuple<std::string,Int,Int>{"add",0LL,3LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{36LL,9LL,46LL,35LL,21LL,15LL,0LL,50LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 5",[&]{
  auto a0=Vec<Int>{1LL,6LL,4LL,3LL,7LL,9LL,6LL,0LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,2LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,5LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{44LL,38LL,21LL,44LL,42LL,63LL,57LL,57LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 6",[&]{
  auto a0=Vec<Int>{1LL,0LL,9LL,2LL,9LL,0LL,1LL,7LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,5LL},std::tuple<std::string,Int,Int>{"sum",0LL,3LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,5LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{21LL,21LL,10LL,34LL,38LL,57LL,49LL,57LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 7",[&]{
  auto a0=Vec<Int>{6LL,1LL,1LL,2LL,7LL,0LL,0LL,9LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,2LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,0LL},std::tuple<std::string,Int,Int>{"sum",0LL,5LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,2LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,2LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{7LL,0LL,24LL,47LL,61LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 8",[&]{
  auto a0=Vec<Int>{3LL,3LL,0LL,3LL,5LL,1LL,5LL,1LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,5LL},std::tuple<std::string,Int,Int>{"add",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"add",0LL,5LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"sum",0LL,4LL},std::tuple<std::string,Int,Int>{"sum",0LL,3LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,5LL},std::tuple<std::string,Int,Int>{"sum",0LL,2LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"add",0LL,1LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{22LL,27LL,33LL,30LL,45LL,37LL,39LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 9",[&]{
  auto a0=Vec<Int>{3LL,2LL,3LL,1LL,2LL,3LL,3LL,6LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"sum",0LL,0LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"sum",0LL,3LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{14LL,17LL,17LL,3LL,0LL,23LL,23LL,14LL,8LL,31LL,11LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 10",[&]{
  auto a0=Vec<Int>{6LL,0LL,6LL,3LL,2LL,9LL,2LL,8LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"add",0LL,2LL},std::tuple<std::string,Int,Int>{"add",0LL,5LL},std::tuple<std::string,Int,Int>{"add",0LL,2LL},std::tuple<std::string,Int,Int>{"sum",0LL,5LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,5LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL},std::tuple<std::string,Int,Int>{"sum",0LL,6LL},std::tuple<std::string,Int,Int>{"add",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,2LL},std::tuple<std::string,Int,Int>{"sum",0LL,5LL},std::tuple<std::string,Int,Int>{"sum",0LL,2LL},std::tuple<std::string,Int,Int>{"add",0LL,4LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{26LL,35LL,33LL,46LL,56LL,34LL,45LL,34LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("point additions 11",[&]{
  auto a0=Vec<Int>{1LL,8LL,3LL,3LL,8LL,7LL,2LL,8LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"add",0LL,5LL},std::tuple<std::string,Int,Int>{"sum",0LL,2LL},std::tuple<std::string,Int,Int>{"add",0LL,5LL},std::tuple<std::string,Int,Int>{"add",0LL,1LL},std::tuple<std::string,Int,Int>{"add",0LL,1LL},std::tuple<std::string,Int,Int>{"add",0LL,3LL},std::tuple<std::string,Int,Int>{"sum",0LL,3LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL},std::tuple<std::string,Int,Int>{"sum",0LL,7LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"sum",0LL,1LL},std::tuple<std::string,Int,Int>{"add",0LL,5LL},std::tuple<std::string,Int,Int>{"add",0LL,0LL},std::tuple<std::string,Int,Int>{"add",0LL,1LL},std::tuple<std::string,Int,Int>{"sum",0LL,8LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{14LL,27LL,55LL,47LL,16LL,16LL,61LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"add",0LL,1LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"sum",1LL,0LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=Vec<std::tuple<std::string,Int,Int>>{std::tuple<std::string,Int,Int>{"set",0LL,1LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
