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
if(!final){test::run("touch recency without mutating caller",[&]{Strings a{"a","b"};CHECK(touch_order(a,"a")==Strings({"b","a"}));CHECK(a==Strings({"a","b"}));CHECK(touch_order({},"x")==Strings({"x"}));});}
else{test::run("hit refresh update eviction misses and zero capacity",[&]{LRUCache c(2);c.put("a",-1);c.put("b",2);CHECK(c.get("a")==-1);CHECK(c.get("missing",99)==99);c.put("c",3);CHECK(!c.get("b"));CHECK(c.items()==Vec<std::pair<std::string,Int>>({{"a",-1},{"c",3}}));c.put("a",4);CHECK(c.items().size()==2);CHECK(c.items().back().first=="a");auto snap=c.items();snap.clear();CHECK(c.items().size()==2);INVALID(c.put("",8));CHECK(c.erase("c"));CHECK(!c.erase("c"));LRUCache zero(0);zero.put("a",1);CHECK(zero.items().empty());INVALID(LRUCache(-1));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("bounded recency sequence compared to independent model",[&]{LRUCache c(3);Vec<std::pair<std::string,Int>>model;for(Int i=0;i<90;++i){auto key=std::to_string((i*7)%5);if(i%3){std::erase_if(model,[&](auto& p){return p.first==key;});model.emplace_back(key,-i);if(model.size()>3)model.erase(model.begin());c.put(key,-i);}else{auto it=std::find_if(model.begin(),model.end(),[&](auto& p){return p.first==key;});Opt<Int>expected;if(it!=model.end()){auto pair=*it;expected=pair.second;model.erase(it);model.push_back(pair);}CHECK(c.get(key)==expected);}CHECK(c.items()==model);}auto before=c.items();INVALID(c.get(""));INVALID(c.erase(""));CHECK(c.items()==before);LRUCache other(3);CHECK(other.items().empty());});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
