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
if(!final){test::run("exact cents sorted remainder duplicate validation and copies",[&]{Strings p{"c","a","b"};CHECK(split_equal(1000,p)==std::map<std::string,Int>({{"a",334},{"b",333},{"c",333}}));CHECK(p==Strings({"c","a","b"}));CHECK(split_equal(0,{"a"}).at("a")==0);INVALID(split_equal(1,{}));INVALID(split_equal(2,{"a","a"}));INVALID(split_equal(-1,{"a"}));});}
else{test::run("zero-sum canonical retries bounded settlements and nonmutating plan",[&]{ExpenseSharing s({"c","a","b"});CHECK(s.add_expense("e","c",1000,{"b","a","c"}));CHECK(!s.add_expense("e","c",1000,{"a","b","c"}));auto expected=std::map<std::string,Int>{{"a",-334},{"b",-333},{"c",667}};CHECK(s.balances()==expected);INVALID(s.add_expense("e","c",999,{"a","b","c"}));INVALID(s.settle("bad","a","c",335));CHECK(s.balances()==expected);auto plan=s.suggest_settlements();CHECK(plan==Vec<std::tuple<std::string,std::string,Int>>({{"a","c",334},{"b","c",333}}));CHECK(s.balances()==expected);CHECK(s.settle("p","a","c",334));CHECK(!s.settle("p","a","c",334));INVALID(s.add_expense("p","c",1,{"a"}));CHECK(s.settle("q","b","c",333));CHECK(s.suggest_settlements().empty());auto snap=s.balances();snap["a"]=99;CHECK(s.balances().at("a")==0);INVALID(ExpenseSharing({"a","a"}));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("payer excluded participants failed IDs retry and shared namespace",[&]{ExpenseSharing s({"a","b","c"});INVALID(s.add_expense("retry","a",10,{"b","b"}));CHECK(s.add_expense("retry","a",10,{"b","c"}));CHECK(s.balances()==std::map<std::string,Int>({{"a",10},{"b",-5},{"c",-5}}));INVALID(s.settle("pay","b","a",6));CHECK(s.settle("pay","b","a",5));CHECK(!s.settle("pay","b","a",5));INVALID(s.add_expense("pay","a",5,{"b"}));CHECK(s.suggest_settlements()==Vec<std::tuple<std::string,std::string,Int>>({{"c","a",5}}));CHECK(s.add_expense("self","c",1,{"c"}));Int sum=0;for(auto& [id,v]:s.balances()){(void)id;sum+=v;}CHECK(sum==0);INVALID(s.settle("bad","a","c",1));INVALID(s.add_expense("bad","a",0,{"b"}));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
