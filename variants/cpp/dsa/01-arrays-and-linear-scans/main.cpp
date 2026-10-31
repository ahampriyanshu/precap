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
 test::run("first maximum wins",[&]{
  auto a0=Vec<Int>{8LL,2LL,8LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{18LL,Opt<Int>{0LL}});
  CHECK(a0 == before0);
 });
 test::run("empty input",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{0LL,Opt<Int>{}});
  CHECK(a0 == before0);
 });
 test::run("one zero",[&]{
  auto a0=Vec<Int>{0LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{0LL,Opt<Int>{0LL}});
  CHECK(a0 == before0);
 });
 test::run("wide signed accumulator",[&]{
  auto a0=Vec<Int>{4000000000000000000LL,1LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{4000000000000000001LL,Opt<Int>{0LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 2",[&]{
  auto a0=Vec<Int>{2LL,6LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{8LL,Opt<Int>{1LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 3",[&]{
  auto a0=Vec<Int>{10LL,11LL,15LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{36LL,Opt<Int>{2LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 4",[&]{
  auto a0=Vec<Int>{21LL,28LL,6LL,24LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{79LL,Opt<Int>{1LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 5",[&]{
  auto a0=Vec<Int>{14LL,21LL,9LL,27LL,17LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{88LL,Opt<Int>{3LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 6",[&]{
  auto a0=Vec<Int>{13LL,9LL,3LL,23LL,19LL,7LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{74LL,Opt<Int>{3LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 7",[&]{
  auto a0=Vec<Int>{27LL,23LL,9LL,16LL,20LL,5LL,9LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{109LL,Opt<Int>{0LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 8",[&]{
  auto a0=Vec<Int>{21LL,22LL,28LL,29LL,22LL,29LL,3LL,16LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{170LL,Opt<Int>{3LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 9",[&]{
  auto a0=Vec<Int>{7LL,15LL,15LL,28LL,25LL,26LL,0LL,28LL,23LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{167LL,Opt<Int>{3LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 10",[&]{
  auto a0=Vec<Int>{20LL,29LL,22LL,16LL,9LL,24LL,5LL,28LL,28LL,23LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{204LL,Opt<Int>{1LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 11",[&]{
  auto a0=Vec<Int>{28LL,19LL,19LL,2LL,18LL,13LL,13LL,4LL,24LL,26LL,20LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{186LL,Opt<Int>{0LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 12",[&]{
  auto a0=Vec<Int>{16LL,11LL,6LL,5LL,0LL,5LL,20LL,11LL,6LL,20LL,28LL,12LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{140LL,Opt<Int>{10LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 13",[&]{
  auto a0=Vec<Int>{14LL,2LL,12LL,23LL,10LL,28LL,15LL,23LL,14LL,5LL,11LL,0LL,11LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{168LL,Opt<Int>{5LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 14",[&]{
  auto a0=Vec<Int>{25LL,25LL,18LL,5LL,17LL,25LL,5LL,4LL,12LL,3LL,12LL,29LL,27LL,26LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{233LL,Opt<Int>{11LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 15",[&]{
  auto a0=Vec<Int>{29LL,20LL,3LL,18LL,18LL,23LL,0LL,15LL,24LL,25LL,25LL,28LL,27LL,6LL,4LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{265LL,Opt<Int>{0LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 16",[&]{
  auto a0=Vec<Int>{27LL,17LL,6LL,7LL,9LL,16LL,28LL,15LL,7LL,27LL,13LL,16LL,9LL,6LL,15LL,13LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{231LL,Opt<Int>{6LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 17",[&]{
  auto a0=Vec<Int>{2LL,4LL,0LL,5LL,26LL,22LL,3LL,12LL,12LL,18LL,18LL,3LL,4LL,1LL,21LL,4LL,25LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{180LL,Opt<Int>{4LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 18",[&]{
  auto a0=Vec<Int>{8LL,0LL,29LL,2LL,28LL,8LL,0LL,24LL,1LL,8LL,13LL,2LL,26LL,5LL,6LL,20LL,16LL,2LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{198LL,Opt<Int>{2LL}});
  CHECK(a0 == before0);
 });
 test::run("generated length 19",[&]{
  auto a0=Vec<Int>{29LL,6LL,10LL,9LL,0LL,8LL,4LL,27LL,16LL,0LL,19LL,3LL,8LL,16LL,8LL,16LL,17LL,13LL,13LL}; auto before0=a0;
  CHECK(fn(a0) == std::pair<Int,Opt<Int>>{222LL,Opt<Int>{0LL}});
  CHECK(a0 == before0);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
