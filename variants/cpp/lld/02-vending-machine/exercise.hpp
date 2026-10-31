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

struct Product {Int price,stock;bool operator==(const Product&)const=default;};
struct Sale {std::string code;Int change;bool operator==(const Sale&)const=default;};
inline Int change_due(Int price,Int paid) { throw std::logic_error("Not implemented"); }
class VendingMachine { public:
 explicit VendingMachine(const Vec<std::tuple<std::string,Int,Int>>& products) { throw std::logic_error("Not implemented"); }
 Int insert(Int amount) { throw std::logic_error("Not implemented"); }
 Int balance() const { throw std::logic_error("Not implemented"); }
 Sale select(const std::string& code) { throw std::logic_error("Not implemented"); }
 Int refund() { throw std::logic_error("Not implemented"); }
 std::map<std::string,Product> inventory() const { throw std::logic_error("Not implemented"); }
};

