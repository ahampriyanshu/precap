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
if(!final){test::run("record field overwrite prefix and empty values",[&]{RecordStore s;s.set("k","b","2");s.set("k","a","");CHECK(s.get("k","a")=="");CHECK(s.scan("k")==Vec<std::pair<std::string,std::string>>({{"a",""},{"b","2"}}));CHECK(s.scan("k","b").size()==1);auto snap=s.scan("k");snap.clear();CHECK(s.scan("k").size()==2);CHECK(!s.get("missing","a"));});}
else{test::run("TTL overwrite tombstones equal time and clock atomicity",[&]{TemporalDatabase d;d.set(1,"k","f","old");d.set(2,"k","f","new",2);CHECK(d.get(3,"k","f")=="new");CHECK(!d.get(4,"k","f"));CHECK(d.get_at(4,"k","f",1)=="old");CHECK(d.get_at(4,"k","f",2)=="new");CHECK(!d.compare_and_set(4,"k","f","old","bad"));INVALID(d.set(99,"k","f","bad",0));INVALID(d.get_at(99,"k","f",100));d.set(4,"k","f","");CHECK(d.get(4,"k","f")=="");CHECK(d.compare_and_set(4,"k","f","","same",1));CHECK(d.get_at(4,"k","f",4)=="same");CHECK(d.erase(4,"k","f"));CHECK(!d.get_at(4,"k","f",4));INVALID(d.get(3,"k","f"));CHECK(!d.erase(5,"none","x"));INVALID(d.get(4,"k","f"));TemporalDatabase other;CHECK(!other.get(0,"k","f"));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("TTL lifetime replacement scans equal-time writes and lookback",[&]{TemporalDatabase d;d.set(0,"","","");d.set(1,"k","b","short",1);d.set(1,"k","a","first");d.set(1,"k","a","last");CHECK(d.scan(1,"k")==Vec<std::pair<std::string,std::string>>({{"a","last"},{"b","short"}}));CHECK(d.compare_and_set(1,"k","b","short","permanent"));CHECK(d.get(2,"k","b")=="permanent");CHECK(d.get_at(2,"k","a",1)=="last");CHECK(d.scan(2,"k","b")==Vec<std::pair<std::string,std::string>>({{"b","permanent"}}));CHECK(d.get_at(2,"","",0)=="");INVALID(d.compare_and_set(100,"k","missing","x","y",0));CHECK(d.get(2,"k","a")=="last");});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
