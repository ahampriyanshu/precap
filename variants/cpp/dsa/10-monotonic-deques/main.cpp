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
 test::run("expiring descending maximum",[&]{
  auto a0=Vec<Int>{9LL,8LL,7LL,6LL}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{9LL,8LL,7LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("duplicate peak",[&]{
  auto a0=Vec<Int>{4LL,4LL,1LL,4LL}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{4LL,4LL,4LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("no full window",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=1 w=1",[&]{
  auto a0=Vec<Int>{0LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=1 w=3",[&]{
  auto a0=Vec<Int>{-9LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=1 w=5",[&]{
  auto a0=Vec<Int>{-6LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=2 w=1",[&]{
  auto a0=Vec<Int>{9LL,-3LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{9LL,-3LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=2 w=3",[&]{
  auto a0=Vec<Int>{-2LL,-10LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=2 w=5",[&]{
  auto a0=Vec<Int>{-9LL,5LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=3 w=1",[&]{
  auto a0=Vec<Int>{-4LL,10LL,7LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-4LL,10LL,7LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=3 w=3",[&]{
  auto a0=Vec<Int>{1LL,10LL,-6LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{10LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=3 w=5",[&]{
  auto a0=Vec<Int>{-9LL,1LL,0LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=4 w=1",[&]{
  auto a0=Vec<Int>{-5LL,-4LL,5LL,-6LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-5LL,-4LL,5LL,-6LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=4 w=3",[&]{
  auto a0=Vec<Int>{1LL,-7LL,2LL,1LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{2LL,2LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=4 w=5",[&]{
  auto a0=Vec<Int>{8LL,3LL,-7LL,5LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=5 w=1",[&]{
  auto a0=Vec<Int>{-8LL,-4LL,-5LL,6LL,0LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-8LL,-4LL,-5LL,6LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=5 w=3",[&]{
  auto a0=Vec<Int>{7LL,6LL,-7LL,1LL,-2LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{7LL,6LL,1LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=5 w=5",[&]{
  auto a0=Vec<Int>{-5LL,9LL,9LL,2LL,-9LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{9LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=6 w=1",[&]{
  auto a0=Vec<Int>{-6LL,10LL,-10LL,6LL,4LL,-7LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-6LL,10LL,-10LL,6LL,4LL,-7LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=6 w=3",[&]{
  auto a0=Vec<Int>{-8LL,-8LL,3LL,-4LL,-4LL,-7LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{3LL,3LL,3LL,-4LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=6 w=5",[&]{
  auto a0=Vec<Int>{3LL,5LL,10LL,-1LL,5LL,7LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{10LL,10LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=7 w=1",[&]{
  auto a0=Vec<Int>{1LL,-3LL,-6LL,1LL,6LL,5LL,7LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{1LL,-3LL,-6LL,1LL,6LL,5LL,7LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=7 w=3",[&]{
  auto a0=Vec<Int>{7LL,6LL,4LL,-3LL,-4LL,-5LL,1LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{7LL,6LL,4LL,-3LL,1LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=7 w=5",[&]{
  auto a0=Vec<Int>{6LL,-6LL,-5LL,10LL,-9LL,10LL,-3LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{10LL,10LL,10LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=8 w=1",[&]{
  auto a0=Vec<Int>{-5LL,-10LL,-5LL,-6LL,2LL,0LL,5LL,7LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-5LL,-10LL,-5LL,-6LL,2LL,0LL,5LL,7LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=8 w=3",[&]{
  auto a0=Vec<Int>{5LL,-6LL,-10LL,-3LL,-9LL,2LL,-4LL,2LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{5LL,-3LL,-3LL,2LL,2LL,2LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=8 w=5",[&]{
  auto a0=Vec<Int>{-8LL,-3LL,-9LL,-10LL,-9LL,6LL,5LL,-6LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-3LL,6LL,6LL,6LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=9 w=1",[&]{
  auto a0=Vec<Int>{9LL,-8LL,6LL,-2LL,3LL,-9LL,-9LL,1LL,5LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{9LL,-8LL,6LL,-2LL,3LL,-9LL,-9LL,1LL,5LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=9 w=3",[&]{
  auto a0=Vec<Int>{-10LL,1LL,-6LL,-9LL,-10LL,9LL,-7LL,-9LL,-10LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{1LL,1LL,-6LL,9LL,9LL,9LL,-7LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=9 w=5",[&]{
  auto a0=Vec<Int>{-7LL,-2LL,2LL,9LL,-7LL,-9LL,-2LL,-4LL,-10LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{9LL,9LL,9LL,9LL,-2LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=10 w=1",[&]{
  auto a0=Vec<Int>{-2LL,7LL,-9LL,-7LL,-3LL,5LL,6LL,6LL,-8LL,7LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-2LL,7LL,-9LL,-7LL,-3LL,5LL,6LL,6LL,-8LL,7LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=10 w=3",[&]{
  auto a0=Vec<Int>{-3LL,0LL,-10LL,-2LL,-5LL,4LL,10LL,-3LL,3LL,-1LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,0LL,-2LL,4LL,10LL,10LL,10LL,3LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=10 w=5",[&]{
  auto a0=Vec<Int>{8LL,0LL,7LL,9LL,10LL,-10LL,9LL,-3LL,9LL,7LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{10LL,10LL,10LL,10LL,10LL,9LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=11 w=1",[&]{
  auto a0=Vec<Int>{9LL,-8LL,7LL,9LL,-6LL,-8LL,8LL,-2LL,-10LL,10LL,-4LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{9LL,-8LL,7LL,9LL,-6LL,-8LL,8LL,-2LL,-10LL,10LL,-4LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=11 w=3",[&]{
  auto a0=Vec<Int>{6LL,5LL,-6LL,-9LL,-5LL,-9LL,-10LL,2LL,7LL,8LL,-4LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{6LL,5LL,-5LL,-5LL,-5LL,2LL,7LL,8LL,8LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("peak n=11 w=5",[&]{
  auto a0=Vec<Int>{-2LL,-10LL,-3LL,0LL,-4LL,-3LL,-9LL,4LL,3LL,-4LL,8LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,0LL,0LL,4LL,4LL,4LL,8LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
