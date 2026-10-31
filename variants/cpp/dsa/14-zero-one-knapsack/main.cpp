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
 test::run("greedy ratio counterexample",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{2LL,3LL},std::pair<Int,Int>{3LL,4LL},std::pair<Int,Int>{4LL,5LL}}; auto before0=a0;
  auto a1=6LL; auto before1=a1;
  CHECK(fn(a0,a1) == 8LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("no item reuse",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{2LL,3LL}}; auto before0=a0;
  auto a1=4LL; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("no items",[&]{
  auto a0=Vec<std::pair<Int,Int>>{}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("zero value",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{2LL,0LL},std::pair<Int,Int>{2LL,7LL}}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 7LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 0",[&]{
  auto a0=Vec<std::pair<Int,Int>>{}; auto before0=a0;
  auto a1=8LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 1",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{4LL,7LL}}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 2",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{3LL,10LL},std::pair<Int,Int>{3LL,8LL}}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == 10LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 3",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{4LL,2LL},std::pair<Int,Int>{1LL,10LL},std::pair<Int,Int>{3LL,0LL}}; auto before0=a0;
  auto a1=13LL; auto before1=a1;
  CHECK(fn(a0,a1) == 12LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 4",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{6LL,5LL},std::pair<Int,Int>{3LL,2LL},std::pair<Int,Int>{3LL,11LL},std::pair<Int,Int>{4LL,10LL}}; auto before0=a0;
  auto a1=7LL; auto before1=a1;
  CHECK(fn(a0,a1) == 21LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 5",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{3LL,3LL},std::pair<Int,Int>{2LL,5LL},std::pair<Int,Int>{6LL,8LL},std::pair<Int,Int>{1LL,6LL},std::pair<Int,Int>{3LL,11LL}}; auto before0=a0;
  auto a1=8LL; auto before1=a1;
  CHECK(fn(a0,a1) == 22LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 6",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{4LL,1LL},std::pair<Int,Int>{1LL,5LL},std::pair<Int,Int>{5LL,6LL},std::pair<Int,Int>{4LL,3LL},std::pair<Int,Int>{6LL,7LL},std::pair<Int,Int>{2LL,3LL}}; auto before0=a0;
  auto a1=7LL; auto before1=a1;
  CHECK(fn(a0,a1) == 12LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 7",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{5LL,4LL},std::pair<Int,Int>{5LL,1LL},std::pair<Int,Int>{6LL,4LL},std::pair<Int,Int>{6LL,9LL},std::pair<Int,Int>{4LL,9LL},std::pair<Int,Int>{3LL,8LL},std::pair<Int,Int>{2LL,9LL}}; auto before0=a0;
  auto a1=7LL; auto before1=a1;
  CHECK(fn(a0,a1) == 18LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 8",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{3LL,3LL},std::pair<Int,Int>{4LL,8LL},std::pair<Int,Int>{2LL,3LL},std::pair<Int,Int>{3LL,7LL},std::pair<Int,Int>{2LL,3LL},std::pair<Int,Int>{3LL,0LL},std::pair<Int,Int>{2LL,1LL},std::pair<Int,Int>{3LL,3LL}}; auto before0=a0;
  auto a1=11LL; auto before1=a1;
  CHECK(fn(a0,a1) == 21LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 9",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{5LL,1LL},std::pair<Int,Int>{2LL,1LL},std::pair<Int,Int>{3LL,11LL},std::pair<Int,Int>{4LL,3LL},std::pair<Int,Int>{2LL,11LL},std::pair<Int,Int>{1LL,5LL},std::pair<Int,Int>{2LL,10LL},std::pair<Int,Int>{6LL,2LL},std::pair<Int,Int>{1LL,0LL}}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 10",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{3LL,2LL},std::pair<Int,Int>{5LL,7LL},std::pair<Int,Int>{5LL,5LL},std::pair<Int,Int>{6LL,5LL},std::pair<Int,Int>{4LL,7LL},std::pair<Int,Int>{6LL,1LL},std::pair<Int,Int>{5LL,0LL},std::pair<Int,Int>{3LL,7LL},std::pair<Int,Int>{6LL,9LL},std::pair<Int,Int>{3LL,7LL}}; auto before0=a0;
  auto a1=9LL; auto before1=a1;
  CHECK(fn(a0,a1) == 16LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("item selection 11",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{2LL,2LL},std::pair<Int,Int>{3LL,1LL},std::pair<Int,Int>{1LL,7LL},std::pair<Int,Int>{5LL,11LL},std::pair<Int,Int>{1LL,4LL},std::pair<Int,Int>{3LL,4LL},std::pair<Int,Int>{4LL,8LL},std::pair<Int,Int>{2LL,3LL},std::pair<Int,Int>{3LL,1LL},std::pair<Int,Int>{1LL,0LL},std::pair<Int,Int>{5LL,1LL}}; auto before0=a0;
  auto a1=11LL; auto before1=a1;
  CHECK(fn(a0,a1) == 30LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,2LL}}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<std::pair<Int,Int>>{}; auto before0=a0;
  auto a1=-1LL; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
