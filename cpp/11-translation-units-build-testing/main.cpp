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
if(!final){test::run("owned grammar comments empty values and first separator",[&]{CHECK(!prototype(" # comment"));CHECK(!prototype(" \t"));CHECK(prototype(" a = b=c ")==std::pair<std::string,std::string>{"a","b=c"});CHECK(prototype("empty=")==std::pair<std::string,std::string>{"empty",""});INVALID(prototype("missing"));INVALID(prototype("=x"));INVALID(prototype("bad key=x"));std::string s="a=x";auto p=prototype(s);s[2]='z';CHECK(p->second=="x");});}
else{test::run("batch duplicates ordering independent loads and input preservation",[&]{Strings lines{" z=1","# comment","a=","A=2"};auto before=lines;auto out=solve(lines);CHECK(out==std::map<std::string,std::string>({{"A","2"},{"a",""},{"z","1"}}));CHECK(lines==before);INVALID(solve(Strings{"a=1","a=2"}));INVALID(solve(Strings{"ok=1","bad key=2"}));CHECK(solve(Strings{}).empty());CHECK(solve(Strings{"a=new"}).at("a")=="new");});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
