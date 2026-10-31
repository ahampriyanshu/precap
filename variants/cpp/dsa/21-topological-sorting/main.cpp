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
 test::run("multiple legal choices",[&]{
  auto a0=4LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,2LL},std::pair<Int,Int>{1LL,2LL},std::pair<Int,Int>{2LL,3LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL,3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("cycle",[&]{
  auto a0=2LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,1LL},std::pair<Int,Int>{1LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("duplicate prerequisite",[&]{
  auto a0=2LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,1LL},std::pair<Int,Int>{0LL,1LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("self cycle",[&]{
  auto a0=1LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty graph",[&]{
  auto a0=0LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 1",[&]{
  auto a0=1LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 2",[&]{
  auto a0=2LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,1LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 3",[&]{
  auto a0=3LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 4",[&]{
  auto a0=4LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,2LL},std::pair<Int,Int>{2LL,3LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL,3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 5",[&]{
  auto a0=5LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,2LL},std::pair<Int,Int>{1LL,2LL},std::pair<Int,Int>{1LL,4LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL,3LL,4LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 6",[&]{
  auto a0=6LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,4LL},std::pair<Int,Int>{1LL,2LL},std::pair<Int,Int>{2LL,3LL},std::pair<Int,Int>{2LL,4LL},std::pair<Int,Int>{3LL,4LL},std::pair<Int,Int>{3LL,5LL},std::pair<Int,Int>{4LL,5LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL,3LL,4LL,5LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 7",[&]{
  auto a0=7LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,2LL},std::pair<Int,Int>{0LL,6LL},std::pair<Int,Int>{1LL,2LL},std::pair<Int,Int>{1LL,6LL},std::pair<Int,Int>{2LL,5LL},std::pair<Int,Int>{3LL,5LL},std::pair<Int,Int>{5LL,6LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL,3LL,4LL,5LL,6LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 8",[&]{
  auto a0=8LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,1LL},std::pair<Int,Int>{0LL,2LL},std::pair<Int,Int>{0LL,3LL},std::pair<Int,Int>{2LL,3LL},std::pair<Int,Int>{2LL,4LL},std::pair<Int,Int>{3LL,7LL},std::pair<Int,Int>{4LL,6LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL,3LL,4LL,5LL,6LL,7LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 9",[&]{
  auto a0=9LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,7LL},std::pair<Int,Int>{0LL,8LL},std::pair<Int,Int>{1LL,4LL},std::pair<Int,Int>{1LL,5LL},std::pair<Int,Int>{1LL,8LL},std::pair<Int,Int>{2LL,4LL},std::pair<Int,Int>{2LL,5LL},std::pair<Int,Int>{2LL,7LL},std::pair<Int,Int>{2LL,8LL},std::pair<Int,Int>{4LL,5LL},std::pair<Int,Int>{4LL,8LL},std::pair<Int,Int>{5LL,6LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL,3LL,4LL,5LL,6LL,7LL,8LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 10",[&]{
  auto a0=10LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,2LL},std::pair<Int,Int>{0LL,3LL},std::pair<Int,Int>{0LL,4LL},std::pair<Int,Int>{0LL,7LL},std::pair<Int,Int>{0LL,9LL},std::pair<Int,Int>{1LL,2LL},std::pair<Int,Int>{1LL,4LL},std::pair<Int,Int>{1LL,6LL},std::pair<Int,Int>{1LL,7LL},std::pair<Int,Int>{1LL,9LL},std::pair<Int,Int>{2LL,6LL},std::pair<Int,Int>{3LL,6LL},std::pair<Int,Int>{4LL,7LL},std::pair<Int,Int>{4LL,9LL},std::pair<Int,Int>{5LL,8LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL,3LL,4LL,5LL,6LL,7LL,8LL,9LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated DAG 11",[&]{
  auto a0=11LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,5LL},std::pair<Int,Int>{0LL,7LL},std::pair<Int,Int>{0LL,9LL},std::pair<Int,Int>{0LL,10LL},std::pair<Int,Int>{1LL,4LL},std::pair<Int,Int>{1LL,6LL},std::pair<Int,Int>{1LL,9LL},std::pair<Int,Int>{2LL,3LL},std::pair<Int,Int>{2LL,7LL},std::pair<Int,Int>{2LL,8LL},std::pair<Int,Int>{2LL,9LL},std::pair<Int,Int>{3LL,4LL},std::pair<Int,Int>{3LL,9LL},std::pair<Int,Int>{4LL,5LL},std::pair<Int,Int>{4LL,8LL},std::pair<Int,Int>{4LL,10LL},std::pair<Int,Int>{5LL,7LL},std::pair<Int,Int>{5LL,8LL},std::pair<Int,Int>{5LL,9LL},std::pair<Int,Int>{6LL,8LL},std::pair<Int,Int>{8LL,9LL},std::pair<Int,Int>{9LL,10LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<Vec<Int>>{Vec<Int>{0LL,1LL,2LL,3LL,4LL,5LL,6LL,7LL,8LL,9LL,10LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=-1LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=2LL; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{2LL,0LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
