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
 test::run("overlapping matches",[&]{
  auto a0=U"ababa"; auto before0=a0;
  auto a1=U"aba"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,2LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("repeated prefix",[&]{
  auto a0=U"aaaaa"; auto before0=a0;
  auto a1=U"aa"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,1LL,2LL,3LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("all boundaries",[&]{
  auto a0=U"abc"; auto before0=a0;
  auto a1=U""; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,1LL,2LL,3LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty text",[&]{
  auto a0=U""; auto before0=a0;
  auto a1=U"x"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("unicode indices",[&]{
  auto a0=U"ééé"; auto before0=a0;
  auto a1=U"éé"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,1LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 0",[&]{
  auto a0=U"aaaab"; auto before0=a0;
  auto a1=U"bab"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 1",[&]{
  auto a0=U"abaaab"; auto before0=a0;
  auto a1=U"abb"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 2",[&]{
  auto a0=U"babaaaa"; auto before0=a0;
  auto a1=U"aab"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 3",[&]{
  auto a0=U"bbbaabab"; auto before0=a0;
  auto a1=U"bba"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{1LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 4",[&]{
  auto a0=U"bbbbbabba"; auto before0=a0;
  auto a1=U"aab"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 5",[&]{
  auto a0=U"bbaaabbaab"; auto before0=a0;
  auto a1=U"baa"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{1LL,6LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 6",[&]{
  auto a0=U"aaababaabbb"; auto before0=a0;
  auto a1=U"abb"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{7LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 7",[&]{
  auto a0=U"abaabaabbbab"; auto before0=a0;
  auto a1=U"bba"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{8LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 8",[&]{
  auto a0=U"babaaabbbbaba"; auto before0=a0;
  auto a1=U"bba"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{8LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 9",[&]{
  auto a0=U"bbaabbaaaabbbb"; auto before0=a0;
  auto a1=U"aaa"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{6LL,7LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 10",[&]{
  auto a0=U"bbbaaabbaabaaab"; auto before0=a0;
  auto a1=U"aaa"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{3LL,11LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 11",[&]{
  auto a0=U"baabaaabaabaaabb"; auto before0=a0;
  auto a1=U"bba"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 12",[&]{
  auto a0=U"abbabbababbaababa"; auto before0=a0;
  auto a1=U"bbb"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 13",[&]{
  auto a0=U"baabbbbbaaabaaaaab"; auto before0=a0;
  auto a1=U"aaa"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{8LL,12LL,13LL,14LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 14",[&]{
  auto a0=U"bbbabbbbaaaabbaabaa"; auto before0=a0;
  auto a1=U"abb"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{3LL,11LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 15",[&]{
  auto a0=U"bbabbbabaaaababaabba"; auto before0=a0;
  auto a1=U"aaa"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{8LL,9LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 16",[&]{
  auto a0=U"ababaaabbbbbbaaabbbbb"; auto before0=a0;
  auto a1=U"aaa"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{4LL,13LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated transcript 17",[&]{
  auto a0=U"abbbabbbbaabbaababbbab"; auto before0=a0;
  auto a1=U"abb"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,4LL,10LL,16LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 test::run("long repeated prefix",[&]{
  auto a0=U"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"; auto before0=a0;
  auto a1=U"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{260LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
