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
 test::run("correction and empty range",[&]{
  auto a0=Vec<Int>{4LL,-2LL,7LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,3LL},std::pair<Int,Int>{1LL,3LL},std::pair<Int,Int>{2LL,2LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{9LL,5LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty values",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 1",[&]{
  auto a0=Vec<Int>{-4LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,1LL},std::pair<Int,Int>{0LL,1LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-4LL,-4LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 2",[&]{
  auto a0=Vec<Int>{-5LL,-5LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,2LL},std::pair<Int,Int>{1LL,2LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-10LL,-5LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 3",[&]{
  auto a0=Vec<Int>{4LL,7LL,6LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,3LL},std::pair<Int,Int>{1LL,3LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{17LL,13LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 4",[&]{
  auto a0=Vec<Int>{2LL,0LL,1LL,4LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,4LL},std::pair<Int,Int>{2LL,4LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{7LL,5LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 5",[&]{
  auto a0=Vec<Int>{-5LL,5LL,-3LL,-2LL,-9LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,5LL},std::pair<Int,Int>{2LL,5LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-14LL,-14LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 6",[&]{
  auto a0=Vec<Int>{6LL,5LL,-2LL,-5LL,4LL,2LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,6LL},std::pair<Int,Int>{3LL,6LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{10LL,1LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 7",[&]{
  auto a0=Vec<Int>{3LL,-5LL,-6LL,-4LL,-8LL,9LL,0LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,7LL},std::pair<Int,Int>{3LL,7LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-11LL,-3LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 8",[&]{
  auto a0=Vec<Int>{-9LL,0LL,1LL,-7LL,-7LL,-2LL,-9LL,-7LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,8LL},std::pair<Int,Int>{4LL,8LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-40LL,-25LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 9",[&]{
  auto a0=Vec<Int>{-7LL,5LL,5LL,-2LL,0LL,7LL,0LL,-1LL,7LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,9LL},std::pair<Int,Int>{4LL,9LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{14LL,13LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 10",[&]{
  auto a0=Vec<Int>{-9LL,-2LL,-4LL,3LL,-1LL,-3LL,-5LL,3LL,5LL,-3LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,10LL},std::pair<Int,Int>{5LL,10LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-16LL,-3LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 11",[&]{
  auto a0=Vec<Int>{-9LL,9LL,-8LL,1LL,-1LL,-1LL,-2LL,-9LL,-1LL,0LL,0LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,11LL},std::pair<Int,Int>{5LL,11LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-21LL,-13LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 12",[&]{
  auto a0=Vec<Int>{-8LL,3LL,-2LL,-8LL,8LL,-2LL,-8LL,-9LL,-2LL,9LL,-8LL,3LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,12LL},std::pair<Int,Int>{6LL,12LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-24LL,-15LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 13",[&]{
  auto a0=Vec<Int>{6LL,2LL,7LL,5LL,-9LL,-8LL,-2LL,4LL,3LL,3LL,8LL,-3LL,-9LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,13LL},std::pair<Int,Int>{6LL,13LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{7LL,4LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 14",[&]{
  auto a0=Vec<Int>{-1LL,-1LL,-4LL,1LL,-8LL,-3LL,-6LL,8LL,-2LL,2LL,2LL,-4LL,-8LL,-8LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,14LL},std::pair<Int,Int>{7LL,14LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-32LL,-10LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 15",[&]{
  auto a0=Vec<Int>{-8LL,-1LL,6LL,-2LL,-1LL,4LL,8LL,-8LL,-9LL,3LL,-5LL,-6LL,2LL,-4LL,-4LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,15LL},std::pair<Int,Int>{7LL,15LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-25LL,-31LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 16",[&]{
  auto a0=Vec<Int>{-5LL,-9LL,-1LL,1LL,-1LL,-9LL,-6LL,6LL,2LL,0LL,-6LL,9LL,-2LL,7LL,-1LL,8LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,16LL},std::pair<Int,Int>{8LL,16LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-7LL,17LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 17",[&]{
  auto a0=Vec<Int>{-1LL,-7LL,-3LL,-5LL,6LL,6LL,-6LL,7LL,-7LL,5LL,1LL,-8LL,7LL,-4LL,-8LL,2LL,5LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,17LL},std::pair<Int,Int>{8LL,17LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-10LL,-7LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 18",[&]{
  auto a0=Vec<Int>{4LL,7LL,3LL,6LL,0LL,-1LL,-7LL,-1LL,-9LL,-1LL,1LL,-4LL,2LL,-5LL,9LL,-2LL,-7LL,3LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,18LL},std::pair<Int,Int>{9LL,18LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{-2LL,-4LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated range 19",[&]{
  auto a0=Vec<Int>{9LL,-1LL,0LL,-3LL,6LL,-3LL,8LL,0LL,-5LL,-1LL,9LL,3LL,5LL,1LL,-4LL,-3LL,2LL,0LL,-8LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,19LL},std::pair<Int,Int>{9LL,19LL},std::pair<Int,Int>{0LL,0LL}}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{15LL,4LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("right out of bounds",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{0LL,2LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("reversed",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{1LL,0LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("negative index",[&]{
  auto a0=Vec<Int>{1LL}; auto before0=a0;
  auto a1=Vec<std::pair<Int,Int>>{std::pair<Int,Int>{-1LL,0LL}}; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
