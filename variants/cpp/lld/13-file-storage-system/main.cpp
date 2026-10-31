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
if(!final){test::run("unique zero-byte catalog validation",[&]{FileCatalog c;CHECK(c.upload("a",0));CHECK(!c.upload("a",5));CHECK(c.get("a")==0);CHECK(!c.get("missing"));INVALID(c.upload("",1));INVALID(c.upload("bad",-1));});}
else{test::run("quota atomic failures exact expiry absolute copy and ordering",[&]{FileStorage s(10);CHECK(s.upload("a",3,5));CHECK(s.upload("b",4));CHECK(!s.upload("large",4));CHECK(s.copy("a","c"));CHECK(s.usage()==10);s.advance_to(2);CHECK(s.get("c")->expires_at==5);CHECK(s.search("",2)[0].name=="b");CHECK(!s.copy("a","a"));INVALID(s.upload("a",1,0));INVALID(s.advance_to(1));CHECK(s.usage()==10);s.advance_to(5);CHECK(!s.get("a")&&!s.get("c"));CHECK(s.usage()==4);CHECK(s.upload("a",6));CHECK(s.erase("b"));CHECK(!s.erase("b"));CHECK(s.usage()==6);auto f=s.get("a");f->size=99;CHECK(s.get("a")->size==6);INVALID(s.search("",-1));FileStorage zero(0);CHECK(zero.upload("zero",0));CHECK(!zero.upload("x",1));INVALID(FileStorage(-1));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("expiry at equal time name reuse zero sizes and search snapshots",[&]{FileStorage s(5);s.upload("z",0,1);s.upload("b",2);s.upload("a",2);CHECK(s.search("",10)[0].name=="a");CHECK(s.search("",0).empty());s.advance_to(1);CHECK(!s.get("z"));CHECK(s.upload("z",1,1));CHECK(s.usage()==5);CHECK(!s.copy("z","copy"));CHECK(!s.copy("missing","copy"));INVALID(s.copy("missing",""));auto list=s.search("");list[0].size=99;CHECK(s.usage()==5);s.advance_to(2);CHECK(s.usage()==4);s.advance_to(2);CHECK(s.usage()==4);CHECK(s.upload("z",1));CHECK(s.get("z")&&!s.get("z")->expires_at);});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
