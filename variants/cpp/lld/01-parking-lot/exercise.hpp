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

struct Ticket {Int ticket_id;std::string vehicle_id,vehicle_kind,spot_id;bool operator==(const Ticket&)const=default;};
inline Opt<std::string> choose_spot(const Vec<std::pair<std::string,std::string>>& spots,const std::string& kind) { throw std::logic_error("Not implemented"); }
class ParkingLot { public:
 explicit ParkingLot(Vec<std::pair<std::string,std::string>> spots) { throw std::logic_error("Not implemented"); }
 Opt<Ticket> park(const std::string& id,const std::string& kind) { throw std::logic_error("Not implemented"); }
 Opt<Ticket> release(Int id) { throw std::logic_error("Not implemented"); }
 Vec<Ticket> active_tickets() const { throw std::logic_error("Not implemented"); }
 Vec<std::pair<std::string,std::string>> available_spots() const { throw std::logic_error("Not implemented"); }
};

