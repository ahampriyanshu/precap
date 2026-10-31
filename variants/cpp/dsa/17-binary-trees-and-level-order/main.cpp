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
 auto shape=[](const std::shared_ptr<Tree>& root){
 Vec<std::tuple<const Tree*,Text,const Tree*,const Tree*>> result;
 Vec<const Tree*> stack;if(root)stack.push_back(root.get());std::set<const Tree*>seen;
 while(!stack.empty()){auto p=stack.back();stack.pop_back();CHECK(seen.insert(p).second);result.emplace_back(p,p->name,p->left.get(),p->right.get());if(p->right)stack.push_back(p->right.get());if(p->left)stack.push_back(p->left.get());}
 return result;};
 auto fn=final ? solve : prototype;
 test::run("uneven tree",[&]{
  auto a0=tree(U"hub",tree(U"west",nullptr,tree(U"cold",nullptr,nullptr)),tree(U"east",nullptr,nullptr)); auto before0=a0; auto shape_before=shape(a0);
  CHECK(fn(a0) == Vec<Vec<Text>>{Vec<Text>{U"hub"},Vec<Text>{U"west",U"east"},Vec<Text>{U"cold"}});
  CHECK(a0 == before0); CHECK(shape(a0)==shape_before);
 });
 test::run("empty tree",[&]{
  auto a0=nullptr; auto before0=a0; auto shape_before=shape(a0);
  CHECK(fn(a0) == Vec<Vec<Text>>{});
  CHECK(a0 == before0); CHECK(shape(a0)==shape_before);
 });
 test::run("one node",[&]{
  auto a0=tree(U"root",nullptr,nullptr); auto before0=a0; auto shape_before=shape(a0);
  CHECK(fn(a0) == Vec<Vec<Text>>{Vec<Text>{U"root"}});
  CHECK(a0 == before0); CHECK(shape(a0)==shape_before);
 });
 test::run("right chain",[&]{
  auto a0=tree(U"a",nullptr,tree(U"b",nullptr,tree(U"c",nullptr,nullptr))); auto before0=a0; auto shape_before=shape(a0);
  CHECK(fn(a0) == Vec<Vec<Text>>{Vec<Text>{U"a"},Vec<Text>{U"b"},Vec<Text>{U"c"}});
  CHECK(a0 == before0); CHECK(shape(a0)==shape_before);
 });
 if(final) {
 }

 std::cout << test::assertions << " checks in " << test::suites << " named cases; " << test::failures << " failures\n";
 return test::failures || test::assertions==0 || test::suites==0 ? 1 : 0;
}
