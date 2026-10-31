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
 test::run("duplicate removal",[&]{
  auto a0=Vec<std::string>{"food","food","water","fuel","water"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty",[&]{
  auto a0=Vec<std::string>{}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("no kinds allowed",[&]{
  auto a0=Vec<std::string>{"a"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=1 k=0",[&]{
  auto a0=Vec<std::string>{"b"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=1 k=1",[&]{
  auto a0=Vec<std::string>{"c"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 1LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=1 k=2",[&]{
  auto a0=Vec<std::string>{"b"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 1LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=1 k=3",[&]{
  auto a0=Vec<std::string>{"c"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 1LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=2 k=0",[&]{
  auto a0=Vec<std::string>{"a","a"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=2 k=1",[&]{
  auto a0=Vec<std::string>{"a","b"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 1LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=2 k=2",[&]{
  auto a0=Vec<std::string>{"a","a"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 2LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=2 k=3",[&]{
  auto a0=Vec<std::string>{"a","b"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 2LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=3 k=0",[&]{
  auto a0=Vec<std::string>{"b","a","a"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=3 k=1",[&]{
  auto a0=Vec<std::string>{"a","c","a"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 1LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=3 k=2",[&]{
  auto a0=Vec<std::string>{"c","c","c"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=3 k=3",[&]{
  auto a0=Vec<std::string>{"c","a","c"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=4 k=0",[&]{
  auto a0=Vec<std::string>{"b","c","a","a"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=4 k=1",[&]{
  auto a0=Vec<std::string>{"b","c","c","a"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 2LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=4 k=2",[&]{
  auto a0=Vec<std::string>{"a","c","c","b"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=4 k=3",[&]{
  auto a0=Vec<std::string>{"c","b","c","c"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 4LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=5 k=0",[&]{
  auto a0=Vec<std::string>{"c","a","c","c","c"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=5 k=1",[&]{
  auto a0=Vec<std::string>{"b","a","b","a","a"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 2LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=5 k=2",[&]{
  auto a0=Vec<std::string>{"a","a","b","b","c"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 4LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=5 k=3",[&]{
  auto a0=Vec<std::string>{"a","b","b","a","a"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 5LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=6 k=0",[&]{
  auto a0=Vec<std::string>{"b","a","b","b","c","a"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=6 k=1",[&]{
  auto a0=Vec<std::string>{"c","a","c","a","a","a"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=6 k=2",[&]{
  auto a0=Vec<std::string>{"a","a","b","a","b","b"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 6LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=6 k=3",[&]{
  auto a0=Vec<std::string>{"b","a","b","b","b","a"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 6LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=7 k=0",[&]{
  auto a0=Vec<std::string>{"a","c","a","b","b","a","a"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=7 k=1",[&]{
  auto a0=Vec<std::string>{"b","b","b","b","c","c","c"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 4LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=7 k=2",[&]{
  auto a0=Vec<std::string>{"b","b","a","a","c","b","c"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 4LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=7 k=3",[&]{
  auto a0=Vec<std::string>{"b","a","a","c","b","c","c"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 7LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=8 k=0",[&]{
  auto a0=Vec<std::string>{"a","c","c","a","c","a","a","c"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=8 k=1",[&]{
  auto a0=Vec<std::string>{"b","a","c","b","c","b","a","c"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 1LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=8 k=2",[&]{
  auto a0=Vec<std::string>{"c","a","a","c","a","b","a","c"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 5LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=8 k=3",[&]{
  auto a0=Vec<std::string>{"b","a","c","c","c","a","a","b"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 8LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=9 k=0",[&]{
  auto a0=Vec<std::string>{"b","c","b","c","a","c","a","b","b"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=9 k=1",[&]{
  auto a0=Vec<std::string>{"a","b","c","a","a","b","a","b","b"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 2LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=9 k=2",[&]{
  auto a0=Vec<std::string>{"a","b","b","b","c","c","a","c","b"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 5LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=9 k=3",[&]{
  auto a0=Vec<std::string>{"c","a","b","a","b","b","c","b","c"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 9LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=10 k=0",[&]{
  auto a0=Vec<std::string>{"b","c","b","a","c","a","b","a","a","c"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=10 k=1",[&]{
  auto a0=Vec<std::string>{"a","b","a","b","c","c","c","a","b","c"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=10 k=2",[&]{
  auto a0=Vec<std::string>{"a","b","c","c","c","b","a","c","c","b"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 5LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=10 k=3",[&]{
  auto a0=Vec<std::string>{"a","a","b","a","c","c","c","c","c","b"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 10LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=11 k=0",[&]{
  auto a0=Vec<std::string>{"b","a","c","c","c","c","c","c","a","c","a"}; auto before0=a0;
  auto a1=0LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=11 k=1",[&]{
  auto a0=Vec<std::string>{"a","b","b","b","a","a","b","b","b","c","c"}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=11 k=2",[&]{
  auto a0=Vec<std::string>{"c","b","c","c","a","b","c","b","b","a","b"}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 4LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("window n=11 k=3",[&]{
  auto a0=Vec<std::string>{"a","a","b","c","a","c","c","c","c","c","b"}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 11LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("negative limit",[&]{
  auto a0=Vec<std::string>{"a"}; auto before0=a0;
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
