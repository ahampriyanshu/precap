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
 test::run("dense matrix",[&]{
  auto a0=Vec<Vec<Opt<Int>>>{Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{2LL},Opt<Int>{8LL}},Vec<Opt<Int>>{Opt<Int>{2LL},Opt<Int>{0LL},Opt<Int>{1LL}},Vec<Opt<Int>>{Opt<Int>{8LL},Opt<Int>{1LL},Opt<Int>{0LL}}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Int>{3LL});
  CHECK(a0 == before0);
 });
 test::run("disconnected",[&]{
  auto a0=Vec<Vec<Opt<Int>>>{Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{}},Vec<Opt<Int>>{Opt<Int>{},Opt<Int>{0LL}}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Int>{});
  CHECK(a0 == before0);
 });
 test::run("empty graph",[&]{
  auto a0=Vec<Vec<Opt<Int>>>{}; auto before0=a0;
  CHECK(fn(a0) == Opt<Int>{0LL});
  CHECK(a0 == before0);
 });
 test::run("negative edge",[&]{
  auto a0=Vec<Vec<Opt<Int>>>{Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{-2LL}},Vec<Opt<Int>>{Opt<Int>{-2LL},Opt<Int>{0LL}}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Int>{-2LL});
  CHECK(a0 == before0);
 });
 test::run("asymmetric",[&]{
  auto a0=Vec<Vec<Opt<Int>>>{Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{1LL}},Vec<Opt<Int>>{Opt<Int>{2LL},Opt<Int>{0LL}}}; auto before0=a0;
  INVALID(fn(a0));
  CHECK(a0 == before0);
 });
 test::run("not square",[&]{
  auto a0=Vec<Vec<Opt<Int>>>{Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{1LL}}}; auto before0=a0;
  INVALID(fn(a0));
  CHECK(a0 == before0);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
