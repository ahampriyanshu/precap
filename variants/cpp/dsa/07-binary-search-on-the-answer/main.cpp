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
 test::run("order-sensitive boundary",[&]{
  auto a0=Vec<Int>{1LL,2LL,3LL,4LL,5LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 6LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("large answer space",[&]{
  auto a0=Vec<Int>{1000000000000LL,1000000000000LL}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 1000000000000LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty weights",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 0LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("extra days",[&]{
  auto a0=Vec<Int>{8LL,2LL}; auto before0=a0;
  auto a1=9LL; auto before1=a1;
  CHECK(fn(a0,a1) == 8LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 1",[&]{
  auto a0=Vec<Int>{6LL}; auto before0=a0;
  auto a1=2LL; auto before1=a1;
  CHECK(fn(a0,a1) == 6LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 2",[&]{
  auto a0=Vec<Int>{3LL,7LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 10LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 3",[&]{
  auto a0=Vec<Int>{5LL,6LL,5LL}; auto before0=a0;
  auto a1=7LL; auto before1=a1;
  CHECK(fn(a0,a1) == 6LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 4",[&]{
  auto a0=Vec<Int>{3LL,8LL,6LL,1LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  CHECK(fn(a0,a1) == 18LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 5",[&]{
  auto a0=Vec<Int>{3LL,6LL,11LL,7LL,8LL}; auto before0=a0;
  auto a1=4LL; auto before1=a1;
  CHECK(fn(a0,a1) == 11LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 6",[&]{
  auto a0=Vec<Int>{2LL,11LL,4LL,1LL,2LL,10LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 13LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 7",[&]{
  auto a0=Vec<Int>{3LL,11LL,6LL,11LL,3LL,3LL,10LL}; auto before0=a0;
  auto a1=4LL; auto before1=a1;
  CHECK(fn(a0,a1) == 14LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 8",[&]{
  auto a0=Vec<Int>{4LL,9LL,7LL,11LL,10LL,6LL,8LL,2LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == 16LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 9",[&]{
  auto a0=Vec<Int>{10LL,10LL,7LL,4LL,11LL,2LL,8LL,6LL,8LL}; auto before0=a0;
  auto a1=6LL; auto before1=a1;
  CHECK(fn(a0,a1) == 14LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 10",[&]{
  auto a0=Vec<Int>{11LL,3LL,7LL,7LL,5LL,5LL,7LL,3LL,7LL,11LL}; auto before0=a0;
  auto a1=6LL; auto before1=a1;
  CHECK(fn(a0,a1) == 12LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 11",[&]{
  auto a0=Vec<Int>{4LL,11LL,9LL,7LL,11LL,10LL,3LL,2LL,3LL,7LL,10LL}; auto before0=a0;
  auto a1=4LL; auto before1=a1;
  CHECK(fn(a0,a1) == 24LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 12",[&]{
  auto a0=Vec<Int>{2LL,4LL,6LL,7LL,3LL,7LL,8LL,6LL,8LL,9LL,6LL,7LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 29LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 13",[&]{
  auto a0=Vec<Int>{7LL,10LL,11LL,7LL,1LL,5LL,6LL,9LL,4LL,2LL,6LL,4LL,5LL}; auto before0=a0;
  auto a1=4LL; auto before1=a1;
  CHECK(fn(a0,a1) == 21LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 14",[&]{
  auto a0=Vec<Int>{6LL,9LL,11LL,8LL,9LL,11LL,7LL,7LL,3LL,4LL,4LL,1LL,6LL,8LL}; auto before0=a0;
  auto a1=6LL; auto before1=a1;
  CHECK(fn(a0,a1) == 18LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 15",[&]{
  auto a0=Vec<Int>{8LL,5LL,11LL,7LL,6LL,9LL,10LL,8LL,4LL,5LL,1LL,8LL,5LL,3LL,7LL}; auto before0=a0;
  auto a1=3LL; auto before1=a1;
  CHECK(fn(a0,a1) == 33LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 16",[&]{
  auto a0=Vec<Int>{7LL,6LL,5LL,11LL,6LL,10LL,7LL,9LL,3LL,2LL,6LL,5LL,3LL,2LL,2LL,1LL}; auto before0=a0;
  auto a1=7LL; auto before1=a1;
  CHECK(fn(a0,a1) == 16LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("capacity sample 17",[&]{
  auto a0=Vec<Int>{4LL,3LL,2LL,11LL,1LL,9LL,5LL,4LL,4LL,6LL,10LL,3LL,3LL,9LL,2LL,2LL,7LL}; auto before0=a0;
  auto a1=5LL; auto before1=a1;
  CHECK(fn(a0,a1) == 20LL);
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
 test::run("invalid input",[&]{
  auto a0=Vec<Int>{0LL}; auto before0=a0;
  auto a1=1LL; auto before1=a1;
  INVALID(fn(a0,a1));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
