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
if(!final){test::run("account conservation and rejected withdrawals",[&]{BalanceAccount a;CHECK(a.balance()==0);CHECK(a.deposit(10)==10);CHECK(!a.withdraw(11));CHECK(a.balance()==10);CHECK(a.withdraw(4));INVALID(a.deposit(0));INVALID(a.withdraw(-1));CHECK(a.balance()==6);BalanceAccount b;CHECK(b.balance()==0);});}
else{test::run("transfer replay original response conflict and ranking",[&]{Bank b;CHECK(b.create_account("a"));CHECK(b.create_account("b"));CHECK(!b.create_account("a"));CHECK(b.deposit("a",10)==10);CHECK(!b.transfer("retry","a","b",20));CHECK(b.deposit("a",10)==20);CHECK(b.transfer("retry","a","b",20)==Pair(0,20));b.deposit("a",5);CHECK(b.transfer("retry","a","b",20)==Pair(0,20));INVALID(b.transfer("retry","a","b",1));CHECK(b.balance("a")==5&&b.balance("b")==20);CHECK(b.top_spenders(2)==Vec<std::pair<std::string,Int>>({{"a",20},{"b",0}}));INVALID(b.deposit("missing",0));CHECK(!b.balance("missing"));CHECK(!b.transfer("self","a","a",1));INVALID(b.top_spenders(-1));Bank other;CHECK(!other.balance("a"));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("all transfer preconditions preserve funds and failed IDs remain reusable",[&]{Bank b;b.create_account("a");b.create_account("b");b.deposit("a",10);CHECK(!b.transfer("r","a","missing",3));CHECK(!b.transfer("r","a","b",11));CHECK(!b.transfer("r","a","a",3));INVALID(b.transfer("r","a","b",0));CHECK(b.balance("a")==10&&b.balance("b")==0);CHECK(b.transfer("r","a","b",3)==Pair(7,3));CHECK(b.top_spenders(0).empty());auto ranking=b.top_spenders(9);ranking.clear();CHECK(b.top_spenders(9).size()==2);INVALID(b.create_account(""));INVALID(b.balance(""));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
