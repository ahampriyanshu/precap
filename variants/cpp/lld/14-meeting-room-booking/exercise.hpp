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

struct Reservation {std::string id;Int start,end,seats;bool operator==(const Reservation&)const=default;};
class RoomCalendar { public:
 RoomCalendar() { throw std::logic_error("Not implemented"); }
 bool reserve(Int start,Int end) { throw std::logic_error("Not implemented"); }
 Vec<Pair> slots() const { throw std::logic_error("Not implemented"); }
};
class MeetingRoomBooking { public:
 explicit MeetingRoomBooking(std::map<std::string,Int> rooms) { throw std::logic_error("Not implemented"); }
 Opt<Strings> book(const std::string& id,Int start,Int end,Int seats,Int room_count=1) { throw std::logic_error("Not implemented"); }
 bool cancel(const std::string& id) { throw std::logic_error("Not implemented"); }
 Opt<Strings> allocation(const std::string& id) const { throw std::logic_error("Not implemented"); }
 Vec<Reservation> schedule(const std::string& room) const { throw std::logic_error("Not implemented"); }
};

