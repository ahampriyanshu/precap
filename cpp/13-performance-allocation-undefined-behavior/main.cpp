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
if(!final){test::run("stable copied nonnegative values including zero",[&]{Vec<Int>v{-1,2,0,-3,2};auto before=v;CHECK(prototype(v)==Vec<Int>({2,0,2}));CHECK(v==before);CHECK(prototype({}).empty());CHECK(prototype({-1,-2}).empty());});}
else{test::run("linear stable compaction retains allocation and capacity",[&]{Vec<Int>v{-1,2,0,-3,2};v.reserve(100);auto ptr=v.data();auto cap=v.capacity();CHECK(solve(v)==2);CHECK(v==Vec<Int>({2,0,2}));CHECK(v.data()==ptr&&v.capacity()==cap);CHECK(solve(v)==0);v.assign({-1,-2});CHECK(solve(v)==2);CHECK(v.empty()&&v.capacity()==cap&&v.data()==ptr);CHECK(solve(v)==0);Vec<Int>empty;CHECK(solve(empty)==0);Vec<Int>large(10000);for(std::size_t i=0;i<large.size();++i)large[i]=i%2?-1:(Int)i;auto old=large.data();CHECK(solve(large)==5000);CHECK(large.size()==5000&&large.data()==old);for(std::size_t i=0;i<large.size();++i)CHECK(large[i]==(Int)(i*2));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
