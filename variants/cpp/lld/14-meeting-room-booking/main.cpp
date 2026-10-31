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
if(!final){test::run("half-open adjacency overlap shapes sorted copies",[&]{RoomCalendar c;CHECK(c.reserve(10,20));CHECK(c.reserve(20,30));CHECK(!c.reserve(12,18));CHECK(!c.reserve(0,40));CHECK(c.reserve(0,5));INVALID(c.reserve(7,7));INVALID(c.reserve(-1,2));auto a=c.slots();CHECK(a==Vec<Pair>({{0,5},{10,20},{20,30}}));a.clear();CHECK(c.slots().size()==3);});}
else{test::run("deterministic all-or-none allocation cancellation and ID history",[&]{std::map<std::string,Int> rooms{{"B",4},{"A",4},{"C",8}};MeetingRoomBooking m(rooms);rooms.clear();CHECK(m.book("a",10,20,4,2)==Strings({"A","B"}));CHECK(!m.book("retry",10,20,4,2));CHECK(m.schedule("C").empty());CHECK(m.book("single",10,20,5)==Strings({"C"}));CHECK(m.book("adjacent",20,30,4)==Strings({"A"}));CHECK(m.cancel("a"));CHECK(!m.cancel("a"));CHECK(!m.book("a",0,1,1));CHECK(m.book("retry",10,20,4,2)==Strings({"A","B"}));auto a=m.allocation("retry");a->clear();CHECK(m.allocation("retry")->size()==2);INVALID(m.book("retry",1,1,1));INVALID(m.schedule("unknown"));CHECK(m.schedule("A")[0].id=="retry");MeetingRoomBooking empty({});CHECK(!empty.book("x",0,1,1));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("failed IDs retry capacity per room and cancellation only its booking",[&]{MeetingRoomBooking m({{"a",2},{"b",4}});CHECK(!m.book("retry",0,5,5));CHECK(m.book("retry",0,5,2)==Strings({"a"}));CHECK(m.book("second",0,5,2)==Strings({"b"}));CHECK(!m.book("partial",0,5,1,2));CHECK(m.cancel("retry"));CHECK(m.schedule("b").size()==1);CHECK(!m.allocation("retry"));CHECK(!m.book("retry",5,6,1));CHECK(m.book("partial",5,6,1,2)==Strings({"a","b"}));INVALID(m.book("partial",-1,6,1));CHECK(m.allocation("partial")->size()==2);INVALID(MeetingRoomBooking({{"bad",0}}));INVALID(MeetingRoomBooking({{"",1}}));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
