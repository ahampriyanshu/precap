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
 test::run("head and adjacent removals",[&]{
  auto a0=Vec<Int>{1LL,2LL,3LL,2LL,4LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,2LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{3LL,4LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("empty list",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=Vec<Int>{1LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("all values removed",[&]{
  auto a0=Vec<Int>{1LL,1LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("no blocked values",[&]{
  auto a0=Vec<Int>{1LL,2LL}; auto before0=a0;
  auto a1=Vec<Int>{}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{1LL,2LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 0",[&]{
  auto a0=Vec<Int>{}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 1",[&]{
  auto a0=Vec<Int>{0LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 2",[&]{
  auto a0=Vec<Int>{5LL,3LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{5LL,3LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 3",[&]{
  auto a0=Vec<Int>{1LL,1LL,2LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{2LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 4",[&]{
  auto a0=Vec<Int>{3LL,3LL,5LL,0LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{3LL,3LL,5LL,0LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 5",[&]{
  auto a0=Vec<Int>{0LL,2LL,4LL,5LL,2LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,2LL,5LL,2LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 6",[&]{
  auto a0=Vec<Int>{2LL,5LL,5LL,4LL,0LL,2LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{2LL,5LL,5LL,0LL,2LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 7",[&]{
  auto a0=Vec<Int>{1LL,5LL,5LL,3LL,3LL,5LL,5LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{5LL,5LL,3LL,3LL,5LL,5LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 8",[&]{
  auto a0=Vec<Int>{3LL,4LL,2LL,2LL,4LL,4LL,5LL,4LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{3LL,2LL,2LL,5LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 9",[&]{
  auto a0=Vec<Int>{1LL,1LL,3LL,5LL,5LL,0LL,4LL,4LL,3LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{3LL,5LL,5LL,0LL,3LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 10",[&]{
  auto a0=Vec<Int>{4LL,1LL,1LL,0LL,1LL,5LL,2LL,0LL,5LL,4LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,5LL,2LL,0LL,5LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 11",[&]{
  auto a0=Vec<Int>{3LL,3LL,5LL,1LL,5LL,5LL,2LL,1LL,4LL,5LL,5LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{3LL,3LL,5LL,5LL,5LL,2LL,5LL,5LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 12",[&]{
  auto a0=Vec<Int>{5LL,0LL,0LL,5LL,3LL,3LL,1LL,1LL,2LL,1LL,5LL,4LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{5LL,0LL,0LL,5LL,3LL,3LL,2LL,5LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 13",[&]{
  auto a0=Vec<Int>{4LL,5LL,2LL,4LL,4LL,0LL,0LL,1LL,0LL,3LL,1LL,2LL,5LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{5LL,2LL,0LL,0LL,0LL,3LL,2LL,5LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 test::run("linked list 14",[&]{
  auto a0=Vec<Int>{1LL,0LL,5LL,4LL,1LL,3LL,0LL,0LL,5LL,0LL,4LL,5LL,1LL,5LL}; auto before0=a0;
  auto a1=Vec<Int>{1LL,4LL}; auto before1=a1;
  CHECK(fn(a0,a1) == Vec<Int>{0LL,5LL,3LL,0LL,0LL,5LL,0LL,5LL,5LL});
  CHECK(a0 == before0);
  CHECK(a1 == before1);
 });
 if(final) {
 }
test::run("retained addresses and detached ownership",[&]{
 auto a=std::make_unique<Node>(1); a->next=std::make_unique<Node>(2);a->next->next=std::make_unique<Node>(3);a->next->next->next=std::make_unique<Node>(2);
 Node* kept=a->next->next.get(); std::set<Int> blocked{1,2}; auto out=detach(std::move(a),blocked);
 CHECK(!a); CHECK(out.get()==kept);CHECK(out->value==3);CHECK(!out->next);CHECK(blocked==std::set<Int>({1,2}));
 auto empty=detach(nullptr,{});CHECK(!empty);auto all=detach(std::make_unique<Node>(1),{1});CHECK(!all);
});

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
