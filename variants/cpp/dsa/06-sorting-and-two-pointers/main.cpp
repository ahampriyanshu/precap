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
 test::run("no self pairing",[&]{
  auto a0=Vec<Int>{5LL}; auto before0=a0;
  auto a1=10LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("two equal values",[&]{
  auto a0=Vec<Int>{5LL,5LL}; auto before0=a0;
  auto a1=10LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{5LL,5LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("canonical tie",[&]{
  auto a0=Vec<Int>{4LL,1LL,3LL,2LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{1LL,4LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("negative adjustment",[&]{
  auto a0=Vec<Int>{-4LL,0LL,4LL}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-4LL,4LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 0",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 1",[&]{
  auto a0=Vec<Int>{-6LL}; auto before0=a0;
  auto a1=6LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 2",[&]{
  auto a0=Vec<Int>{2LL,1LL}; auto before0=a0;
  auto a1=-5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 3",[&]{
  auto a0=Vec<Int>{-1LL,3LL,3LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 4",[&]{
  auto a0=Vec<Int>{7LL,5LL,-2LL,-4LL}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 5",[&]{
  auto a0=Vec<Int>{7LL,4LL,-3LL,-4LL,3LL}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-4LL,4LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 6",[&]{
  auto a0=Vec<Int>{-3LL,2LL,3LL,2LL,-5LL,4LL}; auto before0=a0;
  auto a1=-2LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-5LL,3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 7",[&]{
  auto a0=Vec<Int>{1LL,5LL,-5LL,-5LL,6LL,2LL,-4LL}; auto before0=a0;
  auto a1=4LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 8",[&]{
  auto a0=Vec<Int>{3LL,0LL,3LL,6LL,0LL,-2LL,-4LL,1LL}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,0LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 9",[&]{
  auto a0=Vec<Int>{-5LL,6LL,-3LL,-3LL,6LL,7LL,6LL,-1LL,5LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-1LL,6LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 10",[&]{
  auto a0=Vec<Int>{2LL,3LL,-2LL,1LL,6LL,3LL,6LL,4LL,0LL,-1LL}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-2LL,2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 11",[&]{
  auto a0=Vec<Int>{4LL,0LL,0LL,7LL,1LL,3LL,0LL,0LL,0LL,4LL,-2LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-2LL,3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 12",[&]{
  auto a0=Vec<Int>{2LL,6LL,2LL,-4LL,6LL,7LL,-1LL,3LL,-3LL,-3LL,-3LL,5LL}; auto before0=a0;
  auto a1=-2LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-4LL,2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 13",[&]{
  auto a0=Vec<Int>{-1LL,2LL,-4LL,-1LL,1LL,-6LL,1LL,5LL,4LL,-2LL,6LL,5LL,-5LL}; auto before0=a0;
  auto a1=7LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{1LL,6LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 14",[&]{
  auto a0=Vec<Int>{7LL,2LL,1LL,-3LL,5LL,6LL,-2LL,7LL,1LL,-1LL,4LL,3LL,-1LL,1LL}; auto before0=a0;
  auto a1=-4LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-3LL,-1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 15",[&]{
  auto a0=Vec<Int>{-3LL,3LL,0LL,-2LL,-5LL,-4LL,-1LL,-2LL,6LL,0LL,4LL,3LL,-3LL,-6LL,3LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-3LL,6LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 16",[&]{
  auto a0=Vec<Int>{5LL,-1LL,-2LL,-1LL,7LL,3LL,4LL,-4LL,1LL,-1LL,-3LL,-5LL,-3LL,-1LL,5LL,-3LL}; auto before0=a0;
  auto a1=-2LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-5LL,3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 17",[&]{
  auto a0=Vec<Int>{6LL,3LL,-5LL,-4LL,6LL,0LL,2LL,3LL,4LL,7LL,5LL,-1LL,-4LL,1LL,-1LL,-5LL,5LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-1LL,6LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 18",[&]{
  auto a0=Vec<Int>{-6LL,7LL,5LL,7LL,7LL,7LL,-1LL,4LL,5LL,-3LL,-1LL,-2LL,5LL,-1LL,-3LL,4LL,6LL,4LL}; auto before0=a0;
  auto a1=6LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-1LL,7LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 19",[&]{
  auto a0=Vec<Int>{5LL,-5LL,-3LL,2LL,7LL,-4LL,-2LL,5LL,4LL,4LL,-1LL,4LL,7LL,3LL,0LL,7LL,-4LL,-3LL,3LL}; auto before0=a0;
  auto a1=-1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-5LL,4LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 20",[&]{
  auto a0=Vec<Int>{7LL,7LL,2LL,7LL,-6LL,2LL,5LL,-6LL,-3LL,3LL,-6LL,-6LL,-2LL,-2LL,2LL,6LL,-4LL,-2LL,-1LL,-1LL}; auto before0=a0;
  auto a1=-4LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-6LL,2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 21",[&]{
  auto a0=Vec<Int>{-6LL,-2LL,3LL,5LL,5LL,2LL,5LL,1LL,5LL,-3LL,2LL,6LL,-1LL,-1LL,1LL,4LL,0LL,2LL,1LL,2LL,-2LL}; auto before0=a0;
  auto a1=-5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-6LL,1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 22",[&]{
  auto a0=Vec<Int>{0LL,-3LL,2LL,-4LL,-1LL,-5LL,-5LL,1LL,5LL,7LL,1LL,7LL,0LL,5LL,-6LL,1LL,-1LL,4LL,2LL,-4LL,6LL,2LL}; auto before0=a0;
  auto a1=-5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-6LL,1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 23",[&]{
  auto a0=Vec<Int>{3LL,-5LL,-3LL,-5LL,0LL,-5LL,3LL,4LL,-6LL,-3LL,-4LL,2LL,-4LL,-5LL,2LL,-4LL,1LL,5LL,0LL,2LL,-3LL,5LL,4LL}; auto before0=a0;
  auto a1=-2LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{-6LL,4LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated pair 24",[&]{
  auto a0=Vec<Int>{6LL,2LL,-6LL,-3LL,2LL,-5LL,6LL,5LL,0LL,-2LL,3LL,0LL,-6LL,6LL,-1LL,2LL,4LL,0LL,-3LL,-4LL,-6LL,3LL,-6LL,-1LL}; auto before0=a0;
  auto a1=6LL; auto before1=a1;
  CHECK(fn(a0,a1) == Opt<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,6LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
