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
if(!final){test::run("draft nested vectors are owned",[&]{Strings ingredients{"x"},steps{"mix"};RecipeDraft d("",ingredients,steps);ingredients[0]="bad";auto a=d.snapshot();CHECK(a.ingredients==Strings({"x"}));a.steps.clear();CHECK(d.snapshot().steps==Strings({"mix"}));});}
else{test::run("permissions immutable revisions rollback collisions and successful IDs",[&]{RecipeManager m;CHECK(m.add_user("w",{"write"}));CHECK(m.add_user("r",{"read"}));CHECK(!m.add("r","denied",{},{}));auto a=m.add("w","A",{"x","x"},{"one"});CHECK(a=="recipe1");CHECK(!m.get("w",*a));CHECK(m.update("w",*a,"B",{"y"},{"two"})==2);auto b=m.add("w","A",{"x"},{});CHECK(b=="recipe2");CHECK(!m.rollback("w",*a,1));CHECK(m.update("w",*b,"C",{},{} )==2);CHECK(m.rollback("w",*a,1)==3);CHECK(m.history("r",*a).size()==3);CHECK(m.get("r",*a,2)->name=="B");auto snap=m.get("r",*a);snap->ingredients.clear();CHECK(m.get("r",*a)->ingredients.size()==2);CHECK(m.by_ingredient("r","x")==Strings({*a}));INVALID(m.add("unknown","",{},{}));INVALID(m.add_user("r",{"admin"}));CHECK(!m.get("r",*a,0));CHECK(m.history("unknown",*a).empty());RecipeManager other;CHECK(other.add_user("w",{"write"}));CHECK(other.add("w","A",{},{} )=="recipe1");});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("latest-only ingredient ordering permissions and revision isolation",[&]{RecipeManager m;m.add_user("both",{"read","write","write"});m.add_user("none",{});auto a=m.add("both","B",{"x","x"},{}),b=m.add("both","A",{"x"},{});CHECK(m.by_ingredient("both","x")==Strings({*b,*a}));CHECK(m.by_ingredient("none","x").empty());CHECK(!m.add_user("both",{}));CHECK(m.get("both",*a)->name=="B");CHECK(m.update("both",*b,"A",{"z"},{} )==2);CHECK(m.by_ingredient("both","x")==Strings({*a}));auto h=m.history("both",*b);h[0].ingredients.clear();CHECK(m.get("both",*b,1)->ingredients==Strings({"x"}));CHECK(!m.get("both",*b,99));CHECK(!m.rollback("both",*b,0));CHECK(!m.update("none",*b,"new",{},{}));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
