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

struct Loan {std::string copy_id,title,member_id;bool operator==(const Loan&)const=default;};
inline Strings available_copies(const Vec<std::tuple<std::string,std::string,bool>>& copies,const std::string& title) { throw std::logic_error("Not implemented"); }
class Library { public:
 explicit Library(const Vec<std::pair<std::string,std::string>>& copies) { throw std::logic_error("Not implemented"); }
 Opt<std::string> borrow(const std::string& member,const std::string& title) { throw std::logic_error("Not implemented"); }
 bool return_copy(const std::string& id,const std::string& member) { throw std::logic_error("Not implemented"); }
 Strings available(const std::string& title) const { throw std::logic_error("Not implemented"); }
 Vec<Loan> loans() const { throw std::logic_error("Not implemented"); }
};

