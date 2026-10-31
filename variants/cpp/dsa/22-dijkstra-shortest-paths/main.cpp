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
 test::run("discovery is not finalization",[&]{
  auto a0=4LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,10LL},std::tuple<Int,Int,Int>{0LL,2LL,1LL},std::tuple<Int,Int,Int>{2LL,1LL,1LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{2LL},Opt<Int>{1LL},Opt<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("zero cycle and stale entry",[&]{
  auto a0=3LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,0LL},std::tuple<Int,Int,Int>{1LL,0LL,0LL},std::tuple<Int,Int,Int>{1LL,2LL,2LL},std::tuple<Int,Int,Int>{0LL,2LL,9LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{0LL},Opt<Int>{2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 1",[&]{
  auto a0=1LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 2",[&]{
  auto a0=2LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 3",[&]{
  auto a0=3LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{2LL,1LL,2LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{},Opt<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 4",[&]{
  auto a0=4LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{2LL,1LL,2LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{},Opt<Int>{},Opt<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 5",[&]{
  auto a0=5LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,0LL,7LL},std::tuple<Int,Int,Int>{4LL,0LL,8LL},std::tuple<Int,Int,Int>{4LL,1LL,0LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{},Opt<Int>{},Opt<Int>{},Opt<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 6",[&]{
  auto a0=6LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{2LL,1LL,8LL},std::tuple<Int,Int,Int>{2LL,3LL,7LL},std::tuple<Int,Int,Int>{3LL,0LL,6LL},std::tuple<Int,Int,Int>{4LL,0LL,1LL},std::tuple<Int,Int,Int>{4LL,2LL,7LL},std::tuple<Int,Int,Int>{5LL,0LL,1LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{},Opt<Int>{},Opt<Int>{},Opt<Int>{},Opt<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 7",[&]{
  auto a0=7LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{1LL,4LL,5LL},std::tuple<Int,Int,Int>{1LL,5LL,1LL},std::tuple<Int,Int,Int>{2LL,3LL,0LL},std::tuple<Int,Int,Int>{2LL,6LL,7LL},std::tuple<Int,Int,Int>{3LL,3LL,4LL},std::tuple<Int,Int,Int>{6LL,2LL,2LL},std::tuple<Int,Int,Int>{6LL,3LL,0LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{},Opt<Int>{},Opt<Int>{},Opt<Int>{},Opt<Int>{},Opt<Int>{}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 8",[&]{
  auto a0=8LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,3LL,0LL},std::tuple<Int,Int,Int>{0LL,4LL,6LL},std::tuple<Int,Int,Int>{1LL,0LL,2LL},std::tuple<Int,Int,Int>{1LL,4LL,3LL},std::tuple<Int,Int,Int>{1LL,5LL,5LL},std::tuple<Int,Int,Int>{1LL,7LL,7LL},std::tuple<Int,Int,Int>{4LL,6LL,1LL},std::tuple<Int,Int,Int>{4LL,7LL,6LL},std::tuple<Int,Int,Int>{5LL,0LL,0LL},std::tuple<Int,Int,Int>{5LL,1LL,6LL},std::tuple<Int,Int,Int>{5LL,4LL,0LL},std::tuple<Int,Int,Int>{5LL,5LL,2LL},std::tuple<Int,Int,Int>{7LL,6LL,8LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{},Opt<Int>{},Opt<Int>{0LL},Opt<Int>{6LL},Opt<Int>{},Opt<Int>{7LL},Opt<Int>{12LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 9",[&]{
  auto a0=9LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,8LL,6LL},std::tuple<Int,Int,Int>{1LL,0LL,3LL},std::tuple<Int,Int,Int>{2LL,0LL,6LL},std::tuple<Int,Int,Int>{2LL,1LL,1LL},std::tuple<Int,Int,Int>{3LL,2LL,0LL},std::tuple<Int,Int,Int>{3LL,6LL,1LL},std::tuple<Int,Int,Int>{4LL,2LL,2LL},std::tuple<Int,Int,Int>{4LL,5LL,6LL},std::tuple<Int,Int,Int>{5LL,3LL,4LL},std::tuple<Int,Int,Int>{5LL,4LL,7LL},std::tuple<Int,Int,Int>{5LL,6LL,5LL},std::tuple<Int,Int,Int>{5LL,8LL,2LL},std::tuple<Int,Int,Int>{6LL,1LL,0LL},std::tuple<Int,Int,Int>{6LL,3LL,7LL},std::tuple<Int,Int,Int>{6LL,5LL,1LL},std::tuple<Int,Int,Int>{6LL,7LL,3LL},std::tuple<Int,Int,Int>{7LL,8LL,8LL},std::tuple<Int,Int,Int>{8LL,2LL,1LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{8LL},Opt<Int>{7LL},Opt<Int>{},Opt<Int>{},Opt<Int>{},Opt<Int>{},Opt<Int>{},Opt<Int>{6LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 10",[&]{
  auto a0=10LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,0LL,8LL},std::tuple<Int,Int,Int>{0LL,7LL,8LL},std::tuple<Int,Int,Int>{0LL,9LL,2LL},std::tuple<Int,Int,Int>{1LL,2LL,7LL},std::tuple<Int,Int,Int>{2LL,2LL,6LL},std::tuple<Int,Int,Int>{2LL,3LL,5LL},std::tuple<Int,Int,Int>{2LL,8LL,7LL},std::tuple<Int,Int,Int>{2LL,9LL,2LL},std::tuple<Int,Int,Int>{3LL,0LL,4LL},std::tuple<Int,Int,Int>{3LL,3LL,6LL},std::tuple<Int,Int,Int>{4LL,5LL,5LL},std::tuple<Int,Int,Int>{5LL,4LL,3LL},std::tuple<Int,Int,Int>{5LL,9LL,8LL},std::tuple<Int,Int,Int>{6LL,2LL,3LL},std::tuple<Int,Int,Int>{6LL,6LL,5LL},std::tuple<Int,Int,Int>{6LL,8LL,5LL},std::tuple<Int,Int,Int>{6LL,9LL,0LL},std::tuple<Int,Int,Int>{7LL,1LL,1LL},std::tuple<Int,Int,Int>{7LL,2LL,3LL},std::tuple<Int,Int,Int>{8LL,8LL,1LL},std::tuple<Int,Int,Int>{8LL,9LL,1LL},std::tuple<Int,Int,Int>{9LL,0LL,4LL},std::tuple<Int,Int,Int>{9LL,4LL,3LL},std::tuple<Int,Int,Int>{9LL,5LL,8LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{9LL},Opt<Int>{11LL},Opt<Int>{16LL},Opt<Int>{5LL},Opt<Int>{10LL},Opt<Int>{},Opt<Int>{8LL},Opt<Int>{18LL},Opt<Int>{2LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 11",[&]{
  auto a0=11LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,8LL,4LL},std::tuple<Int,Int,Int>{1LL,0LL,0LL},std::tuple<Int,Int,Int>{1LL,1LL,1LL},std::tuple<Int,Int,Int>{1LL,2LL,3LL},std::tuple<Int,Int,Int>{1LL,3LL,2LL},std::tuple<Int,Int,Int>{1LL,7LL,3LL},std::tuple<Int,Int,Int>{1LL,8LL,5LL},std::tuple<Int,Int,Int>{2LL,3LL,3LL},std::tuple<Int,Int,Int>{3LL,4LL,5LL},std::tuple<Int,Int,Int>{3LL,5LL,2LL},std::tuple<Int,Int,Int>{3LL,8LL,3LL},std::tuple<Int,Int,Int>{4LL,1LL,0LL},std::tuple<Int,Int,Int>{4LL,2LL,8LL},std::tuple<Int,Int,Int>{4LL,9LL,8LL},std::tuple<Int,Int,Int>{5LL,3LL,3LL},std::tuple<Int,Int,Int>{5LL,6LL,2LL},std::tuple<Int,Int,Int>{6LL,0LL,2LL},std::tuple<Int,Int,Int>{7LL,0LL,0LL},std::tuple<Int,Int,Int>{7LL,9LL,2LL},std::tuple<Int,Int,Int>{8LL,10LL,8LL},std::tuple<Int,Int,Int>{9LL,7LL,6LL},std::tuple<Int,Int,Int>{10LL,3LL,1LL},std::tuple<Int,Int,Int>{10LL,7LL,0LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{18LL},Opt<Int>{21LL},Opt<Int>{13LL},Opt<Int>{18LL},Opt<Int>{15LL},Opt<Int>{17LL},Opt<Int>{12LL},Opt<Int>{4LL},Opt<Int>{14LL},Opt<Int>{12LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("weighted graph 12",[&]{
  auto a0=12LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,9LL,0LL},std::tuple<Int,Int,Int>{0LL,10LL,0LL},std::tuple<Int,Int,Int>{1LL,1LL,2LL},std::tuple<Int,Int,Int>{1LL,5LL,8LL},std::tuple<Int,Int,Int>{1LL,11LL,7LL},std::tuple<Int,Int,Int>{3LL,0LL,7LL},std::tuple<Int,Int,Int>{3LL,11LL,0LL},std::tuple<Int,Int,Int>{4LL,1LL,6LL},std::tuple<Int,Int,Int>{4LL,2LL,0LL},std::tuple<Int,Int,Int>{4LL,9LL,6LL},std::tuple<Int,Int,Int>{5LL,3LL,2LL},std::tuple<Int,Int,Int>{5LL,8LL,4LL},std::tuple<Int,Int,Int>{6LL,10LL,5LL},std::tuple<Int,Int,Int>{7LL,7LL,5LL},std::tuple<Int,Int,Int>{8LL,2LL,0LL},std::tuple<Int,Int,Int>{8LL,5LL,5LL},std::tuple<Int,Int,Int>{9LL,7LL,8LL},std::tuple<Int,Int,Int>{9LL,9LL,6LL},std::tuple<Int,Int,Int>{9LL,10LL,7LL},std::tuple<Int,Int,Int>{10LL,1LL,6LL},std::tuple<Int,Int,Int>{10LL,6LL,2LL},std::tuple<Int,Int,Int>{10LL,7LL,4LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  CHECK(fn(a0,a1,a2) == Vec<Opt<Int>>{Opt<Int>{0LL},Opt<Int>{6LL},Opt<Int>{18LL},Opt<Int>{16LL},Opt<Int>{},Opt<Int>{14LL},Opt<Int>{2LL},Opt<Int>{4LL},Opt<Int>{18LL},Opt<Int>{0LL},Opt<Int>{0LL},Opt<Int>{13LL}});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("invalid input",[&]{
  auto a0=2LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{std::tuple<Int,Int,Int>{0LL,1LL,-1LL}}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
  INVALID(fn(a0,a1,a2));
  CHECK(a0 == before0);
  CHECK(a1 == before1);
  CHECK(a2 == before2);
 });
 test::run("invalid input",[&]{
  auto a0=0LL; auto before0=a0;
  auto a1=Vec<std::tuple<Int,Int,Int>>{}; auto before1=a1;
  auto a2=0LL; auto before2=a2;
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
