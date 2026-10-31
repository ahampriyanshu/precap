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
 test::run("cheap cycle leaves a vertex disconnected",[&]{
  auto a0=4LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,1LL},std::tuple<Int,Int,Int>{1LL,2LL,1LL},std::tuple<Int,Int,Int>{0LL,2LL,1LL},std::tuple<Int,Int,Int>{2LL,3LL,9LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{11LL,Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,1LL},std::tuple<Int,Int,Int>{0LL,2LL,1LL},std::tuple<Int,Int,Int>{2LL,3LL,9LL}}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("negative edge and self-loop",[&]{
  auto a0=3LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{2LL,1LL,-2LL},std::tuple<Int,Int,Int>{1LL,0LL,4LL},std::tuple<Int,Int,Int>{0LL,0LL,-99LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{2LL,Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{1LL,2LL,-2LL},std::tuple<Int,Int,Int>{0LL,1LL,4LL}}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("disconnected",[&]{
  auto a0=3LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,1LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty graph",[&]{
  auto a0=0LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{0LL,Vec<std::tuple<Int,Int,Int>>{}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated weighted graph 1",[&]{
  auto a0=1LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{0LL,Vec<std::tuple<Int,Int,Int>>{}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated weighted graph 2",[&]{
  auto a0=2LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,-3LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{-3LL,Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,-3LL}}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated weighted graph 3",[&]{
  auto a0=3LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,5LL},std::tuple<Int,Int,Int>{0LL,2LL,-2LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{3LL,Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,2LL,-2LL},std::tuple<Int,Int,Int>{0LL,1LL,5LL}}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated weighted graph 4",[&]{
  auto a0=4LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{1LL,2LL,4LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated weighted graph 5",[&]{
  auto a0=5LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{1LL,2LL,2LL},std::tuple<Int,Int,Int>{1LL,4LL,-1LL},std::tuple<Int,Int,Int>{2LL,3LL,7LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated weighted graph 6",[&]{
  auto a0=6LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,1LL},std::tuple<Int,Int,Int>{0LL,2LL,3LL},std::tuple<Int,Int,Int>{0LL,4LL,5LL},std::tuple<Int,Int,Int>{2LL,3LL,2LL},std::tuple<Int,Int,Int>{2LL,4LL,5LL},std::tuple<Int,Int,Int>{3LL,4LL,0LL},std::tuple<Int,Int,Int>{3LL,5LL,-2LL},std::tuple<Int,Int,Int>{4LL,5LL,4LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{4LL,Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{3LL,5LL,-2LL},std::tuple<Int,Int,Int>{3LL,4LL,0LL},std::tuple<Int,Int,Int>{0LL,1LL,1LL},std::tuple<Int,Int,Int>{2LL,3LL,2LL},std::tuple<Int,Int,Int>{0LL,2LL,3LL}}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated weighted graph 7",[&]{
  auto a0=7LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,0LL},std::tuple<Int,Int,Int>{0LL,4LL,6LL},std::tuple<Int,Int,Int>{1LL,3LL,3LL},std::tuple<Int,Int,Int>{1LL,4LL,3LL},std::tuple<Int,Int,Int>{1LL,5LL,6LL},std::tuple<Int,Int,Int>{1LL,6LL,3LL},std::tuple<Int,Int,Int>{2LL,3LL,5LL},std::tuple<Int,Int,Int>{3LL,4LL,-2LL},std::tuple<Int,Int,Int>{4LL,5LL,-1LL},std::tuple<Int,Int,Int>{5LL,6LL,7LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{8LL,Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{3LL,4LL,-2LL},std::tuple<Int,Int,Int>{4LL,5LL,-1LL},std::tuple<Int,Int,Int>{0LL,1LL,0LL},std::tuple<Int,Int,Int>{1LL,3LL,3LL},std::tuple<Int,Int,Int>{1LL,6LL,3LL},std::tuple<Int,Int,Int>{2LL,3LL,5LL}}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated weighted graph 8",[&]{
  auto a0=8LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,2LL,7LL},std::tuple<Int,Int,Int>{0LL,3LL,5LL},std::tuple<Int,Int,Int>{0LL,4LL,2LL},std::tuple<Int,Int,Int>{0LL,5LL,3LL},std::tuple<Int,Int,Int>{1LL,2LL,4LL},std::tuple<Int,Int,Int>{1LL,7LL,7LL},std::tuple<Int,Int,Int>{2LL,4LL,4LL},std::tuple<Int,Int,Int>{2LL,5LL,7LL},std::tuple<Int,Int,Int>{3LL,4LL,2LL},std::tuple<Int,Int,Int>{4LL,6LL,4LL},std::tuple<Int,Int,Int>{5LL,6LL,2LL},std::tuple<Int,Int,Int>{5LL,7LL,5LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{22LL,Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,4LL,2LL},std::tuple<Int,Int,Int>{3LL,4LL,2LL},std::tuple<Int,Int,Int>{5LL,6LL,2LL},std::tuple<Int,Int,Int>{0LL,5LL,3LL},std::tuple<Int,Int,Int>{1LL,2LL,4LL},std::tuple<Int,Int,Int>{2LL,4LL,4LL},std::tuple<Int,Int,Int>{5LL,7LL,5LL}}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated weighted graph 9",[&]{
  auto a0=9LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,-2LL},std::tuple<Int,Int,Int>{0LL,3LL,3LL},std::tuple<Int,Int,Int>{0LL,4LL,4LL},std::tuple<Int,Int,Int>{0LL,8LL,4LL},std::tuple<Int,Int,Int>{1LL,4LL,1LL},std::tuple<Int,Int,Int>{1LL,6LL,4LL},std::tuple<Int,Int,Int>{1LL,8LL,2LL},std::tuple<Int,Int,Int>{2LL,7LL,-1LL},std::tuple<Int,Int,Int>{3LL,6LL,6LL},std::tuple<Int,Int,Int>{3LL,8LL,2LL},std::tuple<Int,Int,Int>{4LL,5LL,6LL},std::tuple<Int,Int,Int>{4LL,8LL,0LL},std::tuple<Int,Int,Int>{5LL,6LL,6LL},std::tuple<Int,Int,Int>{5LL,7LL,6LL},std::tuple<Int,Int,Int>{5LL,8LL,7LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>>{std::pair<Int,Vec<std::tuple<Int,Int,Int>>>{16LL,Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,-2LL},std::tuple<Int,Int,Int>{2LL,7LL,-1LL},std::tuple<Int,Int,Int>{4LL,8LL,0LL},std::tuple<Int,Int,Int>{1LL,4LL,1LL},std::tuple<Int,Int,Int>{3LL,8LL,2LL},std::tuple<Int,Int,Int>{1LL,6LL,4LL},std::tuple<Int,Int,Int>{4LL,5LL,6LL},std::tuple<Int,Int,Int>{5LL,7LL,6LL}}}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=2LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,2LL,4LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
