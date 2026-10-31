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
if(!final){test::run("CRUD empty keys values and independent instances",[&]{KeyValueStore a,b;a.set("","");CHECK(a.get("")=="");CHECK(!b.get(""));a.set("","x");CHECK(a.get("")=="x");CHECK(a.erase(""));CHECK(!a.erase(""));CHECK(!a.get(""));});}
else{test::run("inner commit remains rollbackable and snapshots own data",[&]{TransactionalStore s;s.set("a","base");CHECK(s.begin()==1);s.set("a","outer");CHECK(s.begin()==2);s.erase("a");s.set("b","");CHECK(s.commit()==1);CHECK(!s.get("a"));CHECK(s.get("b")=="");CHECK(s.rollback()==0);CHECK(s.get("a")=="base");CHECK(!s.get("b"));CHECK(s.begin()==1);s.set("aa","next");CHECK(s.commit()==0);auto snap=s.snapshot("a");CHECK(snap.size()==2);snap.clear();CHECK(s.snapshot().size()==2);test::raises<std::logic_error>([&]{s.commit();});test::raises<std::logic_error>([&]{s.rollback();});CHECK(s.depth()==0);TransactionalStore other;CHECK(other.snapshot().empty());});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("three nested boundaries close one frame and parent deletion stays hidden",[&]{TransactionalStore s;s.set("","");s.set("a","base");CHECK(s.begin()==1);s.set("a","outer");CHECK(s.begin()==2);CHECK(s.erase("a"));CHECK(s.begin()==3);s.set("b","inner");CHECK(s.rollback()==2);CHECK(!s.get("a")&&!s.get("b"));CHECK(s.commit()==1);CHECK(!s.get("a"));CHECK(s.rollback()==0);CHECK(s.get("a")=="base");CHECK(s.get("")=="");CHECK(s.snapshot("a")==std::map<std::string,std::string>({{"a","base"}}));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
