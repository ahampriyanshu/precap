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
 test::run("terminal and duplicate",[&]{
  auto a0=Vec<Text>{U"cold",U"colder",U"coal",U"cold"}; auto before0=a0;
  auto a1=U"co"; auto before1=a1;
  auto a2=3LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{U"coal",U"cold",U"colder"});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("empty word and case",[&]{
  auto a0=Vec<Text>{U"",U"A",U"a"}; auto before0=a0;
  auto a1=U""; auto before1=a1;
  auto a2=9LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{U"",U"A",U"a"});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("empty word list",[&]{
  auto a0=Vec<Text>{}; auto before0=a0;
  auto a1=U"x"; auto before1=a1;
  auto a2=2LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("zero limit",[&]{
  auto a0=Vec<Text>{U"a"}; auto before0=a0;
  auto a1=U"a"; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='' limit=1",[&]{
  auto a0=Vec<Text>{U"caa",U"a",U"cabb",U"ac",U"ccb",U"bbb",U"cb",U"baab",U"c",U"c",U"",U"",U"bcba",U"bbaa",U"aa",U"a",U"ab",U"cab",U"a",U"ccc"}; auto before0=a0;
  auto a1=U""; auto before1=a1;
  auto a2=1LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{U""});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='' limit=3",[&]{
  auto a0=Vec<Text>{U"aab",U"aaa",U"a",U"bca",U"ccac",U"c",U"c",U"",U"caaa",U"",U"acb",U"",U"bcaa",U"cb",U"aa",U"a",U"cca",U"",U"",U"cbab"}; auto before0=a0;
  auto a1=U""; auto before1=a1;
  auto a2=3LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{U"",U"a",U"aa"});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='' limit=8",[&]{
  auto a0=Vec<Text>{U"bb",U"",U"b",U"ccb",U"c",U"aa",U"cac",U"",U"",U"bc",U"a",U"c",U"a",U"a",U"bbb",U"ccca",U"ac",U"c",U"bcc",U"bc"}; auto before0=a0;
  auto a1=U""; auto before1=a1;
  auto a2=8LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{U"",U"a",U"aa",U"ac",U"b",U"bb",U"bbb",U"bc"});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='a' limit=1",[&]{
  auto a0=Vec<Text>{U"",U"",U"bcba",U"aa",U"",U"b",U"",U"acbc",U"bcb",U"",U"",U"b",U"bbbb",U"aaa",U"",U"a",U"bb",U"b",U"aac",U"bcb"}; auto before0=a0;
  auto a1=U"a"; auto before1=a1;
  auto a2=1LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{U"a"});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='a' limit=3",[&]{
  auto a0=Vec<Text>{U"bbaa",U"cba",U"",U"",U"aca",U"",U"b",U"ca",U"c",U"a",U"a",U"c",U"ca",U"acac",U"b",U"bcb",U"abc",U"acba",U"bba",U"bb"}; auto before0=a0;
  auto a1=U"a"; auto before1=a1;
  auto a2=3LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{U"a",U"abc",U"aca"});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='a' limit=8",[&]{
  auto a0=Vec<Text>{U"aa",U"cc",U"bc",U"abb",U"c",U"",U"",U"",U"c",U"bcaa",U"c",U"bb",U"cbc",U"ba",U"baba",U"aba",U"ac",U"",U"cba",U"c"}; auto before0=a0;
  auto a1=U"a"; auto before1=a1;
  auto a2=8LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{U"aa",U"aba",U"abb",U"ac"});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='ab' limit=1",[&]{
  auto a0=Vec<Text>{U"a",U"bab",U"cac",U"baa",U"a",U"c",U"",U"bac",U"",U"ccb",U"bccb",U"ac",U"cb",U"bbab",U"c",U"bb",U"",U"",U"accb",U"ab"}; auto before0=a0;
  auto a1=U"ab"; auto before1=a1;
  auto a2=1LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{U"ab"});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='ab' limit=3",[&]{
  auto a0=Vec<Text>{U"cbaa",U"",U"ba",U"ccc",U"bc",U"aacb",U"cbb",U"ac",U"baba",U"a",U"cacb",U"ccc",U"aca",U"b",U"",U"a",U"c",U"bbc",U"baba",U""}; auto before0=a0;
  auto a1=U"ab"; auto before1=a1;
  auto a2=3LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='ab' limit=8",[&]{
  auto a0=Vec<Text>{U"b",U"a",U"ca",U"ba",U"cbc",U"acaa",U"b",U"cc",U"bbca",U"b",U"",U"baa",U"a",U"",U"c",U"",U"c",U"c",U"bab",U"c"}; auto before0=a0;
  auto a1=U"ab"; auto before1=a1;
  auto a2=8LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='z' limit=1",[&]{
  auto a0=Vec<Text>{U"a",U"ccb",U"cbb",U"cb",U"a",U"",U"bb",U"cc",U"",U"cca",U"cbbb",U"",U"acba",U"cab",U"",U"",U"",U"cc",U"bac",U"ba"}; auto before0=a0;
  auto a1=U"z"; auto before1=a1;
  auto a2=1LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='z' limit=3",[&]{
  auto a0=Vec<Text>{U"",U"bcc",U"",U"c",U"ac",U"ac",U"aab",U"cba",U"bbcc",U"b",U"abac",U"ba",U"bba",U"abcc",U"c",U"ac",U"",U"a",U"bbcc",U"cbb"}; auto before0=a0;
  auto a1=U"z"; auto before1=a1;
  auto a2=3LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("prefix='z' limit=8",[&]{
  auto a0=Vec<Text>{U"cab",U"c",U"a",U"ab",U"c",U"",U"",U"aabb",U"c",U"aa",U"a",U"cac",U"cba",U"",U"",U"cb",U"ac",U"ac",U"",U""}; auto before0=a0;
  auto a1=U"z"; auto before1=a1;
  auto a2=8LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Text>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("invalid input",[&]{
  auto a0=Vec<Text>{U"a"}; auto before0=a0;
  auto a1=U""; auto before1=a1;
  auto a2=-1LL; auto before2=a2;
  INVALID(fn(a0,a1,a2));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
