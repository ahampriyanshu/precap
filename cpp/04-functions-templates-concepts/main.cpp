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
static_assert(ArithmeticInteger<int> && ArithmeticInteger<unsigned> && !ArithmeticInteger<bool> && !ArithmeticInteger<double>);
if(!final){test::run("signed checked addition endpoints",[&]{CHECK(prototype(2,-3)==-1);CHECK(prototype(std::numeric_limits<Int>::max(),0)==std::numeric_limits<Int>::max());CHECK(!prototype(std::numeric_limits<Int>::max(),1));CHECK(!prototype(std::numeric_limits<Int>::min(),-1));CHECK(prototype(std::numeric_limits<Int>::min(),1)==std::numeric_limits<Int>::min()+1);});}
else{test::run("generic signed unsigned and narrow representations",[&]{CHECK(solve<int>(4,-7)==-3);CHECK(!solve<int>(std::numeric_limits<int>::max(),1));CHECK(!solve<Int>(std::numeric_limits<Int>::min(),-1));CHECK(solve<unsigned>(0,0)==0u);CHECK(!solve<unsigned>(std::numeric_limits<unsigned>::max(),1));CHECK(solve<unsigned char>(250,5)==static_cast<unsigned char>(255));CHECK(!solve<unsigned char>(250,6));CHECK(solve<signed char>(-100,10)==static_cast<signed char>(-90));CHECK(!solve<signed char>(-128,-1));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
