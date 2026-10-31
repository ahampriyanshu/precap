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
if(!final){test::run("smallest compatible and identifier order",[&]{Vec<std::pair<std::string,std::string>>s{{"z","car"},{"b","motorcycle"},{"a","car"}};auto before=s;CHECK(choose_spot(s,"car")=="a");CHECK(choose_spot(s,"motorcycle")=="b");CHECK(!choose_spot(s,"van"));CHECK(s==before);INVALID(choose_spot({{"a","car"},{"a","van"}},"car"));INVALID(choose_spot({{"x","invalid"}},"car"));CHECK(!choose_spot({},"car"));});}
else {test::run("allocation release snapshots and failed ticket numbering",[&]{Vec<std::pair<std::string,std::string>>s{{"c","car"},{"v","van"}};ParkingLot p(s);s.clear();auto a=p.park("a","car");CHECK(a&&a->ticket_id==1&&a->spot_id=="c");INVALID(p.park("a","car"));auto b=p.park("b","van");CHECK(b&&b->ticket_id==2);CHECK(!p.park("c","car"));a->vehicle_id="corrupt";CHECK(p.active_tickets()[0].vehicle_id=="a");CHECK(p.release(1)->vehicle_id=="a");CHECK(!p.release(1));auto c=p.park("c","car");CHECK(c&&c->ticket_id==3);CHECK(p.available_spots().empty());ParkingLot other({});CHECK(other.active_tickets().empty());INVALID(p.park("","car"));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("validation scans entire inventory and ticket snapshots remain independent",[&]{INVALID(ParkingLot({{"a","car"},{"z","bad"}}));ParkingLot a({{"a","car"},{"b","car"}}),b({{"a","car"}});auto t=a.park("v","car");CHECK(t&&t->ticket_id==1);CHECK(b.park("v","car")->ticket_id==1);auto active=a.active_tickets();active[0].spot_id="b";CHECK(a.active_tickets()[0].spot_id=="a");auto free=a.available_spots();free.clear();CHECK(a.available_spots().size()==1);INVALID(a.park("next","invalid"));CHECK(a.park("next","car")->ticket_id==2);CHECK(a.release(1)->spot_id=="a");CHECK(a.park("v","car")->ticket_id==3);});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
