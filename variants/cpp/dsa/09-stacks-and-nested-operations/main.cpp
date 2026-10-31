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
 test::run("nested",[&]{
  auto a0=Vec<std::string>{"LOAD:a","LOAD:b","UNLOAD:b","UNLOAD:a"}; auto before0=a0;
  CHECK(fn(a0) == true);
  CHECK(a0 == before0);
 });
 test::run("counts are insufficient",[&]{
  auto a0=Vec<std::string>{"LOAD:a","LOAD:b","UNLOAD:a","UNLOAD:b"}; auto before0=a0;
  CHECK(fn(a0) == false);
  CHECK(a0 == before0);
 });
 test::run("empty balanced",[&]{
  auto a0=Vec<std::string>{}; auto before0=a0;
  CHECK(fn(a0) == true);
  CHECK(a0 == before0);
 });
 test::run("underflow",[&]{
  auto a0=Vec<std::string>{"UNLOAD:x"}; auto before0=a0;
  CHECK(fn(a0) == false);
  CHECK(a0 == before0);
 });
 test::run("unfinished",[&]{
  auto a0=Vec<std::string>{"LOAD:x"}; auto before0=a0;
  CHECK(fn(a0) == false);
  CHECK(a0 == before0);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<std::string>{"LOAD:"}; auto before0=a0;
  INVALID(fn(a0));
  CHECK(a0 == before0);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<std::string>{"PUSH:x"}; auto before0=a0;
  INVALID(fn(a0));
  CHECK(a0 == before0);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<std::string>{"LOAD:a:b"}; auto before0=a0;
  INVALID(fn(a0));
  CHECK(a0 == before0);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
