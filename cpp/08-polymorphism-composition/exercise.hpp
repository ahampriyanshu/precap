#pragma once
#include <algorithm>
#include <atomic>
#include <chrono>
#include <cmath>
#include <concepts>
#include <condition_variable>
#include <cstddef>
#include <cstdint>
#include <deque>
#include <exception>
#include <functional>
#include <future>
#include <limits>
#include <list>
#include <map>
#include <memory>
#include <mutex>
#include <numeric>
#include <optional>
#include <queue>
#include <set>
#include <span>
#include <stdexcept>
#include <string>
#include <string_view>
#include <thread>
#include <tuple>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <variant>
#include <vector>
using Int = long long;
using Text = std::u32string;
template<class T> using Vec = std::vector<T>;
template<class T> using Opt = std::optional<T>;
using Strings = Vec<std::string>;
using Pair = std::pair<Int,Int>;
using Edge = std::tuple<Int,Int,Int>;
using Command = std::tuple<std::string,Int,Int>;

struct Operation {virtual ~Operation()=default;virtual Int apply(Int value) const=0;};
struct Add final:Operation {Int delta;explicit Add(Int delta):delta(delta){} Int apply(Int value)const override{return value+delta;}};
struct Multiply final:Operation {Int factor;explicit Multiply(Int factor):factor(factor){} Int apply(Int value)const override{return value*factor;}};
inline Int prototype(const Operation& operation,Int value) { throw std::logic_error("Not implemented"); }
class Pipeline { public:
Pipeline() { throw std::logic_error("Not implemented"); }
void add(std::unique_ptr<Operation> operation) { throw std::logic_error("Not implemented"); }
Int run(Int value) const { throw std::logic_error("Not implemented"); }
Int size() const { throw std::logic_error("Not implemented"); }
};

