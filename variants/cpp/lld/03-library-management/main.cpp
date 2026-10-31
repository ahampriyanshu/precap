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
if(!final){test::run("exact title free copies and input ownership",[&]{Vec<std::tuple<std::string,std::string,bool>>c{{"z","T",true},{"a","T",true},{"b","T",false},{"c","t",true}};auto before=c;CHECK(available_copies(c,"T")==Strings({"a","z"}));CHECK(available_copies(c,"missing").empty());CHECK(c==before);});}
else{test::run("owner checked loan lifecycle and isolated snapshots",[&]{Library l({{"b","T"},{"a","T"}});CHECK(l.borrow("m","T")=="a");CHECK(l.borrow("n","T")=="b");INVALID(l.borrow("m","T"));INVALID(l.return_copy("a","n"));CHECK(l.available("T").empty());auto snap=l.loans();snap[0].member_id="bad";CHECK(l.loans()[0].member_id=="m");CHECK(l.return_copy("a","m"));CHECK(!l.return_copy("a","m"));CHECK(l.borrow("m","T")=="a");CHECK(!l.borrow("x","missing"));INVALID(l.available(""));Library other({});CHECK(other.loans().empty());INVALID(Library({{"a","T"},{"a","U"}}));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("constructor ownership empty IDs and case-sensitive availability",[&]{Vec<std::pair<std::string,std::string>>input{{"a","T"},{"b","t"}};Library l(input);input[0].second="changed";CHECK(l.available("T")==Strings({"a"}));CHECK(l.available("t")==Strings({"b"}));CHECK(l.available("missing").empty());INVALID(l.borrow("","T"));INVALID(l.return_copy("","member"));CHECK(l.loans().empty());CHECK(!l.return_copy("unknown","member"));INVALID(Library({{"","T"}}));INVALID(Library({{"a",""}}));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
