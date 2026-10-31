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
 test::run("must undo the first choice",[&]{
  auto a0=Vec<Vec<Text>>{Vec<Text>{U"A",U"B"},Vec<Text>{U"A"}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{Vec<Text>{U"B",U"A"}});
  CHECK(a0 == before0);
 });
 test::run("impossible",[&]{
  auto a0=Vec<Vec<Text>>{Vec<Text>{U"A"},Vec<Text>{U"A"}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{});
  CHECK(a0 == before0);
 });
 test::run("no positions",[&]{
  auto a0=Vec<Vec<Text>>{}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{Vec<Text>{}});
  CHECK(a0 == before0);
 });
 test::run("no allowed choice",[&]{
  auto a0=Vec<Vec<Text>>{Vec<Text>{}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{});
  CHECK(a0 == before0);
 });
 test::run("allowed choices 0",[&]{
  auto a0=Vec<Vec<Text>>{}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{Vec<Text>{}});
  CHECK(a0 == before0);
 });
 test::run("allowed choices 1",[&]{
  auto a0=Vec<Vec<Text>>{Vec<Text>{U"D",U"D",U"B"}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{Vec<Text>{U"B"}});
  CHECK(a0 == before0);
 });
 test::run("allowed choices 2",[&]{
  auto a0=Vec<Vec<Text>>{Vec<Text>{U"B"},Vec<Text>{U"B",U"D",U"A"}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{Vec<Text>{U"B",U"A"}});
  CHECK(a0 == before0);
 });
 test::run("allowed choices 3",[&]{
  auto a0=Vec<Vec<Text>>{Vec<Text>{U"B"},Vec<Text>{},Vec<Text>{U"D",U"B"}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{});
  CHECK(a0 == before0);
 });
 test::run("allowed choices 4",[&]{
  auto a0=Vec<Vec<Text>>{Vec<Text>{U"D"},Vec<Text>{U"D",U"D",U"B",U"B"},Vec<Text>{U"C"},Vec<Text>{U"B",U"A"}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{Vec<Text>{U"D",U"B",U"C",U"A"}});
  CHECK(a0 == before0);
 });
 test::run("allowed choices 5",[&]{
  auto a0=Vec<Vec<Text>>{Vec<Text>{U"D",U"C",U"A",U"B"},Vec<Text>{U"B",U"B",U"A",U"D"},Vec<Text>{U"D"},Vec<Text>{U"C",U"B",U"D",U"A"},Vec<Text>{U"D"}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{});
  CHECK(a0 == before0);
 });
 test::run("allowed choices 6",[&]{
  auto a0=Vec<Vec<Text>>{Vec<Text>{},Vec<Text>{U"A",U"A",U"B"},Vec<Text>{U"A",U"C",U"B"},Vec<Text>{},Vec<Text>{U"C",U"A",U"C",U"C"},Vec<Text>{U"A"}}; auto before0=a0;
  CHECK(fn(a0) == Opt<Vec<Text>>{});
  CHECK(a0 == before0);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
