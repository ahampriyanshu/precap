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
if(!final){test::run("change validation and exact payment",[&]{CHECK(change_due(3,8)==5);CHECK(change_due(0,0)==0);INVALID(change_due(3,2));INVALID(change_due(-1,4));INVALID(change_due(0,-1));});}
else{test::run("atomic sale credit stock and copies",[&]{Vec<std::tuple<std::string,Int,Int>> input{{"a",3,1},{"b",5,0}};VendingMachine v(input);input.clear();CHECK(v.insert(2)==2);INVALID(v.select("a"));CHECK(v.balance()==2&&v.inventory().at("a").stock==1);test::raises<std::out_of_range>([&]{v.select("unknown");});CHECK(v.insert(4)==6);CHECK(v.select("a")==Sale{"a",3});CHECK(v.balance()==0);CHECK(v.insert(8)==8);INVALID(v.select("a"));INVALID(v.select("b"));INVALID(v.insert(0));CHECK(v.refund()==8);CHECK(v.refund()==0);auto inv=v.inventory();inv["a"].stock=9;CHECK(v.inventory().at("a").stock==0);VendingMachine other({});CHECK(other.balance()==0);INVALID(VendingMachine({{"a",1,1},{"a",2,1}}));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("catalog validation exact money conservation and independent products",[&]{INVALID(VendingMachine({{"",1,0}}));INVALID(VendingMachine({{"a",0,0}}));INVALID(VendingMachine({{"a",1,-1}}));VendingMachine a({{"a",3,2},{"b",4,1}}),b({{"a",3,2}});Int paid=0,cost=0,change=0;for(Int i=0;i<2;++i){paid+=a.insert(5);auto sale=a.select("a");cost+=3;change+=sale.change;}CHECK(paid==cost+change+a.balance());CHECK(a.inventory().at("b").stock==1);CHECK(b.inventory().at("a").stock==2);});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
