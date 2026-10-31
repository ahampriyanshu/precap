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

struct ReservationSnapshot {Int capacity,used;bool operator==(const ReservationSnapshot&)const=default;};
class Stock { public:
explicit Stock(Int capacity) { throw std::logic_error("Not implemented"); }
bool reserve(Int amount) { throw std::logic_error("Not implemented"); }
void release(Int amount) { throw std::logic_error("Not implemented"); }
ReservationSnapshot snapshot() const { throw std::logic_error("Not implemented"); }
};
inline ReservationSnapshot prototype(Int capacity,const Vec<Int>& reservations) { throw std::logic_error("Not implemented"); }
inline ReservationSnapshot solve(Stock& stock,Int amount,bool fail_inside) { throw std::logic_error("Not implemented"); }

