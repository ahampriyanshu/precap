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

struct Node { Int value;std::unique_ptr<Node> next;explicit Node(Int value):value(value){} };
inline std::unique_ptr<Node> detach(std::unique_ptr<Node>,const std::set<Int>&) { throw std::logic_error("Not implemented"); }
Vec<Int> prototype(const Vec<Int>& values,const Vec<Int>& blocked) { throw std::logic_error("Not implemented"); }
Vec<Int> solve(const Vec<Int>& values,const Vec<Int>& blocked) { throw std::logic_error("Not implemented"); }
