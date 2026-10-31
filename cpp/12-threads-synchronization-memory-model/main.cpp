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
if(!final){test::run("sequential order empty inputs and callback propagation",[&]{Vec<Int>seen;CHECK(prototype({3,1,2},[&](Int v){seen.push_back(v);return v*2;})==Vec<Int>({6,2,4}));CHECK(seen==Vec<Int>({3,1,2}));CHECK(prototype({},[](Int){throw std::runtime_error("unused");return Int{};}).empty());test::raises<std::runtime_error>([&]{prototype({1},[](Int)->Int{throw std::runtime_error("callback");});});});}
else{test::run("background workers bounded execution exact once and ordering",[&]{Vec<Int>v(64);std::iota(v.begin(),v.end(),0);auto before=v;std::mutex m;std::set<std::thread::id>ids;Vec<Int>calls(64);auto caller=std::this_thread::get_id();auto out=solve(v,3,[&](Int x){std::lock_guard lock(m);ids.insert(std::this_thread::get_id());++calls[x];return 63-x;});CHECK(v==before);CHECK(!ids.contains(caller)&&!ids.empty()&&ids.size()<=3);for(Int i=0;i<64;++i){CHECK(out[i]==63-i);CHECK(calls[i]==1);}CHECK(solve({},2,[](Int){throw std::runtime_error("unused");return Int{};}).empty());INVALID(solve({},0,[](Int x){return x;}));CHECK(solve({7},99,[](Int x){return x+1;})==Vec<Int>({8}));});test::run("exception transported only after workers finish",[&]{std::atomic<Int>active{0};test::raises<std::runtime_error>([&]{solve({0,1,2,3},2,[&](Int x)->Int{active.fetch_add(1);struct Done{std::atomic<Int>& a;~Done(){a.fetch_sub(1);}}done{active};if(x==1)throw std::runtime_error("callback");return x;});});CHECK(active.load()==0);});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
