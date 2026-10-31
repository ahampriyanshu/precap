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
 test::run("three different edits",[&]{
  auto a0=U"kitten"; auto before0=a0;
  auto a1=U"sitting"; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("no transposition shortcut",[&]{
  auto a0=U"ab"; auto before0=a0;
  auto a1=U"ba"; auto before1=a1;
  CHECK(fn(a0,a1) == 2LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty boundary",[&]{
  auto a0=U""; auto before0=a0;
  auto a1=U"abc"; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("no normalization",[&]{
  auto a0=U"é"; auto before0=a0;
  auto a1=U"e"; auto before1=a1;
  CHECK(fn(a0,a1) == 1LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 0",[&]{
  auto a0=U""; auto before0=a0;
  auto a1=U"abacca"; auto before1=a1;
  CHECK(fn(a0,a1) == 6LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 1",[&]{
  auto a0=U"c"; auto before0=a0;
  auto a1=U"bcabbb"; auto before1=a1;
  CHECK(fn(a0,a1) == 5LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 2",[&]{
  auto a0=U"ac"; auto before0=a0;
  auto a1=U"bcabca"; auto before1=a1;
  CHECK(fn(a0,a1) == 4LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 3",[&]{
  auto a0=U"aca"; auto before0=a0;
  auto a1=U"cbbcab"; auto before1=a1;
  CHECK(fn(a0,a1) == 4LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 4",[&]{
  auto a0=U"babb"; auto before0=a0;
  auto a1=U"cbaaba"; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 5",[&]{
  auto a0=U"baccc"; auto before0=a0;
  auto a1=U"abcbcb"; auto before1=a1;
  CHECK(fn(a0,a1) == 4LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 6",[&]{
  auto a0=U"baccbc"; auto before0=a0;
  auto a1=U"baabba"; auto before1=a1;
  CHECK(fn(a0,a1) == 3LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 7",[&]{
  auto a0=U"aabbcba"; auto before0=a0;
  auto a1=U"cbaaaa"; auto before1=a1;
  CHECK(fn(a0,a1) == 5LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 8",[&]{
  auto a0=U"bbbbabba"; auto before0=a0;
  auto a1=U"bcaccc"; auto before1=a1;
  CHECK(fn(a0,a1) == 6LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 9",[&]{
  auto a0=U"acaabbbbb"; auto before0=a0;
  auto a1=U"ababbc"; auto before1=a1;
  CHECK(fn(a0,a1) == 5LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 10",[&]{
  auto a0=U"ccbbcccbbc"; auto before0=a0;
  auto a1=U"bccaca"; auto before1=a1;
  CHECK(fn(a0,a1) == 7LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 11",[&]{
  auto a0=U"aababcabbcc"; auto before0=a0;
  auto a1=U"bccbcc"; auto before1=a1;
  CHECK(fn(a0,a1) == 6LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("string pair 12",[&]{
  auto a0=U"cababbaabccc"; auto before0=a0;
  auto a1=U"bbaaba"; auto before1=a1;
  CHECK(fn(a0,a1) == 7LL);
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
