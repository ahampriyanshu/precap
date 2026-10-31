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


inline Strings touch_order(const Strings& keys,const std::string& key) { throw std::logic_error("Not implemented"); }
class LRUCache { public:
 explicit LRUCache(Int capacity) { throw std::logic_error("Not implemented"); }
 void put(const std::string& key,Int value) { throw std::logic_error("Not implemented"); }
 Opt<Int> get(const std::string& key,Opt<Int> fallback=std::nullopt) { throw std::logic_error("Not implemented"); }
 bool erase(const std::string& key) { throw std::logic_error("Not implemented"); }
 Vec<std::pair<std::string,Int>> items() const { throw std::logic_error("Not implemented"); }
};

