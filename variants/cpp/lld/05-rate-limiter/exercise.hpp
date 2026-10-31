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


inline std::pair<bool,Vec<Int>> allow_request(const Vec<Int>& recent,Int limit,Int window,Int now) { throw std::logic_error("Not implemented"); }
class SlidingWindowLimiter { public:
 SlidingWindowLimiter(Int limit,Int window) { throw std::logic_error("Not implemented"); }
 bool allow(const std::string& client,Int now) { throw std::logic_error("Not implemented"); }
 Vec<Int> history(const std::string& client) const { throw std::logic_error("Not implemented"); }
};

