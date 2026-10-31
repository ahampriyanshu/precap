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


inline std::map<std::string,Int> split_equal(Int total,Strings participants) { throw std::logic_error("Not implemented"); }
class ExpenseSharing { public:
 explicit ExpenseSharing(const Strings& members) { throw std::logic_error("Not implemented"); }
 bool add_expense(const std::string& id,const std::string& payer,Int total,Strings participants) { throw std::logic_error("Not implemented"); }
 bool settle(const std::string& id,const std::string& debtor,const std::string& creditor,Int amount) { throw std::logic_error("Not implemented"); }
 std::map<std::string,Int> balances() const { throw std::logic_error("Not implemented"); }
 Vec<std::tuple<std::string,std::string,Int>> suggest_settlements() const { throw std::logic_error("Not implemented"); }
};

