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

struct Task {Int id;std::string name;Int priority;std::string status;Opt<std::string> worker;Opt<Int> expires_at,token;bool operator==(const Task&)const=default;};
class PriorityQueue { public:
 PriorityQueue() { throw std::logic_error("Not implemented"); }
 Int add(const std::string& name,Int priority) { throw std::logic_error("Not implemented"); }
 Opt<std::pair<Int,std::string>> pop() { throw std::logic_error("Not implemented"); }
};
class TaskScheduler { public:
 TaskScheduler() { throw std::logic_error("Not implemented"); }
 Int add_task(const std::string& name,Int priority) { throw std::logic_error("Not implemented"); }
 bool add_worker(const std::string& id,Int capacity) { throw std::logic_error("Not implemented"); }
 Opt<Task> dispatch(Int ts,const std::string& worker,Int lease) { throw std::logic_error("Not implemented"); }
 bool complete(Int ts,Int id,Int token) { throw std::logic_error("Not implemented"); }
 Opt<Task> get_task(Int ts,Int id) { throw std::logic_error("Not implemented"); }
 Vec<Task> active(Int ts,const std::string& worker) { throw std::logic_error("Not implemented"); }
};

