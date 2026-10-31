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
if(!final){test::run("byte counts include NUL high bytes and duplicates",[&]{std::string s("a\0a\xFF",4);auto c=prototype(s);CHECK(c.size()==3);CHECK(c.at('a')==2);CHECK(c.at(0)==1);CHECK(c.at(255)==1);CHECK(prototype("").empty());});}
else{test::run("owned scalar decoding and supplementary boundaries",[&]{CHECK(solve("").empty());CHECK(solve("A\xC3\xA9\xF0\x9F\x98\x80")==U"Aé😀");CHECK(solve(std::string("a\0b",3))==Text({U'a',0,U'b'}));CHECK(solve("\xF4\x8F\xBF\xBF")==Text({0x10FFFF}));CHECK(solve("e\xCC\x81")==U"é");std::string s="abc";auto out=solve(s);s[0]='z';CHECK(out==U"abc");});test::run("malformed encodings fail instead of replacing",[&]{for(auto s:{"\x80","\xC0\xAF","\xE0\x80\x80","\xED\xA0\x80","\xF4\x90\x80\x80","\xF5\x80\x80\x80","\xC2","\xE2\x82","\xC2x"})INVALID(solve(s));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
