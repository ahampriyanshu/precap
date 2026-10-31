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
if(!final){test::run("ASCII runs Unicode separators and lowercase expansions",[&]{CHECK(tokenize(U"Hi HI-42 café_猫")==Strings({"hi","hi","42","caf"}));CHECK(tokenize(U"İX K")==Strings({"i","x","k"}));CHECK(tokenize(U"---").empty());auto a=tokenize(U"A A");a.clear();CHECK(tokenize(U"A A").size()==2);});}
else{test::run("overlapping phrases replacement stale cleanup and stats",[&]{SearchEngine s;CHECK(s.add("b",U"A a a"));CHECK(s.add("a",U"a a"));CHECK(!s.add("a",U"wrong"));CHECK(s.stats()==Pair(2,5));CHECK(s.search(U"A")==Vec<std::pair<std::string,Int>>({{"b",3},{"a",2}}));CHECK(s.search_phrase(U"a a")==Vec<std::pair<std::string,Int>>({{"b",2},{"a",1}}));CHECK(s.update("b",U"new"));CHECK(s.search(U"a")==Vec<std::pair<std::string,Int>>({{"a",2}}));CHECK(s.stats()==Pair(2,3));CHECK(s.erase("a"));CHECK(s.add("a",U""));CHECK(s.search(U"a").empty());CHECK(s.stats()==Pair(2,1));INVALID(s.search(U"two tokens",0));INVALID(s.search_phrase(U"",-1));CHECK(s.search_phrase(U"---").empty());CHECK(s.get("b")==U"new");CHECK(!s.update("missing",U"x"));SearchEngine other;CHECK(other.stats()==Pair(0,0));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("tie ranking zero limits ASCII separators and detached results",[&]{SearchEngine s;s.add("b",U"cat 42 cat");s.add("a",U"cat cat");s.add("empty",U"猫");CHECK(s.search(U"cat",1)==Vec<std::pair<std::string,Int>>({{"a",2}}));CHECK(s.search(U"cat",0).empty());CHECK(s.search(U"at").empty());CHECK(s.search_phrase(U"CAT---42")==Vec<std::pair<std::string,Int>>({{"b",1}}));auto result=s.search(U"cat");result[0].second=99;CHECK(s.search(U"cat")[0].second==2);INVALID(s.add("",U"text"));INVALID(s.search(U"---",0));CHECK(s.stats()==Pair(3,5));CHECK(s.erase("b"));CHECK(s.stats()==Pair(2,2));CHECK(!s.erase("b"));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
