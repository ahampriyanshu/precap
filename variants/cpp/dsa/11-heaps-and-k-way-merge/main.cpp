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
 test::run("ties and empty sequence",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{},Vec<Int>{1LL,4LL},Vec<Int>{1LL,2LL,8LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{1LL,1LL,2LL,4LL,8LL});
  CHECK(a0 == before0);
 });
 test::run("no sequences",[&]{
  auto a0=Vec<Vec<Int>>{}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{});
  CHECK(a0 == before0);
 });
 test::run("all empty",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{},Vec<Int>{}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{});
  CHECK(a0 == before0);
 });
 test::run("1 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-8LL,14LL,16LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-8LL,14LL,16LL});
  CHECK(a0 == before0);
 });
 test::run("2 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-9LL,-8LL,-7LL,-6LL},Vec<Int>{}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-9LL,-8LL,-7LL,-6LL});
  CHECK(a0 == before0);
 });
 test::run("3 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-5LL,0LL,4LL,14LL},Vec<Int>{-7LL,-5LL,-3LL,-2LL,-1LL,6LL,15LL},Vec<Int>{1LL,3LL,5LL,6LL,16LL,18LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-7LL,-5LL,-5LL,-3LL,-2LL,-1LL,0LL,1LL,3LL,4LL,5LL,6LL,6LL,14LL,15LL,16LL,18LL});
  CHECK(a0 == before0);
 });
 test::run("4 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-10LL,-7LL,4LL,5LL,9LL,10LL,18LL},Vec<Int>{},Vec<Int>{-1LL,-1LL,-1LL,9LL,16LL,18LL},Vec<Int>{-8LL,0LL,14LL,18LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-8LL,-7LL,-1LL,-1LL,-1LL,0LL,4LL,5LL,9LL,9LL,10LL,14LL,16LL,18LL,18LL,18LL});
  CHECK(a0 == before0);
 });
 test::run("5 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-7LL,16LL,17LL},Vec<Int>{},Vec<Int>{13LL},Vec<Int>{-1LL,0LL},Vec<Int>{2LL,17LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-7LL,-1LL,0LL,2LL,13LL,16LL,17LL,17LL});
  CHECK(a0 == before0);
 });
 test::run("6 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-9LL},Vec<Int>{3LL},Vec<Int>{-5LL,-4LL,4LL},Vec<Int>{-3LL},Vec<Int>{-10LL,-9LL,12LL},Vec<Int>{-10LL,-7LL,-6LL,-2LL,1LL,14LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-10LL,-9LL,-9LL,-7LL,-6LL,-5LL,-4LL,-3LL,-2LL,1LL,3LL,4LL,12LL,14LL});
  CHECK(a0 == before0);
 });
 test::run("7 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{0LL,4LL,5LL,19LL},Vec<Int>{1LL,8LL},Vec<Int>{-10LL,-1LL,5LL,5LL,7LL,15LL,17LL},Vec<Int>{16LL},Vec<Int>{0LL,0LL,5LL,17LL},Vec<Int>{-7LL},Vec<Int>{-4LL,0LL,1LL,2LL,7LL,19LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-7LL,-4LL,-1LL,0LL,0LL,0LL,0LL,1LL,1LL,2LL,4LL,5LL,5LL,5LL,5LL,7LL,7LL,8LL,15LL,16LL,17LL,17LL,19LL,19LL});
  CHECK(a0 == before0);
 });
 test::run("8 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{5LL,16LL,16LL,17LL},Vec<Int>{-5LL,9LL,11LL},Vec<Int>{-2LL,2LL,18LL,19LL},Vec<Int>{-10LL,-6LL,11LL,15LL,15LL,19LL},Vec<Int>{-3LL,-1LL,6LL,10LL},Vec<Int>{-9LL,-3LL,4LL,4LL,10LL,12LL},Vec<Int>{-8LL,-2LL,10LL,16LL},Vec<Int>{6LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-9LL,-8LL,-6LL,-5LL,-3LL,-3LL,-2LL,-2LL,-1LL,2LL,4LL,4LL,5LL,6LL,6LL,9LL,10LL,10LL,10LL,11LL,11LL,12LL,15LL,15LL,16LL,16LL,16LL,17LL,18LL,19LL,19LL});
  CHECK(a0 == before0);
 });
 test::run("9 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{17LL},Vec<Int>{-9LL,-8LL,-1LL,4LL,8LL,12LL},Vec<Int>{-10LL,-8LL,0LL,5LL,18LL,19LL},Vec<Int>{7LL,8LL,12LL},Vec<Int>{-7LL,-7LL,-1LL,10LL,11LL,15LL,17LL},Vec<Int>{0LL,4LL,8LL,10LL,11LL,16LL,18LL},Vec<Int>{-10LL,-1LL,17LL},Vec<Int>{-10LL,-10LL,13LL},Vec<Int>{-4LL,-3LL,-1LL,11LL,13LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-10LL,-10LL,-10LL,-9LL,-8LL,-8LL,-7LL,-7LL,-4LL,-3LL,-1LL,-1LL,-1LL,-1LL,0LL,0LL,4LL,4LL,5LL,7LL,8LL,8LL,8LL,10LL,10LL,11LL,11LL,11LL,12LL,12LL,13LL,13LL,15LL,16LL,17LL,17LL,17LL,18LL,18LL,19LL});
  CHECK(a0 == before0);
 });
 test::run("10 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{7LL,10LL,17LL},Vec<Int>{-4LL,-2LL,6LL,11LL,15LL},Vec<Int>{-9LL,-7LL,4LL,4LL,5LL,12LL,12LL},Vec<Int>{-2LL},Vec<Int>{-8LL,10LL},Vec<Int>{4LL,8LL,19LL},Vec<Int>{-9LL,-8LL,-6LL,-3LL,-1LL,0LL},Vec<Int>{-8LL,-5LL,5LL,6LL,8LL,13LL},Vec<Int>{-10LL,-6LL,-2LL,-2LL,4LL,15LL,16LL},Vec<Int>{-3LL,-3LL,3LL,4LL,8LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-9LL,-9LL,-8LL,-8LL,-8LL,-7LL,-6LL,-6LL,-5LL,-4LL,-3LL,-3LL,-3LL,-2LL,-2LL,-2LL,-2LL,-1LL,0LL,3LL,4LL,4LL,4LL,4LL,4LL,5LL,5LL,6LL,6LL,7LL,8LL,8LL,8LL,10LL,10LL,11LL,12LL,12LL,13LL,15LL,15LL,16LL,17LL,19LL});
  CHECK(a0 == before0);
 });
 test::run("11 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{0LL,0LL,4LL,6LL},Vec<Int>{-9LL,1LL,5LL,9LL,16LL},Vec<Int>{-4LL,0LL,4LL,7LL,13LL,16LL},Vec<Int>{-6LL,-5LL,-3LL,5LL},Vec<Int>{18LL},Vec<Int>{},Vec<Int>{-8LL,1LL,5LL,10LL,12LL,18LL},Vec<Int>{4LL,19LL},Vec<Int>{-1LL,4LL,16LL},Vec<Int>{-6LL,-3LL,1LL,15LL},Vec<Int>{-10LL,-9LL,-9LL,-7LL,5LL,7LL,11LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-9LL,-9LL,-9LL,-8LL,-7LL,-6LL,-6LL,-5LL,-4LL,-3LL,-3LL,-1LL,0LL,0LL,0LL,1LL,1LL,1LL,4LL,4LL,4LL,4LL,5LL,5LL,5LL,5LL,6LL,7LL,7LL,9LL,10LL,11LL,12LL,13LL,15LL,16LL,16LL,16LL,18LL,18LL,19LL});
  CHECK(a0 == before0);
 });
 test::run("12 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-8LL,-8LL,-1LL,5LL,18LL},Vec<Int>{-1LL,3LL,5LL,10LL},Vec<Int>{-9LL,-7LL,-2LL,0LL,1LL,13LL,14LL},Vec<Int>{-4LL,15LL},Vec<Int>{-4LL,1LL,4LL,4LL,8LL,13LL},Vec<Int>{-9LL,-2LL,4LL,11LL,17LL,18LL,19LL},Vec<Int>{-4LL,6LL,16LL,16LL},Vec<Int>{1LL,16LL},Vec<Int>{},Vec<Int>{},Vec<Int>{-9LL,-7LL,2LL,7LL,8LL},Vec<Int>{-8LL,10LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-9LL,-9LL,-9LL,-8LL,-8LL,-8LL,-7LL,-7LL,-4LL,-4LL,-4LL,-2LL,-2LL,-1LL,-1LL,0LL,1LL,1LL,1LL,2LL,3LL,4LL,4LL,4LL,5LL,5LL,6LL,7LL,8LL,8LL,10LL,10LL,11LL,13LL,13LL,14LL,15LL,16LL,16LL,16LL,17LL,18LL,18LL,19LL});
  CHECK(a0 == before0);
 });
 test::run("13 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{},Vec<Int>{0LL,5LL,6LL,8LL,15LL},Vec<Int>{-7LL},Vec<Int>{-9LL,-7LL,-1LL,7LL,19LL},Vec<Int>{-9LL,-8LL,6LL,15LL},Vec<Int>{-5LL,2LL,3LL,10LL,14LL},Vec<Int>{-9LL,-6LL,-6LL,13LL,18LL},Vec<Int>{-1LL,0LL,4LL,8LL,15LL,16LL},Vec<Int>{-10LL,-4LL,3LL,15LL,17LL},Vec<Int>{-8LL,0LL,4LL,6LL,11LL},Vec<Int>{-10LL,-6LL,-4LL},Vec<Int>{8LL},Vec<Int>{-10LL,-6LL,11LL,17LL,17LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-10LL,-10LL,-9LL,-9LL,-9LL,-8LL,-8LL,-7LL,-7LL,-6LL,-6LL,-6LL,-6LL,-5LL,-4LL,-4LL,-1LL,-1LL,0LL,0LL,0LL,2LL,3LL,3LL,4LL,4LL,5LL,6LL,6LL,6LL,7LL,8LL,8LL,8LL,10LL,11LL,11LL,13LL,14LL,15LL,15LL,15LL,15LL,16LL,17LL,17LL,17LL,18LL,19LL});
  CHECK(a0 == before0);
 });
 test::run("14 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-2LL,1LL,11LL,13LL,13LL,14LL,18LL},Vec<Int>{-5LL,18LL},Vec<Int>{-5LL},Vec<Int>{-10LL,-2LL,0LL,5LL,11LL,13LL,14LL},Vec<Int>{-7LL,4LL,5LL,13LL,16LL},Vec<Int>{-7LL,-1LL,9LL,16LL},Vec<Int>{},Vec<Int>{16LL},Vec<Int>{4LL,5LL,6LL,19LL},Vec<Int>{},Vec<Int>{-8LL,0LL,1LL,3LL,7LL,18LL},Vec<Int>{},Vec<Int>{6LL,10LL,10LL,13LL,16LL},Vec<Int>{-9LL,-8LL,-1LL,19LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-9LL,-8LL,-8LL,-7LL,-7LL,-5LL,-5LL,-2LL,-2LL,-1LL,-1LL,0LL,0LL,1LL,1LL,3LL,4LL,4LL,5LL,5LL,5LL,6LL,6LL,7LL,9LL,10LL,10LL,11LL,11LL,13LL,13LL,13LL,13LL,13LL,14LL,14LL,16LL,16LL,16LL,16LL,18LL,18LL,18LL,19LL,19LL});
  CHECK(a0 == before0);
 });
 test::run("15 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-1LL,11LL,13LL},Vec<Int>{-8LL,2LL,10LL},Vec<Int>{-10LL,-4LL,-1LL,2LL,6LL,8LL,9LL},Vec<Int>{4LL},Vec<Int>{-6LL,-2LL,3LL,3LL,7LL,16LL,16LL},Vec<Int>{},Vec<Int>{-3LL,7LL,14LL,18LL},Vec<Int>{-8LL,-6LL,1LL,15LL,16LL,16LL},Vec<Int>{16LL},Vec<Int>{2LL,6LL,6LL,8LL,13LL,17LL},Vec<Int>{-5LL,-4LL,10LL},Vec<Int>{-3LL,-3LL,1LL,8LL,12LL,18LL},Vec<Int>{-3LL,7LL,13LL,15LL,16LL},Vec<Int>{-9LL,-9LL,-2LL,0LL,1LL,3LL},Vec<Int>{-2LL,4LL,4LL,8LL,17LL,18LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-9LL,-9LL,-8LL,-8LL,-6LL,-6LL,-5LL,-4LL,-4LL,-3LL,-3LL,-3LL,-3LL,-2LL,-2LL,-2LL,-1LL,-1LL,0LL,1LL,1LL,1LL,2LL,2LL,2LL,3LL,3LL,3LL,4LL,4LL,4LL,6LL,6LL,6LL,7LL,7LL,7LL,8LL,8LL,8LL,8LL,9LL,10LL,10LL,11LL,12LL,13LL,13LL,13LL,14LL,15LL,15LL,16LL,16LL,16LL,16LL,16LL,16LL,17LL,17LL,18LL,18LL,18LL});
  CHECK(a0 == before0);
 });
 test::run("16 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-10LL,10LL,14LL},Vec<Int>{-9LL,-6LL,11LL,17LL},Vec<Int>{2LL},Vec<Int>{-8LL,-2LL,13LL,17LL,18LL},Vec<Int>{-8LL,-6LL,3LL,16LL},Vec<Int>{-9LL,-6LL,9LL,9LL,12LL,15LL},Vec<Int>{-5LL,5LL,10LL,16LL,19LL},Vec<Int>{-8LL,-4LL,15LL,19LL},Vec<Int>{6LL,19LL},Vec<Int>{-2LL,-1LL,8LL,11LL,16LL},Vec<Int>{},Vec<Int>{},Vec<Int>{},Vec<Int>{-6LL,-5LL,-1LL,-1LL,0LL,9LL,12LL},Vec<Int>{-8LL,-6LL,-6LL},Vec<Int>{1LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-9LL,-9LL,-8LL,-8LL,-8LL,-8LL,-6LL,-6LL,-6LL,-6LL,-6LL,-6LL,-5LL,-5LL,-4LL,-2LL,-2LL,-1LL,-1LL,-1LL,0LL,1LL,2LL,3LL,5LL,6LL,8LL,9LL,9LL,9LL,10LL,10LL,11LL,11LL,12LL,12LL,13LL,14LL,15LL,15LL,16LL,16LL,16LL,17LL,17LL,18LL,19LL,19LL,19LL});
  CHECK(a0 == before0);
 });
 test::run("17 feeds",[&]{
  auto a0=Vec<Vec<Int>>{Vec<Int>{-10LL,-9LL,3LL},Vec<Int>{-9LL,-3LL,-1LL,14LL},Vec<Int>{2LL,5LL,15LL},Vec<Int>{-5LL,5LL},Vec<Int>{-7LL,-3LL,16LL,18LL},Vec<Int>{13LL,19LL},Vec<Int>{-6LL,19LL},Vec<Int>{-3LL,-3LL,7LL,9LL,11LL,14LL},Vec<Int>{},Vec<Int>{},Vec<Int>{-7LL,5LL,7LL,7LL,8LL,9LL},Vec<Int>{-9LL,15LL},Vec<Int>{},Vec<Int>{-9LL,-4LL,-4LL,5LL,10LL,14LL,15LL},Vec<Int>{-1LL,1LL,9LL,9LL,9LL},Vec<Int>{-2LL,-1LL,5LL,9LL,14LL},Vec<Int>{-5LL,3LL}}; auto before0=a0;
  CHECK(fn(a0) == Vec<Int>{-10LL,-9LL,-9LL,-9LL,-9LL,-7LL,-7LL,-6LL,-5LL,-5LL,-4LL,-4LL,-3LL,-3LL,-3LL,-3LL,-2LL,-1LL,-1LL,-1LL,1LL,2LL,3LL,3LL,5LL,5LL,5LL,5LL,5LL,7LL,7LL,7LL,8LL,9LL,9LL,9LL,9LL,9LL,9LL,10LL,11LL,13LL,14LL,14LL,14LL,14LL,15LL,15LL,15LL,16LL,18LL,19LL,19LL});
  CHECK(a0 == before0);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
