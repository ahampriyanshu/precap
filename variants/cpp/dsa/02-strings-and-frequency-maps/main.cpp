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
 test::run("multiplicity beats sets",[&]{
  auto a0=U"ab"; auto before0=a0;
  auto a1=U"aaa"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("case and punctuation",[&]{
  auto a0=U"A-b 2"; auto before0=a0;
  auto a1=U"BAAA!"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty strings",[&]{
  auto a0=U""; auto before0=a0;
  auto a1=U""; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("unicode letters",[&]{
  auto a0=U"éÉ"; auto before0=a0;
  auto a1=U"ééé"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U000000e9',1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("casefold expansion",[&]{
  auto a0=U"ß"; auto before0=a0;
  auto a1=U"SS"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 0",[&]{
  auto a0=U""; auto before0=a0;
  auto a1=U" a?A"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 1",[&]{
  auto a0=U"C"; auto before0=a0;
  auto a1=U"A AbB"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',2LL},{U'\U00000062',2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 2",[&]{
  auto a0=U"!a"; auto before0=a0;
  auto a1=U"?  ?BB"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000062',2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 3",[&]{
  auto a0=U"c b"; auto before0=a0;
  auto a1=U"?B abbb"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',1LL},{U'\U00000062',3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 4",[&]{
  auto a0=U"AAAa"; auto before0=a0;
  auto a1=U" BBa??AB"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000062',3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 5",[&]{
  auto a0=U" !aca"; auto before0=a0;
  auto a1=U"??AAbA c?"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',1LL},{U'\U00000062',1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 6",[&]{
  auto a0=U"bcaaaB"; auto before0=a0;
  auto a1=U"ABAbcBbAaA"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',2LL},{U'\U00000062',2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 7",[&]{
  auto a0=U"C!BbA C"; auto before0=a0;
  auto a1=U"?cbBbbaA ?A"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',2LL},{U'\U00000062',2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 8",[&]{
  auto a0=U"Cb!aBabA"; auto before0=a0;
  auto a1=U" b?bb abbba?"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000062',3LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 9",[&]{
  auto a0=U"A!cAaC!aC"; auto before0=a0;
  auto a1=U"ba?aB?Ba?A BB"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000062',5LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 10",[&]{
  auto a0=U" cB!cbBB c"; auto before0=a0;
  auto a1=U" bacAc?? Baaac"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',5LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 11",[&]{
  auto a0=U"!baBBBabaa!"; auto before0=a0;
  auto a1=U"  BA?BA cBAaAbA"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',2LL},{U'\U00000063',1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 12",[&]{
  auto a0=U"bB!bCbAAbbCc"; auto before0=a0;
  auto a1=U" bAAaABA a  BcBA"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',5LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 13",[&]{
  auto a0=U"cCc!ba!bcbAcB"; auto before0=a0;
  auto a1=U"aB?AA  b Babc aaB"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{{U'\U00000061',4LL},{U'\U00000062',1LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("generated text 14",[&]{
  auto a0=U"ABAaBaBaBCcCb!"; auto before0=a0;
  auto a1=U"A ABcB ?A?c?BAc b?"; auto before1=a1;
  CHECK(fn(a0,a1) == std::map<char32_t,Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
