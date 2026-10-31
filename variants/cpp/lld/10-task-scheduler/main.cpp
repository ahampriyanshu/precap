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
if(!final){test::run("numeric priority ties and lifetime IDs",[&]{PriorityQueue q;CHECK(!q.pop());CHECK(q.add("old",2)==1);CHECK(q.add("high",9)==2);CHECK(q.add("tie",2)==3);CHECK(q.pop()==std::pair<Int,std::string>{2,"high"});CHECK(q.pop()==std::pair<Int,std::string>{1,"old"});CHECK(q.pop()==std::pair<Int,std::string>{3,"tie"});CHECK(q.add("next",0)==4);});}
else{test::run("lease expiry stale tokens capacity and invalid clock preservation",[&]{TaskScheduler s;CHECK(s.add_worker("w",1));CHECK(!s.add_worker("w",3));auto a=s.add_task("a",4),b=s.add_task("b",4);auto t=s.dispatch(0,"w",2);CHECK(t&&t->id==a&&t->token==1);CHECK(!s.dispatch(0,"w",2));INVALID(s.dispatch(99,"w",0));CHECK(s.active(1,"w").size()==1);auto next=s.dispatch(2,"w",3);CHECK(next&&next->id==a&&next->token==2);CHECK(!s.complete(2,a,1));CHECK(s.complete(2,a,2));auto done=s.get_task(2,a);CHECK(done&&done->status=="done"&&!done->worker&&!done->token&&!done->expires_at);auto tb=s.dispatch(2,"w",1);CHECK(tb&&tb->id==b&&tb->token==3);tb->status="corrupt";CHECK(s.get_task(2,b)->status=="running");CHECK(!s.complete(3,b,3));CHECK(s.get_task(3,b)->status=="pending");INVALID(s.active(2,"w"));CHECK(!s.dispatch(4,"unknown",1));INVALID(s.get_task(3,a));TaskScheduler other;CHECK(other.add_task("x",0)==1);});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("numeric IDs beyond nine separate worker quota and failed time advance",[&]{TaskScheduler s;s.add_worker("a",2);s.add_worker("b",1);for(Int i=0;i<12;++i)CHECK(s.add_task("same",0)==i+1);CHECK(s.dispatch(0,"a",5)->id==1);CHECK(s.dispatch(0,"a",5)->id==2);CHECK(!s.dispatch(0,"a",5));CHECK(s.dispatch(0,"b",5)->id==3);CHECK(s.active(0,"a").size()==2);CHECK(s.complete(0,1,1));CHECK(s.dispatch(0,"a",5)->id==4);CHECK(!s.get_task(5,999));CHECK(s.active(5,"a").empty());INVALID(s.get_task(4,1));auto t=s.dispatch(5,"b",1);CHECK(t&&t->id==2);CHECK(s.get_task(5,1)->status=="done");});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
