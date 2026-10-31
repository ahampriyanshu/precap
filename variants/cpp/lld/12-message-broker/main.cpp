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
if(!final){test::run("FIFO lifetime duplicate registry and empty payloads",[&]{MessageQueue q;CHECK(q.publish("",""));CHECK(q.publish("b","payload"));CHECK(q.consume()==Message{"",""});CHECK(!q.publish("","new"));CHECK(q.consume()==Message{"b","payload"});CHECK(!q.consume());});}
else{test::run("independent offsets inflight repeat retry and dead letters",[&]{MessageBroker b(2);CHECK(b.publish("a","A"));CHECK(b.publish("b","B"));CHECK(b.subscribe("g"));CHECK(b.subscribe("h"));CHECK(!b.subscribe("g"));auto first=b.poll("g");CHECK(first==Delivery{"a","A",1});first->payload="bad";CHECK(b.poll("g")==Delivery{"a","A",1});CHECK(!b.ack("g","b"));CHECK(b.nack("g","a")=="retry");CHECK(!b.ack("g","a"));CHECK(b.poll("g")==Delivery{"a","A",2});CHECK(b.nack("g","a")=="dead-letter");CHECK(!b.nack("g","a"));CHECK(b.dead_letters("g")==Vec<DeadLetter>({{"a","A",2}}));CHECK(b.poll("h")==Delivery{"a","A",1});CHECK(b.ack("h","a"));CHECK(b.poll("g")==Delivery{"b","B",1});CHECK(b.ack("g","b"));CHECK(!b.poll("g"));CHECK(!b.publish("a","other"));CHECK(b.dead_letters("h").empty());auto dl=b.dead_letters("g");dl.clear();CHECK(b.dead_letters("g").size()==1);INVALID(MessageBroker(0));});}
 // ADDITIONAL_CONTRACTS
if(final){test::run("one-attempt DLQ order late subscribers and group snapshot isolation",[&]{MessageBroker b(1);CHECK(b.publish("",""));CHECK(b.publish("b","B"));CHECK(b.subscribe("a"));CHECK(b.poll("a")->id=="");CHECK(b.nack("a","")=="dead-letter");CHECK(b.poll("a")->id=="b");CHECK(b.nack("a","b")=="dead-letter");CHECK(b.dead_letters("a")==Vec<DeadLetter>({{"","",1},{"b","B",1}}));CHECK(b.subscribe("late"));CHECK(b.poll("late")==Delivery{"","",1});auto dl=b.dead_letters("a");dl[0].payload="bad";CHECK(b.dead_letters("a")[0].payload.empty());CHECK(!b.ack("unknown",""));CHECK(!b.nack("unknown",""));CHECK(!b.poll("unknown"));});}
 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
